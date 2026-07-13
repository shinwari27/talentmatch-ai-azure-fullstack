const { sql, getPool } = require("../config/db");

/**
 * All queries here use parameterized inputs (`.input(...)`) — never string-
 * concatenate values into SQL text. This is what prevents SQL injection.
 */

async function findByEmail(email) {
  const pool = await getPool();
  const result = await pool
    .request()
    .input("Email", sql.NVarChar(255), email)
    .query("SELECT * FROM Users WHERE Email = @Email");
  return result.recordset[0] || null;
}

async function findById(id) {
  const pool = await getPool();
  const result = await pool
    .request()
    .input("Id", sql.Int, id)
    .query("SELECT * FROM Users WHERE Id = @Id");
  return result.recordset[0] || null;
}

async function createUser({ fullName, email, passwordHash, role }) {
  const pool = await getPool();
  const result = await pool
    .request()
    .input("FullName", sql.NVarChar(150), fullName)
    .input("Email", sql.NVarChar(255), email)
    .input("PasswordHash", sql.NVarChar(255), passwordHash)
    .input("Role", sql.NVarChar(20), role)
    .query(`
      INSERT INTO Users (FullName, Email, PasswordHash, Role)
      OUTPUT INSERTED.*
      VALUES (@FullName, @Email, @PasswordHash, @Role)
    `);
  return result.recordset[0];
}

async function createCandidateProfile(userId) {
  const pool = await getPool();
  const result = await pool
    .request()
    .input("UserId", sql.Int, userId)
    .query(`
      INSERT INTO Candidates (UserId)
      OUTPUT INSERTED.*
      VALUES (@UserId)
    `);
  return result.recordset[0];
}

async function createRecruiterProfile(userId, companyName) {
  const pool = await getPool();
  const result = await pool
    .request()
    .input("UserId", sql.Int, userId)
    .input("CompanyName", sql.NVarChar(200), companyName)
    .query(`
      INSERT INTO Recruiters (UserId, CompanyName)
      OUTPUT INSERTED.*
      VALUES (@UserId, @CompanyName)
    `);
  return result.recordset[0];
}

async function updateLastLogin(userId) {
  const pool = await getPool();
  await pool
    .request()
    .input("Id", sql.Int, userId)
    .query("UPDATE Users SET LastLoginAt = SYSUTCDATETIME() WHERE Id = @Id");
}

async function updatePassword(userId, passwordHash) {
  const pool = await getPool();
  await pool
    .request()
    .input("Id", sql.Int, userId)
    .input("PasswordHash", sql.NVarChar(255), passwordHash)
    .query("UPDATE Users SET PasswordHash = @PasswordHash WHERE Id = @Id");
}

module.exports = {
  findByEmail,
  findById,
  createUser,
  createCandidateProfile,
  createRecruiterProfile,
  updateLastLogin,
  updatePassword,
};
