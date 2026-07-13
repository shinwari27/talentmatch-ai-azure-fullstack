const { sql, getPool } = require("../config/db");

async function findOrCreateLanguage(name) {
  const pool = await getPool();
  const trimmedName = name.trim().slice(0, 100);

  const existing = await pool
    .request()
    .input("Name", sql.NVarChar(100), trimmedName)
    .query("SELECT Id, Name FROM Languages WHERE Name = @Name");

  if (existing.recordset[0]) return existing.recordset[0];

  const created = await pool
    .request()
    .input("Name", sql.NVarChar(100), trimmedName)
    .query("INSERT INTO Languages (Name) OUTPUT INSERTED.* VALUES (@Name)");

  return created.recordset[0];
}

async function listCandidateLanguages(candidateId) {
  const pool = await getPool();
  const result = await pool
    .request()
    .input("CandidateId", sql.Int, candidateId)
    .query(`
      SELECT l.Id AS LanguageId, l.Name, cl.Proficiency, cl.Confidence
      FROM CandidateLanguages cl
      JOIN Languages l ON l.Id = cl.LanguageId
      WHERE cl.CandidateId = @CandidateId
      ORDER BY l.Name
    `);
  return result.recordset;
}

async function addLanguageToCandidate(candidateId, languageName, proficiency, confidence = null) {
  const language = await findOrCreateLanguage(languageName);
  const pool = await getPool();

  const alreadyLinked = await pool
    .request()
    .input("CandidateId", sql.Int, candidateId)
    .input("LanguageId", sql.Int, language.Id)
    .query("SELECT 1 FROM CandidateLanguages WHERE CandidateId = @CandidateId AND LanguageId = @LanguageId");

  if (alreadyLinked.recordset.length === 0) {
    await pool
      .request()
      .input("CandidateId", sql.Int, candidateId)
      .input("LanguageId", sql.Int, language.Id)
      .input("Proficiency", sql.NVarChar(30), proficiency || null)
      .input("Confidence", sql.Int, confidence)
      .query("INSERT INTO CandidateLanguages (CandidateId, LanguageId, Proficiency, Confidence) VALUES (@CandidateId, @LanguageId, @Proficiency, @Confidence)");
  } else if (proficiency) {
    await pool
      .request()
      .input("CandidateId", sql.Int, candidateId)
      .input("LanguageId", sql.Int, language.Id)
      .input("Proficiency", sql.NVarChar(30), proficiency)
      .query("UPDATE CandidateLanguages SET Proficiency = @Proficiency WHERE CandidateId = @CandidateId AND LanguageId = @LanguageId");
  }

  return language;
}

async function removeLanguageFromCandidate(candidateId, languageId) {
  const pool = await getPool();
  const result = await pool
    .request()
    .input("CandidateId", sql.Int, candidateId)
    .input("LanguageId", sql.Int, languageId)
    .query(`
      DELETE FROM CandidateLanguages
      OUTPUT DELETED.LanguageId
      WHERE CandidateId = @CandidateId AND LanguageId = @LanguageId
    `);
  return result.recordset.length > 0;
}

module.exports = { listCandidateLanguages, addLanguageToCandidate, removeLanguageFromCandidate };
