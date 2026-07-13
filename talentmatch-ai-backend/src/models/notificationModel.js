const { sql, getPool } = require("../config/db");

/**
 * Nothing in the app has ever called this until Phase 13 — the
 * Notifications table and its UI (list, mark-read) have existed since
 * Phase 8, but no event actually created a row. This is the missing piece.
 */
async function createNotification(userId, title, message, type = "info") {
  const pool = await getPool();
  await pool
    .request()
    .input("UserId", sql.Int, userId)
    .input("Title", sql.NVarChar(200), title)
    .input("Message", sql.NVarChar(500), message)
    .input("Type", sql.NVarChar(20), type)
    .query(`
      INSERT INTO Notifications (UserId, Title, Message, Type)
      VALUES (@UserId, @Title, @Message, @Type)
    `);
}

async function listForUser(userId) {
  const pool = await getPool();
  const result = await pool
    .request()
    .input("UserId", sql.Int, userId)
    .query("SELECT * FROM Notifications WHERE UserId = @UserId ORDER BY CreatedAt DESC");
  return result.recordset;
}

async function markRead(userId, notificationId) {
  const pool = await getPool();
  const result = await pool
    .request()
    .input("UserId", sql.Int, userId)
    .input("Id", sql.Int, notificationId)
    .query(`
      UPDATE Notifications
      SET IsRead = 1
      OUTPUT INSERTED.*
      WHERE Id = @Id AND UserId = @UserId
    `);
  return result.recordset[0] || null;
}

async function markAllRead(userId) {
  const pool = await getPool();
  await pool
    .request()
    .input("UserId", sql.Int, userId)
    .query("UPDATE Notifications SET IsRead = 1 WHERE UserId = @UserId AND IsRead = 0");
}

module.exports = { createNotification, listForUser, markRead, markAllRead };
