const { sql, getPool } = require("../config/db");

async function listUsers({ role, search, page = 1, pageSize = 20 }) {
  const pool = await getPool();
  const offset = (page - 1) * pageSize;

  const request = pool
    .request()
    .input("Offset", sql.Int, offset)
    .input("PageSize", sql.Int, pageSize);

  let whereClauses = [];
  if (role) {
    request.input("Role", sql.NVarChar(20), role);
    whereClauses.push("Role = @Role");
  }
  if (search) {
    request.input("Search", sql.NVarChar(255), `%${search}%`);
    whereClauses.push("(FullName LIKE @Search OR Email LIKE @Search)");
  }
  const whereSql = whereClauses.length ? `WHERE ${whereClauses.join(" AND ")}` : "";

  const result = await request.query(`
    SELECT Id, FullName, Email, Role, Status, CreatedAt, LastLoginAt
    FROM Users
    ${whereSql}
    ORDER BY CreatedAt DESC
    OFFSET @Offset ROWS FETCH NEXT @PageSize ROWS ONLY
  `);

  const countResult = await request.query(`SELECT COUNT(*) AS Total FROM Users ${whereSql}`);

  return {
    users: result.recordset,
    total: countResult.recordset[0].Total,
    page,
    pageSize,
  };
}

async function setUserStatus(userId, status) {
  const pool = await getPool();
  const result = await pool
    .request()
    .input("Id", sql.Int, userId)
    .input("Status", sql.NVarChar(20), status)
    .query(`
      UPDATE Users
      SET Status = @Status
      OUTPUT INSERTED.Id, INSERTED.FullName, INSERTED.Email, INSERTED.Role, INSERTED.Status
      WHERE Id = @Id
    `);
  return result.recordset[0] || null;
}

module.exports = { listUsers, setUserStatus };
