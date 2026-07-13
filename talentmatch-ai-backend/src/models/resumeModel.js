const { sql, getPool } = require("../config/db");
const { getResumeContainerClient } = require("../config/blobStorage");
const { extractTextFromResume } = require("../services/documentTextExtraction");
const { extractStructuredData } = require("../services/resumeExtractor");
const { addSkillToCandidate } = require("./skillModel");
const { addLanguageToCandidate } = require("./languageModel");
const certificationModel = require("./certificationModel");
const { saveExtractedText } = require("./resumeExtractionModel");
const notificationModel = require("./notificationModel");
const { trackEvent } = require("../utils/telemetry");
const { toConfidenceLabel } = require("../utils/confidenceLabel");

function buildBlobName(candidateId, originalFileName) {
  const safeName = originalFileName.replace(/[^a-zA-Z0-9.\-_]/g, "_");
  return `candidate-${candidateId}/${Date.now()}-${safeName}`;
}

async function uploadResumeFile(candidateId, file) {
  const containerClient = await getResumeContainerClient();
  const blobName = buildBlobName(candidateId, file.originalname);
  const blockBlobClient = containerClient.getBlockBlobClient(blobName);

  await blockBlobClient.uploadData(file.buffer, {
    blobHTTPHeaders: { blobContentType: file.mimetype },
  });

  return blockBlobClient.url;
}

/**
 * Rule-based "completeness" score — reflects how much structured
 * information could be confidently pulled out, not resume quality. A
 * sparse or unusually-formatted resume scores low here even if it belongs
 * to a strong candidate.
 */
function computeCompletenessScore(extracted) {
  let score = 30;
  if (extracted.email) score += 8;
  if (extracted.phone) score += 7;
  if (extracted.linkedInUrl) score += 5;
  score += Math.min(extracted.skills.length * 3, 20);
  score += Math.min(extracted.certifications.length * 5, 10);
  score += Math.min(extracted.education.length * 7, 10);
  score += Math.min(extracted.experience.length * 5, 10);
  return Math.min(score, 100);
}

/**
 * Inserts newly-found Education entries as VerificationStatus='Pending' —
 * skips anything that closely matches an entry the candidate already has
 * (manually entered or from a prior parse), so re-uploading the same
 * resume doesn't duplicate every entry each time.
 */
/**
 * Confidence-gated auto-verification: high-confidence extractions
 * (>=80, meaning a clear section match, a real institution/company name,
 * and a clean title/company split) are marked Verified immediately —
 * no manual click needed. Lower-confidence extractions still start as
 * Pending, because those are precisely the ones capable of containing
 * garbage like "Not detected — please edit" if trusted blindly. This is
 * a deliberate middle ground: fully removing verification would let a bad
 * split silently corrupt both the candidate's profile and their match
 * score without them ever seeing it happen.
 */
const AUTO_VERIFY_CONFIDENCE_THRESHOLD = 80;

async function insertNewEducationEntries(pool, candidateId, extractedEducation) {
  const existing = await pool
    .request()
    .input("CandidateId", sql.Int, candidateId)
    .query("SELECT Degree FROM Educations WHERE CandidateId = @CandidateId");
  const existingDegrees = new Set(existing.recordset.map((r) => r.Degree.trim().toLowerCase()));

  const inserted = [];
  for (const edu of extractedEducation) {
    const key = edu.degree.trim().toLowerCase();
    if (existingDegrees.has(key)) continue;

    const result = await pool
      .request()
      .input("CandidateId", sql.Int, candidateId)
      .input("Institution", sql.NVarChar(200), edu.institution || "Not detected — please edit")
      .input("Degree", sql.NVarChar(150), edu.degree.slice(0, 150))
      .input("ConfidenceScore", sql.Int, edu.confidence)
      .input("VerificationStatus", sql.NVarChar(20), edu.confidence >= AUTO_VERIFY_CONFIDENCE_THRESHOLD ? "Verified" : "Pending")
      .query(`
        INSERT INTO Educations (CandidateId, Institution, Degree, ConfidenceScore, VerificationStatus)
        OUTPUT INSERTED.*
        VALUES (@CandidateId, @Institution, @Degree, @ConfidenceScore, @VerificationStatus)
      `);
    inserted.push(result.recordset[0]);
    existingDegrees.add(key);
  }
  return inserted;
}

/**
 * Inserts newly-found Experience entries as VerificationStatus='Pending' —
 * this is the change from the original design (which never saved
 * Experience at all). A status field is a better solution than silently
 * dropping the data: the candidate sees exactly what was guessed and can
 * correct or verify it, rather than the data just not existing.
 */
async function insertNewExperienceEntries(pool, candidateId, extractedExperience) {
  const existing = await pool
    .request()
    .input("CandidateId", sql.Int, candidateId)
    .query("SELECT JobTitle, CompanyName FROM Experiences WHERE CandidateId = @CandidateId");
  const existingKeys = new Set(
    existing.recordset.map((r) => `${r.JobTitle.trim().toLowerCase()}|${r.CompanyName.trim().toLowerCase()}`)
  );

  const inserted = [];
  for (const exp of extractedExperience) {
    const key = `${exp.jobTitle.trim().toLowerCase()}|${exp.companyName.trim().toLowerCase()}`;
    if (existingKeys.has(key)) continue;

    const result = await pool
      .request()
      .input("CandidateId", sql.Int, candidateId)
      .input("JobTitle", sql.NVarChar(150), exp.jobTitle.slice(0, 150))
      .input("CompanyName", sql.NVarChar(200), exp.companyName.slice(0, 200))
      .input("StartDate", sql.Date, exp.startDate || null)
      .input("EndDate", sql.Date, exp.endDate || null)
      .input("Description", sql.NVarChar(sql.MAX), `Detected from resume: "${exp.rawLine}"`)
      .input("ConfidenceScore", sql.Int, exp.confidence)
      .input("VerificationStatus", sql.NVarChar(20), exp.confidence >= AUTO_VERIFY_CONFIDENCE_THRESHOLD ? "Verified" : "Pending")
      .query(`
        INSERT INTO Experiences (CandidateId, JobTitle, CompanyName, StartDate, EndDate, Description, ConfidenceScore, VerificationStatus)
        OUTPUT INSERTED.*
        VALUES (@CandidateId, @JobTitle, @CompanyName, @StartDate, @EndDate, @Description, @ConfidenceScore, @VerificationStatus)
      `);
    inserted.push(result.recordset[0]);
    existingKeys.add(key);
  }
  return inserted;
}

async function insertNewProjectEntries(pool, candidateId, extractedProjects) {
  const existing = await pool
    .request()
    .input("CandidateId", sql.Int, candidateId)
    .query("SELECT Title FROM Projects WHERE CandidateId = @CandidateId");
  const existingTitles = new Set(existing.recordset.map((r) => r.Title.trim().toLowerCase()));

  const inserted = [];
  for (const proj of extractedProjects) {
    const key = proj.title.trim().toLowerCase();
    if (existingTitles.has(key)) continue;

    const result = await pool
      .request()
      .input("CandidateId", sql.Int, candidateId)
      .input("Title", sql.NVarChar(200), proj.title)
      .input("Description", sql.NVarChar(sql.MAX), proj.description || null)
      .query(`
        INSERT INTO Projects (CandidateId, Title, Description)
        OUTPUT INSERTED.*
        VALUES (@CandidateId, @Title, @Description)
      `);
    inserted.push(result.recordset[0]);
    existingTitles.add(key);
  }
  return inserted;
}

async function saveResumeToProfile(userId, candidateId, file) {
  const blobUrl = await uploadResumeFile(candidateId, file);

  let extracted = {
    email: null, phone: null, linkedInUrl: null, githubUrl: null,
    skills: [], certifications: [], languages: [], education: [], experience: [],
  };
  let parsingError = null;
  let rawText = null;

  try {
    rawText = await extractTextFromResume(file.buffer, file.mimetype);
    extracted = extractStructuredData(rawText);
  } catch (err) {
    console.error("Resume parsing failed:", err.message);
    parsingError = "We couldn't extract structured data from this file, but it was uploaded successfully.";
  }

  const score = computeCompletenessScore(extracted);
  const pool = await getPool();

  if (rawText) {
    await saveExtractedText(candidateId, blobUrl, rawText);
  }

  const updateResult = await pool
    .request()
    .input("UserId", sql.Int, userId)
    .input("ResumeBlobUrl", sql.NVarChar(500), blobUrl)
    .input("ResumeScore", sql.Int, score)
    .input("Phone", sql.NVarChar(30), extracted.phone)
    .input("LinkedInUrl", sql.NVarChar(300), extracted.linkedInUrl)
    .input("GithubUrl", sql.NVarChar(300), extracted.githubUrl)
    .query(`
      UPDATE Candidates
      SET ResumeBlobUrl = @ResumeBlobUrl,
          ResumeScore = @ResumeScore,
          Phone = COALESCE(Phone, @Phone),
          LinkedInUrl = COALESCE(LinkedInUrl, @LinkedInUrl),
          GithubUrl = COALESCE(GithubUrl, @GithubUrl),
          UpdatedAt = SYSUTCDATETIME()
      OUTPUT INSERTED.*
      WHERE UserId = @UserId
    `);
  const candidate = updateResult.recordset[0];

  const addedSkills = [];
  for (const skill of extracted.skills) {
    addedSkills.push({ ...(await addSkillToCandidate(candidateId, skill.name, skill.confidence)), confidence: skill.confidence });
  }

  const addedLanguages = [];
  for (const lang of extracted.languages) {
    addedLanguages.push({ ...(await addLanguageToCandidate(candidateId, lang.name, null, lang.confidence)), confidence: lang.confidence });
  }

  const addedEducation = await insertNewEducationEntries(pool, candidateId, extracted.education);
  const addedExperience = await insertNewExperienceEntries(pool, candidateId, extracted.experience);
  const addedProjects = await insertNewProjectEntries(pool, candidateId, extracted.projects);

  const existingCerts = await certificationModel.listCandidateCertifications(candidateId);
  const existingCertNames = new Set(existingCerts.map((c) => c.Name.trim().toLowerCase()));

  const addedCertifications = [];
  for (const cert of extracted.certifications) {
    if (existingCertNames.has(cert.name.trim().toLowerCase())) continue;
    const created = await certificationModel.addCertificationToCandidate(candidateId, cert.name, { confidence: cert.confidence });
    addedCertifications.push({ Name: created.Name, Confidence: cert.confidence });
    existingCertNames.add(cert.name.trim().toLowerCase());
  }

  console.log(
    `[resume parsing] Candidate ${candidateId}: ${extracted.skills.length} skills, ` +
      `${extracted.certifications.length} certifications, ${extracted.languages.length} languages, ` +
      `${addedEducation.length} new education entries (Pending review), ` +
      `${addedExperience.length} new experience entries (Pending review). Completeness score: ${score}.`
  );

  try {
    await notificationModel.createNotification(
      userId,
      "Resume processed",
      `Your resume was processed successfully — completeness score: ${score}%.`,
      "success"
    );
  } catch (notifyErr) {
    console.error("Failed to create resume-processed notification (upload still succeeded):", notifyErr.message);
  }

  trackEvent("ResumeProcessed", {
    candidateId: String(candidateId),
    completenessScore: String(score),
    skillsFound: String(extracted.skills.length),
    parsingFailed: String(!!parsingError),
  });

  return {
    candidate,
    parsingError,
    extractedSummary: {
      emailFound: !!extracted.email,
      phoneFound: !!extracted.phone,
      linkedInFound: !!extracted.linkedInUrl,
      githubFound: !!extracted.githubUrl,
      skillsAdded: addedSkills.map((s) => ({ name: s.Name, confidence: s.confidence, confidenceLabel: toConfidenceLabel(s.confidence) })),
      certificationsAdded: addedCertifications.map((c) => ({ name: c.Name, confidence: c.Confidence, confidenceLabel: toConfidenceLabel(c.Confidence) })),
      languagesAdded: addedLanguages.map((l) => ({ name: l.Name, confidence: l.confidence, confidenceLabel: toConfidenceLabel(l.confidence) })),
      educationAdded: addedEducation.map((e) => ({
        degree: e.Degree, institution: e.Institution,
        confidence: e.ConfidenceScore, confidenceLabel: toConfidenceLabel(e.ConfidenceScore),
        autoVerified: e.VerificationStatus === "Verified",
      })),
      experienceAdded: addedExperience.map((e) => ({
        jobTitle: e.JobTitle, companyName: e.CompanyName,
        confidence: e.ConfidenceScore, confidenceLabel: toConfidenceLabel(e.ConfidenceScore),
        autoVerified: e.VerificationStatus === "Verified",
      })),
      projectsAdded: addedProjects.map((p) => ({ title: p.Title })),
    },
  };
}

module.exports = { saveResumeToProfile };
