const { sql, getPool } = require("../config/db");
const { computeMatch } = require("../services/matchingEngine");
const jobModel = require("./jobModel");
const jobSkillModel = require("./jobSkillModel");
const jobCertificationModel = require("./jobCertificationModel");
const jobLanguageModel = require("./jobLanguageModel");
const skillModel = require("./skillModel");
const certificationModel = require("./certificationModel");
const languageModel = require("./languageModel");

/**
 * Gathers everything the matching engine needs for one candidate against
 * one job, runs the calculation, and returns the result. Does NOT persist —
 * callers decide whether/where to store it (application-scoped vs. a
 * one-off preview, say).
 */
async function calculateMatchForCandidateAndJob(candidateId, jobId) {
  const pool = await getPool();

  const job = await jobModel.getJobById(jobId);
  if (!job) throw Object.assign(new Error("Job not found."), { status: 404 });

  const [skills, certifications, languages, educations, experiences, projects, jobSkills, jobCerts, jobLangs] =
    await Promise.all([
      skillModel.listCandidateSkills(candidateId),
      certificationModel.listCandidateCertifications(candidateId),
      languageModel.listCandidateLanguages(candidateId),
      pool.request().input("CandidateId", sql.Int, candidateId).query(
        "SELECT * FROM Educations WHERE CandidateId = @CandidateId AND VerificationStatus = 'Verified'"
      ),
      pool.request().input("CandidateId", sql.Int, candidateId).query(
        "SELECT * FROM Experiences WHERE CandidateId = @CandidateId AND VerificationStatus = 'Verified'"
      ),
      pool.request().input("CandidateId", sql.Int, candidateId).query(
        "SELECT * FROM Projects WHERE CandidateId = @CandidateId"
      ),
      jobSkillModel.listJobSkills(jobId),
      jobCertificationModel.listJobCertifications(jobId),
      jobLanguageModel.listJobLanguages(jobId),
    ]);

  const jobWithRequirements = { ...job, skills: jobSkills, preferredCertifications: jobCerts, preferredLanguages: jobLangs };

  return computeMatch({
    job: jobWithRequirements,
    candidateSkills: skills,
    candidateCertifications: certifications,
    candidateLanguages: languages,
    verifiedEducations: educations.recordset,
    verifiedExperiences: experiences.recordset,
    projects: projects.recordset,
  });
}

async function saveMatchResultToApplication(applicationId, matchResult) {
  const pool = await getPool();
  await pool
    .request()
    .input("Id", sql.Int, applicationId)
    .input("MatchScore", sql.Decimal(5, 2), matchResult.overallScore)
    .input("MatchBreakdown", sql.NVarChar(sql.MAX), JSON.stringify(matchResult))
    .query(`
      UPDATE Applications
      SET MatchScore = @MatchScore, MatchBreakdown = @MatchBreakdown, UpdatedAt = SYSUTCDATETIME()
      WHERE Id = @Id
    `);
}

/**
 * Recalculates and saves match scores for every application to one job —
 * this is what backs the recruiter's "Rank Candidates" action.
 */
async function rankApplicationsForJob(jobId, recruiterId) {
  const pool = await getPool();

  const applications = await pool
    .request()
    .input("JobId", sql.Int, jobId)
    .input("RecruiterId", sql.Int, recruiterId)
    .query(`
      SELECT a.Id, a.CandidateId
      FROM Applications a
      JOIN Jobs j ON j.Id = a.JobId
      WHERE a.JobId = @JobId AND j.RecruiterId = @RecruiterId
    `);

  if (applications.recordset.length === 0) {
    const err = new Error("No applications found for this job, or it doesn't belong to you.");
    err.status = 404;
    throw err;
  }

  const results = [];
  for (const app of applications.recordset) {
    const matchResult = await calculateMatchForCandidateAndJob(app.CandidateId, jobId);
    await saveMatchResultToApplication(app.Id, matchResult);
    results.push({ applicationId: app.Id, candidateId: app.CandidateId, ...matchResult });
  }

  return results.sort((a, b) => b.overallScore - a.overallScore);
}

module.exports = { calculateMatchForCandidateAndJob, saveMatchResultToApplication, rankApplicationsForJob };
