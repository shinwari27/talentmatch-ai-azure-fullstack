const { sql, getPool } = require("../config/db");
const { findOrCreateCertification } = require("./certificationModel");

async function listJobCertifications(jobId) {
  const pool = await getPool();
  const result = await pool
    .request()
    .input("JobId", sql.Int, jobId)
    .query(`
      SELECT cc.Id AS CertificationId, cc.Name, jc.IsRequired
      FROM JobCertifications jc
      JOIN CertificationsCatalog cc ON cc.Id = jc.CertificationId
      WHERE jc.JobId = @JobId
      ORDER BY jc.IsRequired DESC, cc.Name
    `);
  return result.recordset;
}

async function setJobCertifications(jobId, certNames = []) {
  const pool = await getPool();
  await pool.request().input("JobId", sql.Int, jobId).query("DELETE FROM JobCertifications WHERE JobId = @JobId");

  for (const name of certNames) {
    const cert = await findOrCreateCertification(name);
    await pool
      .request()
      .input("JobId", sql.Int, jobId)
      .input("CertificationId", sql.Int, cert.Id)
      .query("INSERT INTO JobCertifications (JobId, CertificationId, IsRequired) VALUES (@JobId, @CertificationId, 1)");
  }

  return listJobCertifications(jobId);
}

module.exports = { listJobCertifications, setJobCertifications };
