const { sql, getPool } = require("../config/db");

/**
 * Mirrors skillModel.js's find-or-create pattern from Module 2 — the same
 * Skills master list is reused here so "React" on a job and "React" on a
 * candidate are the same row, which is what makes matching-by-skill
 * possible later.
 */
async function findOrCreateSkill(name) {
  const pool = await getPool();
  const trimmedName = name.trim().slice(0, 100);

  const existing = await pool
    .request()
    .input("Name", sql.NVarChar(100), trimmedName)
    .query("SELECT Id, Name FROM Skills WHERE Name = @Name");

  if (existing.recordset[0]) return existing.recordset[0];

  const created = await pool
    .request()
    .input("Name", sql.NVarChar(100), trimmedName)
    .query("INSERT INTO Skills (Name) OUTPUT INSERTED.* VALUES (@Name)");

  return created.recordset[0];
}

async function listJobSkills(jobId) {
  const pool = await getPool();
  const result = await pool
    .request()
    .input("JobId", sql.Int, jobId)
    .query(`
      SELECT s.Id AS SkillId, s.Name, js.IsRequired
      FROM JobSkills js
      JOIN Skills s ON s.Id = js.SkillId
      WHERE js.JobId = @JobId
      ORDER BY js.IsRequired DESC, s.Name
    `);
  return result.recordset;
}

/**
 * Replaces the job's entire skill list in one call — this is what the
 * Create/Edit Job form actually needs (submit a full list of skill names),
 * rather than one-at-a-time add/remove like the candidate profile does.
 */
async function setJobSkills(jobId, skillNames = []) {
  const pool = await getPool();

  await pool.request().input("JobId", sql.Int, jobId).query("DELETE FROM JobSkills WHERE JobId = @JobId");

  for (const name of skillNames) {
    const skill = await findOrCreateSkill(name);
    await pool
      .request()
      .input("JobId", sql.Int, jobId)
      .input("SkillId", sql.Int, skill.Id)
      .query("INSERT INTO JobSkills (JobId, SkillId, IsRequired) VALUES (@JobId, @SkillId, 1)");
  }

  return listJobSkills(jobId);
}

module.exports = { listJobSkills, setJobSkills };
