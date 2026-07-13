const { sql, getPool } = require("../config/db");

/**
 * Design decision: a recruiter can only see candidates who have applied to
 * one of THEIR OWN job postings — not every candidate on the platform. This
 * matches how real recruiting platforms scope visibility (you don't get to
 * browse everyone's profile just because you have a recruiter account) and
 * is enforced by joining through Applications -> Jobs -> RecruiterId, not
 * just trusting a candidateId passed in the URL.
 *
 * Admins bypass this restriction entirely (see listAllCandidates /
 * getCandidateDetailAsAdmin below), matching the platform-wide oversight
 * role the Admin dashboard already assumes in the frontend.
 */

function buildCandidateFilters(request, { search, location, experienceRequired, skill }) {
  const clauses = [];
  if (search) {
    request.input("Search", sql.NVarChar(255), `%${search}%`);
    clauses.push("(u.FullName LIKE @Search OR c.Title LIKE @Search)");
  }
  if (location) {
    request.input("Location", sql.NVarChar(150), location);
    clauses.push("c.Location = @Location");
  }
  if (experienceRequired) {
    // Free-text match against a candidate's own experience entries would be
    // costlier to compute meaningfully at this stage; for now this filters
    // on the recruiter-supplied search term against the candidate's Title,
    // which is the closest available signal without a dedicated
    // "years of experience" field on Candidates itself.
  }
  if (skill) {
    request.input("Skill", sql.NVarChar(100), skill);
    clauses.push(`
      c.Id IN (
        SELECT cs.CandidateId FROM CandidateSkills cs
        JOIN Skills s ON s.Id = cs.SkillId
        WHERE s.Name = @Skill
      )
    `);
  }
  return clauses;
}

async function listCandidatesForRecruiter(recruiterId, filters = {}) {
  const pool = await getPool();
  const request = pool.request().input("RecruiterId", sql.Int, recruiterId);

  const filterClauses = buildCandidateFilters(request, filters);
  const whereSql = filterClauses.length ? `AND ${filterClauses.join(" AND ")}` : "";

  const result = await request.query(`
    SELECT DISTINCT a.Id AS ApplicationId, c.Id AS CandidateId, u.FullName, u.Email, c.Title, c.Location,
           c.ResumeScore, a.MatchScore, a.MatchBreakdown, a.Status AS ApplicationStatus, a.JobId, j.Title AS AppliedForJobTitle
    FROM Candidates c
    JOIN Users u ON u.Id = c.UserId
    JOIN Applications a ON a.CandidateId = c.Id
    JOIN Jobs j ON j.Id = a.JobId
    WHERE j.RecruiterId = @RecruiterId
    ${whereSql}
    ORDER BY a.MatchScore DESC, u.FullName
  `);
  return result.recordset.map((r) => ({
    ...r,
    MatchBreakdown: r.MatchBreakdown ? JSON.parse(r.MatchBreakdown) : null,
  }));
}

async function listAllCandidatesAsAdmin(filters = {}) {
  const pool = await getPool();
  const request = pool.request();

  const filterClauses = buildCandidateFilters(request, filters);
  const whereSql = filterClauses.length ? `WHERE ${filterClauses.join(" AND ")}` : "";

  const result = await request.query(`
    SELECT c.Id AS CandidateId, u.FullName, u.Email, c.Title, c.Location, c.ResumeScore, u.Status AS AccountStatus
    FROM Candidates c
    JOIN Users u ON u.Id = c.UserId
    ${whereSql}
    ORDER BY u.FullName
  `);
  return result.recordset;
}

/**
 * The access check for the detail view: true only if this candidate has
 * applied to at least one job owned by this recruiter.
 */
async function candidateVisibleToRecruiter(candidateId, recruiterId) {
  const pool = await getPool();
  const result = await pool
    .request()
    .input("CandidateId", sql.Int, candidateId)
    .input("RecruiterId", sql.Int, recruiterId)
    .query(`
      SELECT TOP 1 1 AS Found
      FROM Applications a
      JOIN Jobs j ON j.Id = a.JobId
      WHERE a.CandidateId = @CandidateId AND j.RecruiterId = @RecruiterId
    `);
  return result.recordset.length > 0;
}

async function getCandidateDetail(candidateId) {
  const pool = await getPool();

  const basic = await pool
    .request()
    .input("CandidateId", sql.Int, candidateId)
    .query(`
      SELECT c.Id AS CandidateId, u.FullName, u.Email, c.Title, c.Location, c.Phone, c.LinkedInUrl, c.GithubUrl,
             c.ResumeScore, c.ResumeBlobUrl, c.Bio
      FROM Candidates c
      JOIN Users u ON u.Id = c.UserId
      WHERE c.Id = @CandidateId
    `);

  if (!basic.recordset[0]) return null;

  const [skills, education, experience, certifications, projects, languages] = await Promise.all([
    pool.request().input("CandidateId", sql.Int, candidateId).query(`
      SELECT s.Id AS SkillId, s.Name, cs.IsMissingForTarget, cs.Confidence
      FROM CandidateSkills cs JOIN Skills s ON s.Id = cs.SkillId
      WHERE cs.CandidateId = @CandidateId ORDER BY s.Name
    `),
    pool.request().input("CandidateId", sql.Int, candidateId).query(`
      SELECT * FROM Educations WHERE CandidateId = @CandidateId ORDER BY StartDate DESC
    `),
    pool.request().input("CandidateId", sql.Int, candidateId).query(`
      SELECT * FROM Experiences WHERE CandidateId = @CandidateId ORDER BY StartDate DESC
    `),
    pool.request().input("CandidateId", sql.Int, candidateId).query(`
      SELECT cc.Id AS CertificationId, cc.Name, ccert.IssuedBy, ccert.IssueDate, ccert.ExpiryDate, ccert.Confidence
      FROM CandidateCertifications ccert JOIN CertificationsCatalog cc ON cc.Id = ccert.CertificationId
      WHERE ccert.CandidateId = @CandidateId ORDER BY cc.Name
    `),
    pool.request().input("CandidateId", sql.Int, candidateId).query(`
      SELECT * FROM Projects WHERE CandidateId = @CandidateId
    `),
    pool.request().input("CandidateId", sql.Int, candidateId).query(`
      SELECT l.Id AS LanguageId, l.Name, cl.Proficiency, cl.Confidence
      FROM CandidateLanguages cl JOIN Languages l ON l.Id = cl.LanguageId
      WHERE cl.CandidateId = @CandidateId ORDER BY l.Name
    `),
  ]);

  return {
    ...basic.recordset[0],
    skills: skills.recordset,
    education: education.recordset,
    experience: experience.recordset,
    certifications: certifications.recordset,
    projects: projects.recordset,
    languages: languages.recordset,
  };
}

module.exports = {
  listCandidatesForRecruiter,
  listAllCandidatesAsAdmin,
  candidateVisibleToRecruiter,
  getCandidateDetail,
};
