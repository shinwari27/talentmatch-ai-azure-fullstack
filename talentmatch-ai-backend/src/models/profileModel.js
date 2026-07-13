const { sql, getPool } = require("../config/db");

/**
 * Every candidate sub-resource (education, experience, skills, etc.) is
 * keyed by CandidateId, not UserId — so almost every query in this module
 * starts by resolving "which Candidates.Id belongs to this logged-in user"
 * before touching anything else. Centralizing that lookup here means a
 * mistake in it only needs fixing in one place.
 */
async function getCandidateIdByUserId(userId) {
  const pool = await getPool();
  const result = await pool
    .request()
    .input("UserId", sql.Int, userId)
    .query("SELECT Id FROM Candidates WHERE UserId = @UserId");
  return result.recordset[0]?.Id || null;
}

async function getRecruiterIdByUserId(userId) {
  const pool = await getPool();
  const result = await pool
    .request()
    .input("UserId", sql.Int, userId)
    .query("SELECT Id FROM Recruiters WHERE UserId = @UserId");
  return result.recordset[0]?.Id || null;
}

async function getCandidateProfile(userId) {
  const pool = await getPool();
  const result = await pool
    .request()
    .input("UserId", sql.Int, userId)
    .query(`
      SELECT u.Id AS UserId, u.FullName, u.Email, u.Role, u.Status, u.CreatedAt, u.LastLoginAt,
             c.Id AS CandidateId, c.Title, c.Location, c.Phone, c.LinkedInUrl, c.GithubUrl,
             c.ResumeScore, c.ResumeBlobUrl, c.Bio, c.UpdatedAt
      FROM Users u
      JOIN Candidates c ON c.UserId = u.Id
      WHERE u.Id = @UserId
    `);
  return result.recordset[0] || null;
}

async function updateCandidateProfile(userId, { fullName, title, location, phone, linkedInUrl, githubUrl, bio }) {
  const pool = await getPool();
  await pool
    .request()
    .input("UserId", sql.Int, userId)
    .input("FullName", sql.NVarChar(150), fullName)
    .query("UPDATE Users SET FullName = @FullName WHERE Id = @UserId");

  await pool
    .request()
    .input("UserId", sql.Int, userId)
    .input("Title", sql.NVarChar(150), title)
    .input("Location", sql.NVarChar(150), location)
    .input("Phone", sql.NVarChar(30), phone)
    .input("LinkedInUrl", sql.NVarChar(300), linkedInUrl)
    .input("GithubUrl", sql.NVarChar(300), githubUrl)
    .input("Bio", sql.NVarChar(sql.MAX), bio)
    .query(`
      UPDATE Candidates
      SET Title = @Title, Location = @Location, Phone = @Phone,
          LinkedInUrl = @LinkedInUrl, GithubUrl = @GithubUrl, Bio = @Bio, UpdatedAt = SYSUTCDATETIME()
      WHERE UserId = @UserId
    `);

  return getCandidateProfile(userId);
}

async function getRecruiterProfile(userId) {
  const pool = await getPool();
  const result = await pool
    .request()
    .input("UserId", sql.Int, userId)
    .query(`
      SELECT u.Id AS UserId, u.FullName, u.Email, u.Role, u.Status, u.CreatedAt, u.LastLoginAt,
             r.Id AS RecruiterId, r.CompanyName, r.CompanyLogoUrl
      FROM Users u
      JOIN Recruiters r ON r.UserId = u.Id
      WHERE u.Id = @UserId
    `);
  return result.recordset[0] || null;
}

async function updateRecruiterProfile(userId, { fullName, companyName, companyLogoUrl }) {
  const pool = await getPool();
  await pool
    .request()
    .input("UserId", sql.Int, userId)
    .input("FullName", sql.NVarChar(150), fullName)
    .query("UPDATE Users SET FullName = @FullName WHERE Id = @UserId");

  await pool
    .request()
    .input("UserId", sql.Int, userId)
    .input("CompanyName", sql.NVarChar(200), companyName)
    .input("CompanyLogoUrl", sql.NVarChar(500), companyLogoUrl)
    .query(`
      UPDATE Recruiters
      SET CompanyName = @CompanyName, CompanyLogoUrl = @CompanyLogoUrl
      WHERE UserId = @UserId
    `);

  return getRecruiterProfile(userId);
}

async function getUserIdByCandidateId(candidateId) {
  const pool = await getPool();
  const result = await pool
    .request()
    .input("CandidateId", sql.Int, candidateId)
    .query("SELECT UserId FROM Candidates WHERE Id = @CandidateId");
  return result.recordset[0]?.UserId || null;
}

module.exports = {
  getCandidateIdByUserId,
  getRecruiterIdByUserId,
  getUserIdByCandidateId,
  getCandidateProfile,
  updateCandidateProfile,
  getRecruiterProfile,
  updateRecruiterProfile,
};
