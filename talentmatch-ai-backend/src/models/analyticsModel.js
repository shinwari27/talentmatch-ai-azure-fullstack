const { sql, getPool } = require("../config/db");

/**
 * All four charts are scoped to the requesting recruiter's own jobs, not
 * platform-wide — matching the same "recruiters only see their own data"
 * principle used in Candidate Management.
 */

async function getApplicationTrend(recruiterId) {
  const pool = await getPool();
  const result = await pool.request().input("RecruiterId", sql.Int, recruiterId).query(`
    SELECT
      FORMAT(a.AppliedAt, 'yyyy-MM') AS Month,
      COUNT(*) AS Applications
    FROM Applications a
    JOIN Jobs j ON j.Id = a.JobId
    WHERE j.RecruiterId = @RecruiterId
      AND a.AppliedAt >= DATEADD(MONTH, -6, SYSUTCDATETIME())
    GROUP BY FORMAT(a.AppliedAt, 'yyyy-MM')
    ORDER BY Month
  `);
  return result.recordset;
}

async function getSkillDistribution(recruiterId) {
  const pool = await getPool();
  const result = await pool.request().input("RecruiterId", sql.Int, recruiterId).query(`
    SELECT TOP 6 s.Name, COUNT(*) AS Value
    FROM Applications a
    JOIN Jobs j ON j.Id = a.JobId
    JOIN CandidateSkills cs ON cs.CandidateId = a.CandidateId
    JOIN Skills s ON s.Id = cs.SkillId
    WHERE j.RecruiterId = @RecruiterId
    GROUP BY s.Name
    ORDER BY COUNT(*) DESC
  `);
  return result.recordset;
}

/**
 * Proxy metric: Candidates doesn't store a computed "years of experience"
 * value (it's derived from potentially many Experience entries with no
 * single canonical total), so this buckets applicants by the experience
 * LEVEL REQUESTED BY THE JOB they applied to instead — a reasonable stand-in
 * for "what experience level is applying to my roles" without needing a
 * separate years-of-experience calculation engine. Worth revisiting if a
 * real seniority calculation gets added to the Candidates table later.
 */
async function getExperienceDistribution(recruiterId) {
  const pool = await getPool();
  const result = await pool.request().input("RecruiterId", sql.Int, recruiterId).query(`
    SELECT j.ExperienceRequired AS Name, COUNT(*) AS Value
    FROM Applications a
    JOIN Jobs j ON j.Id = a.JobId
    WHERE j.RecruiterId = @RecruiterId AND j.ExperienceRequired IS NOT NULL
    GROUP BY j.ExperienceRequired
    ORDER BY COUNT(*) DESC
  `);
  return result.recordset;
}

async function getHiringFunnel(recruiterId) {
  const pool = await getPool();
  const result = await pool.request().input("RecruiterId", sql.Int, recruiterId).query(`
    SELECT a.Status AS Stage, COUNT(*) AS Value
    FROM Applications a
    JOIN Jobs j ON j.Id = a.JobId
    WHERE j.RecruiterId = @RecruiterId
    GROUP BY a.Status
  `);

  // Return every stage even if zero, in a fixed pipeline order — the
  // frontend chart expects a consistent stage order, not just whatever
  // rows happen to exist.
  const stageOrder = ["Applied", "Under Review", "Interview", "Offer", "Rejected"];
  const counts = Object.fromEntries(result.recordset.map((r) => [r.Stage, r.Value]));
  return stageOrder.map((stage) => ({ stage, value: counts[stage] || 0 }));
}

/**
 * Match Statistics — new for Phase 12, built on top of the real scores
 * Phase 11 started producing. Returns both an aggregate view (across every
 * job this recruiter owns) and a per-job breakdown, since a recruiter
 * managing several roles needs to see both "how am I doing overall" and
 * "which specific posting is attracting strong candidates."
 */
async function getMatchStatistics(recruiterId) {
  const pool = await getPool();

  const overall = await pool.request().input("RecruiterId", sql.Int, recruiterId).query(`
    SELECT AVG(a.MatchScore) AS AvgScore, COUNT(a.MatchScore) AS TotalScored, MAX(a.MatchScore) AS TopScore
    FROM Applications a
    JOIN Jobs j ON j.Id = a.JobId
    WHERE j.RecruiterId = @RecruiterId AND a.MatchScore IS NOT NULL
  `);

  const distribution = await pool.request().input("RecruiterId", sql.Int, recruiterId).query(`
    SELECT
      CASE
        WHEN a.MatchScore >= 76 THEN '76-100'
        WHEN a.MatchScore >= 51 THEN '51-75'
        WHEN a.MatchScore >= 26 THEN '26-50'
        ELSE '0-25'
      END AS Bucket,
      COUNT(*) AS Value
    FROM Applications a
    JOIN Jobs j ON j.Id = a.JobId
    WHERE j.RecruiterId = @RecruiterId AND a.MatchScore IS NOT NULL
    GROUP BY
      CASE
        WHEN a.MatchScore >= 76 THEN '76-100'
        WHEN a.MatchScore >= 51 THEN '51-75'
        WHEN a.MatchScore >= 26 THEN '26-50'
        ELSE '0-25'
      END
  `);

  const perJob = await pool.request().input("RecruiterId", sql.Int, recruiterId).query(`
    SELECT j.Id AS JobId, j.Title,
           COUNT(a.Id) AS ApplicantCount,
           AVG(a.MatchScore) AS AvgScore,
           MAX(a.MatchScore) AS TopScore
    FROM Jobs j
    LEFT JOIN Applications a ON a.JobId = j.Id AND a.MatchScore IS NOT NULL
    WHERE j.RecruiterId = @RecruiterId
    GROUP BY j.Id, j.Title
    ORDER BY AVG(a.MatchScore) DESC
  `);

  // Ensure all four buckets always appear (even at zero) so the chart's
  // x-axis stays consistent regardless of what data currently exists.
  const bucketOrder = ["0-25", "26-50", "51-75", "76-100"];
  const bucketCounts = Object.fromEntries(distribution.recordset.map((r) => [r.Bucket, r.Value]));

  return {
    overall: {
      avgScore: overall.recordset[0].AvgScore != null ? Math.round(overall.recordset[0].AvgScore) : null,
      totalScored: overall.recordset[0].TotalScored,
      topScore: overall.recordset[0].TopScore,
    },
    distribution: bucketOrder.map((bucket) => ({ bucket, value: bucketCounts[bucket] || 0 })),
    perJob: perJob.recordset.map((j) => ({
      jobId: j.JobId,
      title: j.Title,
      applicantCount: j.ApplicantCount,
      avgScore: j.AvgScore != null ? Math.round(j.AvgScore) : null,
      topScore: j.TopScore,
    })),
  };
}

module.exports = { getApplicationTrend, getSkillDistribution, getExperienceDistribution, getHiringFunnel, getMatchStatistics };
