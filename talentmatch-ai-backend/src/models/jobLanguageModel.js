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

async function listJobLanguages(jobId) {
  const pool = await getPool();
  const result = await pool
    .request()
    .input("JobId", sql.Int, jobId)
    .query(`
      SELECT l.Id AS LanguageId, l.Name, jl.IsRequired
      FROM JobLanguages jl
      JOIN Languages l ON l.Id = jl.LanguageId
      WHERE jl.JobId = @JobId
      ORDER BY jl.IsRequired DESC, l.Name
    `);
  return result.recordset;
}

async function setJobLanguages(jobId, languageNames = []) {
  const pool = await getPool();
  await pool.request().input("JobId", sql.Int, jobId).query("DELETE FROM JobLanguages WHERE JobId = @JobId");

  for (const name of languageNames) {
    const lang = await findOrCreateLanguage(name);
    await pool
      .request()
      .input("JobId", sql.Int, jobId)
      .input("LanguageId", sql.Int, lang.Id)
      .query("INSERT INTO JobLanguages (JobId, LanguageId, IsRequired) VALUES (@JobId, @LanguageId, 1)");
  }

  return listJobLanguages(jobId);
}

module.exports = { listJobLanguages, setJobLanguages };
