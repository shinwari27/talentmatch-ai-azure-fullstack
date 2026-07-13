const { sql, getPool } = require("../config/db");

function parseBreakdown(row) {
  if (!row) return row;
  return { ...row, MatchBreakdown: row.MatchBreakdown ? JSON.parse(row.MatchBreakdown) : null };
}

async function findExisting(jobId, candidateId) {
  const pool = await getPool();
  const result = await pool
    .request()
    .input("JobId", sql.Int, jobId)
    .input("CandidateId", sql.Int, candidateId)
    .query("SELECT * FROM Applications WHERE JobId = @JobId AND CandidateId = @CandidateId");
  return result.recordset[0] || null;
}

/**
 * MatchScore is left null for now — the actual AI matching engine is a
 * later phase (per the roadmap, matching logic comes after the backend
 * modules). This column exists and is ready to be populated once that
 * engine exists; nothing about this schema needs to change when it does.
 */
async function createApplication(jobId, candidateId) {
  const pool = await getPool();
  const result = await pool
    .request()
    .input("JobId", sql.Int, jobId)
    .input("CandidateId", sql.Int, candidateId)
    .query(`
      INSERT INTO Applications (JobId, CandidateId, Status)
      OUTPUT INSERTED.*
      VALUES (@JobId, @CandidateId, 'Applied')
    `);
  return result.recordset[0];
}

async function listApplicationsForCandidate(candidateId) {
  const pool = await getPool();
  const result = await pool
    .request()
    .input("CandidateId", sql.Int, candidateId)
    .query(`
      SELECT a.*, j.Title AS JobTitle, j.CompanyName, j.Location
      FROM Applications a
      JOIN Jobs j ON j.Id = a.JobId
      WHERE a.CandidateId = @CandidateId
      ORDER BY a.AppliedAt DESC
    `);
  return result.recordset.map(parseBreakdown);
}

/**
 * For a recruiter reviewing applicants to one of their own jobs. The
 * RecruiterId filter on the Jobs join is what stops a recruiter from
 * viewing applicants to a job that isn't theirs, even if they guess a
 * valid JobId.
 */
async function listApplicationsForJob(jobId, recruiterId) {
  const pool = await getPool();
  const result = await pool
    .request()
    .input("JobId", sql.Int, jobId)
    .input("RecruiterId", sql.Int, recruiterId)
    .query(`
      SELECT a.*, c.Title AS CandidateTitle, c.Location AS CandidateLocation,
             u.FullName AS CandidateName, u.Email AS CandidateEmail
      FROM Applications a
      JOIN Candidates c ON c.Id = a.CandidateId
      JOIN Users u ON u.Id = c.UserId
      JOIN Jobs j ON j.Id = a.JobId
      WHERE a.JobId = @JobId AND j.RecruiterId = @RecruiterId
      ORDER BY a.MatchScore DESC, a.AppliedAt DESC
    `);
  return result.recordset.map(parseBreakdown);
}

async function updateApplicationStatus(applicationId, recruiterId, status) {
  const pool = await getPool();
  const result = await pool
    .request()
    .input("Id", sql.Int, applicationId)
    .input("RecruiterId", sql.Int, recruiterId)
    .input("Status", sql.NVarChar(20), status)
    .query(`
      UPDATE a
      SET a.Status = @Status, a.UpdatedAt = SYSUTCDATETIME()
      OUTPUT INSERTED.*
      FROM Applications a
      JOIN Jobs j ON j.Id = a.JobId
      WHERE a.Id = @Id AND j.RecruiterId = @RecruiterId
    `);
  return result.recordset[0] || null;
}

module.exports = {
  findExisting,
  createApplication,
  listApplicationsForCandidate,
  listApplicationsForJob,
  updateApplicationStatus,
};
