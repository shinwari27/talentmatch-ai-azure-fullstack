const { sql, getPool } = require("../config/db");

/**
 * Educations, Experiences, Certifications, and Projects are all the same
 * shape of relationship: a simple list of records owned by one Candidate,
 * with no relationships to anything else. Rather than writing four nearly
 * identical models, this factory builds one from a config describing the
 * table name and its columns. If the pattern ever needs to diverge for one
 * of them, it's easy to break that one out into its own file later — this
 * isn't a permanent abstraction, just a way to avoid repeating the same
 * four functions four times right now.
 */
function createCandidateSubResourceModel(tableName, columns) {
  const columnList = columns.join(", ");

  async function list(candidateId) {
    const pool = await getPool();
    const result = await pool
      .request()
      .input("CandidateId", sql.Int, candidateId)
      .query(`SELECT Id, ${columnList} FROM ${tableName} WHERE CandidateId = @CandidateId ORDER BY Id DESC`);
    return result.recordset;
  }

  async function create(candidateId, data) {
    const pool = await getPool();
    const request = pool.request().input("CandidateId", sql.Int, candidateId);

    // Only bind columns the caller actually provided — this is what lets
    // DB column defaults (e.g. VerificationStatus defaulting to 'Verified')
    // apply correctly for manual entries that don't set every column,
    // instead of explicitly inserting NULL and violating a NOT NULL default.
    const providedColumns = columns.filter((col) => data[col] !== undefined);
    providedColumns.forEach((col) => request.input(col, data[col]));

    const insertCols = ["CandidateId", ...providedColumns].join(", ");
    const insertVals = ["@CandidateId", ...providedColumns.map((c) => `@${c}`)].join(", ");

    const result = await request.query(`
      INSERT INTO ${tableName} (${insertCols})
      OUTPUT INSERTED.*
      VALUES (${insertVals})
    `);
    return result.recordset[0];
  }

  async function update(candidateId, id, data) {
    const pool = await getPool();
    const request = pool.request().input("Id", sql.Int, id).input("CandidateId", sql.Int, candidateId);

    const providedColumns = columns.filter((col) => data[col] !== undefined);
    providedColumns.forEach((col) => request.input(col, data[col]));

    if (providedColumns.length === 0) {
      throw Object.assign(new Error("No fields provided to update."), { status: 400 });
    }

    const setClause = providedColumns.map((c) => `${c} = @${c}`).join(", ");

    const result = await request.query(`
      UPDATE ${tableName}
      SET ${setClause}
      OUTPUT INSERTED.*
      WHERE Id = @Id AND CandidateId = @CandidateId
    `);
    return result.recordset[0] || null; // null means: not found, OR it belongs to a different candidate
  }

  async function remove(candidateId, id) {
    const pool = await getPool();
    const result = await pool
      .request()
      .input("Id", sql.Int, id)
      .input("CandidateId", sql.Int, candidateId)
      .query(`DELETE FROM ${tableName} OUTPUT DELETED.Id WHERE Id = @Id AND CandidateId = @CandidateId`);
    return result.recordset.length > 0;
  }

  /**
   * Flips VerificationStatus to 'Verified' — only meaningful for
   * Educations/Experiences (which have this column); a no-op-safe call on
   * Certifications/Projects would just fail loudly if ever wired up there,
   * which is fine since the frontend never exposes a verify action for
   * those two.
   */
  async function verify(candidateId, id) {
    const pool = await getPool();
    const result = await pool
      .request()
      .input("Id", sql.Int, id)
      .input("CandidateId", sql.Int, candidateId)
      .query(`
        UPDATE ${tableName}
        SET VerificationStatus = 'Verified'
        OUTPUT INSERTED.*
        WHERE Id = @Id AND CandidateId = @CandidateId
      `);
    return result.recordset[0] || null;
  }

  return { list, create, update, remove, verify };
}

module.exports = { createCandidateSubResourceModel };
