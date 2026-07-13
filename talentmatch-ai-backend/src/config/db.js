const sql = require("mssql");

// Azure SQL connection config. `encrypt: true` is required for Azure SQL —
// connections are rejected without it. The pool is created once and reused
// across every query in the app rather than opening a new connection per request.
const config = {
  server: process.env.SQL_SERVER,
  database: process.env.SQL_DATABASE,
  user: process.env.SQL_USER,
  password: process.env.SQL_PASSWORD,
  options: {
    encrypt: true,
    trustServerCertificate: false,
  },
  pool: {
    max: 10,
    min: 0,
    idleTimeoutMillis: 30000,
  },
};

let poolPromise;

/**
 * Returns a shared connection pool, creating it on first call.
 * Every model/controller should `await getPool()` rather than opening
 * its own connection.
 */
function getPool() {
  if (!poolPromise) {
    poolPromise = new sql.ConnectionPool(config)
      .connect()
      .then((pool) => {
        console.log("Connected to Azure SQL:", process.env.SQL_DATABASE);
        return pool;
      })
      .catch((err) => {
        console.error("Database connection failed:", err.message);
        poolPromise = null; // allow a retry on the next call instead of caching the failure
        throw err;
      });
  }
  return poolPromise;
}

module.exports = { sql, getPool };
