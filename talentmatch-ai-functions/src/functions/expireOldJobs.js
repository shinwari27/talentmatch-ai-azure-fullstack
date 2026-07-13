const { app } = require("@azure/functions");
const { sql, getPool } = require("../config/db");

/**
 * Runs daily at 2:00 AM UTC (NCRONTAB: seconds minutes hours day month
 * day-of-week). Closes any job still marked "Open" that was posted more
 * than JOB_EXPIRATION_DAYS ago (default 30) — this is the first genuinely
 * scheduled, unattended work in the whole app; everything before this
 * phase only ran in direct response to a user action.
 *
 * Deliberately does NOT hard-delete anything — closing a job (same action
 * a recruiter can take manually) preserves its Applications history,
 * consistent with the Phase 6 schema decision that jobs with applications
 * can't be deleted, only closed.
 */
app.timer("expireOldJobs", {
  schedule: "0 0 2 * * *",
  handler: async (myTimer, context) => {
    const expirationDays = parseInt(process.env.JOB_EXPIRATION_DAYS || "30", 10);
    context.log(`Running job expiration check (threshold: ${expirationDays} days)...`);

    try {
      const pool = await getPool();
      const result = await pool
        .request()
        .input("ExpirationDays", sql.Int, expirationDays)
        .query(`
          UPDATE Jobs
          SET Status = 'Closed', ClosedAt = SYSUTCDATETIME()
          OUTPUT INSERTED.Id, INSERTED.Title, INSERTED.PostedAt
          WHERE Status = 'Open' AND PostedAt < DATEADD(day, -@ExpirationDays, SYSUTCDATETIME())
        `);

      context.log(`Expired ${result.recordset.length} job(s).`);
      result.recordset.forEach((job) =>
        context.log(`  - Closed "${job.Title}" (Id: ${job.Id}, posted ${job.PostedAt.toISOString()})`)
      );
    } catch (err) {
      // Azure Functions logs this to Application Insights automatically —
      // re-throwing lets the platform mark the invocation as failed, which
      // is what makes it show up in monitoring/alerts rather than failing
      // silently.
      context.error("Job expiration check failed:", err.message);
      throw err;
    }
  },
});
