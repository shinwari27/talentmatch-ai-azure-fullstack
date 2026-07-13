const { sql, getPool } = require("../config/db");

async function findOrCreateCertification(name) {
  const pool = await getPool();
  const trimmedName = name.trim().slice(0, 150);

  const existing = await pool
    .request()
    .input("Name", sql.NVarChar(150), trimmedName)
    .query("SELECT Id, Name FROM CertificationsCatalog WHERE Name = @Name");

  if (existing.recordset[0]) return existing.recordset[0];

  const created = await pool
    .request()
    .input("Name", sql.NVarChar(150), trimmedName)
    .query("INSERT INTO CertificationsCatalog (Name) OUTPUT INSERTED.* VALUES (@Name)");

  return created.recordset[0];
}

async function listCandidateCertifications(candidateId) {
  const pool = await getPool();
  const result = await pool
    .request()
    .input("CandidateId", sql.Int, candidateId)
    .query(`
      SELECT cc.Id AS CertificationId, cc.Name, ccert.IssuedBy, ccert.IssueDate, ccert.ExpiryDate, ccert.Confidence
      FROM CandidateCertifications ccert
      JOIN CertificationsCatalog cc ON cc.Id = ccert.CertificationId
      WHERE ccert.CandidateId = @CandidateId
      ORDER BY cc.Name
    `);
  return result.recordset;
}

async function addCertificationToCandidate(candidateId, name, { issuedBy, issueDate, expiryDate, confidence } = {}) {
  const cert = await findOrCreateCertification(name);
  const pool = await getPool();

  const alreadyLinked = await pool
    .request()
    .input("CandidateId", sql.Int, candidateId)
    .input("CertificationId", sql.Int, cert.Id)
    .query("SELECT 1 FROM CandidateCertifications WHERE CandidateId = @CandidateId AND CertificationId = @CertificationId");

  if (alreadyLinked.recordset.length === 0) {
    await pool
      .request()
      .input("CandidateId", sql.Int, candidateId)
      .input("CertificationId", sql.Int, cert.Id)
      .input("IssuedBy", sql.NVarChar(150), issuedBy || null)
      .input("IssueDate", sql.Date, issueDate || null)
      .input("ExpiryDate", sql.Date, expiryDate || null)
      .input("Confidence", sql.Int, confidence ?? null)
      .query(`
        INSERT INTO CandidateCertifications (CandidateId, CertificationId, IssuedBy, IssueDate, ExpiryDate, Confidence)
        VALUES (@CandidateId, @CertificationId, @IssuedBy, @IssueDate, @ExpiryDate, @Confidence)
      `);
  }

  return cert;
}

async function removeCertificationFromCandidate(candidateId, certificationId) {
  const pool = await getPool();
  const result = await pool
    .request()
    .input("CandidateId", sql.Int, candidateId)
    .input("CertificationId", sql.Int, certificationId)
    .query(`
      DELETE FROM CandidateCertifications
      OUTPUT DELETED.CertificationId
      WHERE CandidateId = @CandidateId AND CertificationId = @CertificationId
    `);
  return result.recordset.length > 0;
}

module.exports = {
  findOrCreateCertification,
  listCandidateCertifications,
  addCertificationToCandidate,
  removeCertificationFromCandidate,
};
