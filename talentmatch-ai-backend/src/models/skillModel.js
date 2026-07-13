const { sql, getPool } = require("../config/db");

/**
 * Skills works differently from Education/Experience/etc: it's a shared
 * master list (the same "React" row is reused by every candidate and job
 * that lists it), joined through CandidateSkills. Adding a skill to a
 * candidate means "find or create the skill by name, then link it" —
 * never creating a duplicate Skills row for the same name.
 */
async function findOrCreateSkill(name) {
  const pool = await getPool();
  // Truncated to match the actual Skills.Name column length (NVARCHAR(100))
  // — sending a longer string than the column allows is what triggers a
  // cryptic low-level TDS protocol error from the driver instead of a
  // clean truncation error, and can corrupt the pooled connection for
  // subsequent unrelated requests too. Better to never send it at all.
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

async function listCandidateSkills(candidateId) {
  const pool = await getPool();
  const result = await pool
    .request()
    .input("CandidateId", sql.Int, candidateId)
    .query(`
      SELECT s.Id AS SkillId, s.Name, cs.IsMissingForTarget, cs.Confidence
      FROM CandidateSkills cs
      JOIN Skills s ON s.Id = cs.SkillId
      WHERE cs.CandidateId = @CandidateId
      ORDER BY s.Name
    `);
  return result.recordset;
}

async function addSkillToCandidate(candidateId, skillName, confidence = null) {
  const skill = await findOrCreateSkill(skillName);
  const pool = await getPool();

  const alreadyLinked = await pool
    .request()
    .input("CandidateId", sql.Int, candidateId)
    .input("SkillId", sql.Int, skill.Id)
    .query("SELECT 1 FROM CandidateSkills WHERE CandidateId = @CandidateId AND SkillId = @SkillId");

  if (alreadyLinked.recordset.length === 0) {
    await pool
      .request()
      .input("CandidateId", sql.Int, candidateId)
      .input("SkillId", sql.Int, skill.Id)
      .input("Confidence", sql.Int, confidence)
      .query("INSERT INTO CandidateSkills (CandidateId, SkillId, Confidence) VALUES (@CandidateId, @SkillId, @Confidence)");
  }

  return skill;
}

async function removeSkillFromCandidate(candidateId, skillId) {
  const pool = await getPool();
  const result = await pool
    .request()
    .input("CandidateId", sql.Int, candidateId)
    .input("SkillId", sql.Int, skillId)
    .query(`
      DELETE FROM CandidateSkills
      OUTPUT DELETED.SkillId
      WHERE CandidateId = @CandidateId AND SkillId = @SkillId
    `);
  return result.recordset.length > 0;
}

module.exports = { listCandidateSkills, addSkillToCandidate, removeSkillFromCandidate };
