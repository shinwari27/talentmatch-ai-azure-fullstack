const { sql, getPool } = require("../config/db");

/**
 * Keeps a light history via IsCurrent rather than a hard one-row-per-
 * candidate constraint. Each upload flips any previous current row to
 * IsCurrent = 0 and inserts a new one — not full resume file versioning
 * (still out of scope), just enough to review or reprocess a past
 * extraction later without meaningfully more complexity than a single row.
 */
async function saveExtractedText(candidateId, blobUrl, extractedText) {
  const pool = await getPool();

  await pool
    .request()
    .input("CandidateId", sql.Int, candidateId)
    .query("UPDATE ResumeExtractions SET IsCurrent = 0 WHERE CandidateId = @CandidateId AND IsCurrent = 1");

  await pool
    .request()
    .input("CandidateId", sql.Int, candidateId)
    .input("BlobUrl", sql.NVarChar(500), blobUrl)
    .input("ExtractedText", sql.NVarChar(sql.MAX), extractedText)
    .query(`
      INSERT INTO ResumeExtractions (CandidateId, BlobUrl, ExtractedText, IsCurrent)
      VALUES (@CandidateId, @BlobUrl, @ExtractedText, 1)
    `);
}

async function getExtractedText(candidateId) {
  const pool = await getPool();
  const result = await pool
    .request()
    .input("CandidateId", sql.Int, candidateId)
    .query("SELECT * FROM ResumeExtractions WHERE CandidateId = @CandidateId AND IsCurrent = 1");
  return result.recordset[0] || null;
}

async function getExtractionHistory(candidateId) {
  const pool = await getPool();
  const result = await pool
    .request()
    .input("CandidateId", sql.Int, candidateId)
    .query("SELECT Id, BlobUrl, IsCurrent, CreatedAt FROM ResumeExtractions WHERE CandidateId = @CandidateId ORDER BY CreatedAt DESC");
  return result.recordset;
}

module.exports = { saveExtractedText, getExtractedText, getExtractionHistory };
