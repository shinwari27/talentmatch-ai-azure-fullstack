const { sql, getPool } = require("../config/db");

async function getCandidateDashboard(candidateId) {
  const pool = await getPool();

  const [applications, resume] = await Promise.all([
    pool.request().input("CandidateId", sql.Int, candidateId).query(`
      SELECT Status, COUNT(*) AS Count FROM Applications
      WHERE CandidateId = @CandidateId GROUP BY Status
    `),
    pool.request().input("CandidateId", sql.Int, candidateId).query(`
      SELECT ResumeScore FROM Candidates WHERE Id = @CandidateId
    `),
  ]);

  const statusCounts = Object.fromEntries(applications.recordset.map((r) => [r.Status, r.Count]));
  const totalApplications = applications.recordset.reduce((sum, r) => sum + r.Count, 0);

  const recentApplications = await pool.request().input("CandidateId", sql.Int, candidateId).query(`
    SELECT TOP 5 a.Id, a.Status, a.AppliedAt, j.Title AS JobTitle, j.CompanyName
    FROM Applications a JOIN Jobs j ON j.Id = a.JobId
    WHERE a.CandidateId = @CandidateId
    ORDER BY a.AppliedAt DESC
  `);

  return {
    totalApplications,
    interviewCount: statusCounts["Interview"] || 0,
    offerCount: statusCounts["Offer"] || 0,
    resumeScore: resume.recordset[0]?.ResumeScore ?? null,
    recentApplications: recentApplications.recordset,
  };
}

async function getRecruiterDashboard(recruiterId) {
  const pool = await getPool();

  const [jobCounts, applicantCount, activeJobs, topCandidates] = await Promise.all([
    pool.request().input("RecruiterId", sql.Int, recruiterId).query(`
      SELECT Status, COUNT(*) AS Count FROM Jobs
      WHERE RecruiterId = @RecruiterId GROUP BY Status
    `),
    pool.request().input("RecruiterId", sql.Int, recruiterId).query(`
      SELECT COUNT(*) AS Count FROM Applications a
      JOIN Jobs j ON j.Id = a.JobId
      WHERE j.RecruiterId = @RecruiterId
    `),
    pool.request().input("RecruiterId", sql.Int, recruiterId).query(`
      SELECT TOP 5 Id, Title, Location, Status,
        (SELECT COUNT(*) FROM Applications a WHERE a.JobId = Jobs.Id) AS ApplicantCount
      FROM Jobs
      WHERE RecruiterId = @RecruiterId AND Status = 'Open'
      ORDER BY PostedAt DESC
    `),
    pool.request().input("RecruiterId", sql.Int, recruiterId).query(`
      SELECT TOP 5 c.Id AS CandidateId, u.FullName, a.MatchScore, j.Title AS AppliedForJobTitle
      FROM Applications a
      JOIN Candidates c ON c.Id = a.CandidateId
      JOIN Users u ON u.Id = c.UserId
      JOIN Jobs j ON j.Id = a.JobId
      WHERE j.RecruiterId = @RecruiterId
      ORDER BY a.MatchScore DESC
    `),
  ]);

  const statusCounts = Object.fromEntries(jobCounts.recordset.map((r) => [r.Status, r.Count]));

  return {
    totalJobs: jobCounts.recordset.reduce((sum, r) => sum + r.Count, 0),
    openJobs: statusCounts["Open"] || 0,
    closedJobs: statusCounts["Closed"] || 0,
    totalApplicants: applicantCount.recordset[0].Count,
    activeJobs: activeJobs.recordset,
    topCandidates: topCandidates.recordset,
  };
}

async function getAdminDashboard() {
  const pool = await getPool();

  const [userCounts, jobCount, recentAuditLogs] = await Promise.all([
    pool.request().query(`SELECT Role, COUNT(*) AS Count FROM Users GROUP BY Role`),
    pool.request().query(`SELECT COUNT(*) AS Count FROM Jobs`),
    pool.request().query(`
      SELECT TOP 5 al.Action, al.CreatedAt, u.FullName AS ActorName
      FROM AuditLogs al
      LEFT JOIN Users u ON u.Id = al.ActorUserId
      ORDER BY al.CreatedAt DESC
    `),
  ]);

  const roleCounts = Object.fromEntries(userCounts.recordset.map((r) => [r.Role, r.Count]));

  return {
    totalUsers: userCounts.recordset.reduce((sum, r) => sum + r.Count, 0),
    candidates: roleCounts["Candidate"] || 0,
    recruiters: roleCounts["Recruiter"] || 0,
    admins: roleCounts["Admin"] || 0,
    totalJobs: jobCount.recordset[0].Count,
    recentAuditLogs: recentAuditLogs.recordset.map((r) => ({
      action: r.Action,
      createdAt: r.CreatedAt,
      actorName: r.ActorName || "System",
    })),
  };
}

module.exports = { getCandidateDashboard, getRecruiterDashboard, getAdminDashboard };
