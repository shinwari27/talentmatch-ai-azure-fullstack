const { sql, getPool } = require("../config/db");

/**
 * Responsibilities and Benefits are stored as JSON text in the database
 * (per the Phase 6 schema decision — simple ordered lists with no identity
 * of their own). This model parses them back into real arrays on the way
 * out and stringifies them on the way in, so controllers never have to
 * think about the JSON encoding at all.
 */
function parseJobRow(row) {
  if (!row) return row;
  return {
    ...row,
    Responsibilities: row.Responsibilities ? JSON.parse(row.Responsibilities) : [],
    Benefits: row.Benefits ? JSON.parse(row.Benefits) : [],
  };
}

async function listJobs({ search, location, category, experience, status = "Open", page = 1, pageSize = 10 }) {
  const pool = await getPool();
  const offset = (page - 1) * pageSize;

  const request = pool.request().input("Offset", sql.Int, offset).input("PageSize", sql.Int, pageSize);

  const whereClauses = ["Status = @Status"];
  request.input("Status", sql.NVarChar(20), status);

  if (search) {
    request.input("Search", sql.NVarChar(255), `%${search}%`);
    whereClauses.push("(Title LIKE @Search OR CompanyName LIKE @Search)");
  }
  if (location) {
    request.input("Location", sql.NVarChar(150), location);
    whereClauses.push("Location = @Location");
  }
  if (category) {
    request.input("Category", sql.NVarChar(100), category);
    whereClauses.push("Category = @Category");
  }
  if (experience) {
    request.input("Experience", sql.NVarChar(50), experience);
    whereClauses.push("ExperienceRequired = @Experience");
  }

  const whereSql = `WHERE ${whereClauses.join(" AND ")}`;

  const result = await request.query(`
    SELECT * FROM Jobs
    ${whereSql}
    ORDER BY PostedAt DESC
    OFFSET @Offset ROWS FETCH NEXT @PageSize ROWS ONLY
  `);

  const countResult = await request.query(`SELECT COUNT(*) AS Total FROM Jobs ${whereSql}`);

  return {
    jobs: result.recordset.map(parseJobRow),
    total: countResult.recordset[0].Total,
    page,
    pageSize,
  };
}

async function getJobById(id) {
  const pool = await getPool();
  const result = await pool.request().input("Id", sql.Int, id).query("SELECT * FROM Jobs WHERE Id = @Id");
  return parseJobRow(result.recordset[0]) || null;
}

async function listJobsByRecruiter(recruiterId) {
  const pool = await getPool();
  const result = await pool
    .request()
    .input("RecruiterId", sql.Int, recruiterId)
    .query("SELECT * FROM Jobs WHERE RecruiterId = @RecruiterId ORDER BY PostedAt DESC");
  return result.recordset.map(parseJobRow);
}

async function createJob(recruiterId, data) {
  const pool = await getPool();
  const result = await pool
    .request()
    .input("RecruiterId", sql.Int, recruiterId)
    .input("Title", sql.NVarChar(200), data.title)
    .input("CompanyName", sql.NVarChar(200), data.companyName)
    .input("Location", sql.NVarChar(150), data.location)
    .input("IsRemote", sql.Bit, !!data.isRemote)
    .input("EmploymentType", sql.NVarChar(50), data.employmentType || "Full-time")
    .input("SalaryMin", sql.Decimal(10, 2), data.salaryMin ?? null)
    .input("SalaryMax", sql.Decimal(10, 2), data.salaryMax ?? null)
    .input("ExperienceRequired", sql.NVarChar(50), data.experienceRequired ?? null)
    .input("EducationRequirement", sql.NVarChar(300), data.educationRequirement ?? null)
    .input("Category", sql.NVarChar(100), data.category ?? null)
    .input("Description", sql.NVarChar(sql.MAX), data.description)
    .input("Responsibilities", sql.NVarChar(sql.MAX), JSON.stringify(data.responsibilities || []))
    .input("Benefits", sql.NVarChar(sql.MAX), JSON.stringify(data.benefits || []))
    .input("Status", sql.NVarChar(20), data.status || "Open")
    .query(`
      INSERT INTO Jobs (
        RecruiterId, Title, CompanyName, Location, IsRemote, EmploymentType,
        SalaryMin, SalaryMax, ExperienceRequired, EducationRequirement, Category,
        Description, Responsibilities, Benefits, Status
      )
      OUTPUT INSERTED.*
      VALUES (
        @RecruiterId, @Title, @CompanyName, @Location, @IsRemote, @EmploymentType,
        @SalaryMin, @SalaryMax, @ExperienceRequired, @EducationRequirement, @Category,
        @Description, @Responsibilities, @Benefits, @Status
      )
    `);
  return parseJobRow(result.recordset[0]);
}

async function updateJob(recruiterId, jobId, data) {
  const pool = await getPool();
  const result = await pool
    .request()
    .input("Id", sql.Int, jobId)
    .input("RecruiterId", sql.Int, recruiterId)
    .input("Title", sql.NVarChar(200), data.title)
    .input("CompanyName", sql.NVarChar(200), data.companyName)
    .input("Location", sql.NVarChar(150), data.location)
    .input("IsRemote", sql.Bit, !!data.isRemote)
    .input("EmploymentType", sql.NVarChar(50), data.employmentType || "Full-time")
    .input("SalaryMin", sql.Decimal(10, 2), data.salaryMin ?? null)
    .input("SalaryMax", sql.Decimal(10, 2), data.salaryMax ?? null)
    .input("ExperienceRequired", sql.NVarChar(50), data.experienceRequired ?? null)
    .input("EducationRequirement", sql.NVarChar(300), data.educationRequirement ?? null)
    .input("Category", sql.NVarChar(100), data.category ?? null)
    .input("Description", sql.NVarChar(sql.MAX), data.description)
    .input("Responsibilities", sql.NVarChar(sql.MAX), JSON.stringify(data.responsibilities || []))
    .input("Benefits", sql.NVarChar(sql.MAX), JSON.stringify(data.benefits || []))
    .query(`
      UPDATE Jobs
      SET Title = @Title, CompanyName = @CompanyName, Location = @Location, IsRemote = @IsRemote,
          EmploymentType = @EmploymentType, SalaryMin = @SalaryMin, SalaryMax = @SalaryMax,
          ExperienceRequired = @ExperienceRequired, EducationRequirement = @EducationRequirement,
          Category = @Category, Description = @Description, Responsibilities = @Responsibilities,
          Benefits = @Benefits
      OUTPUT INSERTED.*
      WHERE Id = @Id AND RecruiterId = @RecruiterId
    `);
  return parseJobRow(result.recordset[0]) || null;
}

async function setJobStatus(recruiterId, jobId, status) {
  const pool = await getPool();
  const result = await pool
    .request()
    .input("Id", sql.Int, jobId)
    .input("RecruiterId", sql.Int, recruiterId)
    .input("Status", sql.NVarChar(20), status)
    .query(`
      UPDATE Jobs
      SET Status = @Status, ClosedAt = CASE WHEN @Status = 'Closed' THEN SYSUTCDATETIME() ELSE ClosedAt END
      OUTPUT INSERTED.*
      WHERE Id = @Id AND RecruiterId = @RecruiterId
    `);
  return parseJobRow(result.recordset[0]) || null;
}

/**
 * Hard-delete is only allowed when a job has zero applications — matching
 * the Phase 6 schema decision (Applications.JobId has no cascade delete).
 * A job with applicants must be Closed instead, preserving application history.
 */
async function deleteJob(recruiterId, jobId) {
  const pool = await getPool();

  const applicationCount = await pool
    .request()
    .input("JobId", sql.Int, jobId)
    .query("SELECT COUNT(*) AS Count FROM Applications WHERE JobId = @JobId");

  if (applicationCount.recordset[0].Count > 0) {
    const err = new Error("This job has applications and cannot be deleted. Close it instead.");
    err.status = 409;
    throw err;
  }

  const result = await pool
    .request()
    .input("Id", sql.Int, jobId)
    .input("RecruiterId", sql.Int, recruiterId)
    .query("DELETE FROM Jobs OUTPUT DELETED.Id WHERE Id = @Id AND RecruiterId = @RecruiterId");

  return result.recordset.length > 0;
}

async function getRecruiterUserIdForJob(jobId) {
  const pool = await getPool();
  const result = await pool
    .request()
    .input("JobId", sql.Int, jobId)
    .query(`
      SELECT r.UserId
      FROM Jobs j JOIN Recruiters r ON r.Id = j.RecruiterId
      WHERE j.Id = @JobId
    `);
  return result.recordset[0]?.UserId || null;
}

module.exports = {
  listJobs,
  getJobById,
  listJobsByRecruiter,
  createJob,
  updateJob,
  setJobStatus,
  deleteJob,
  getRecruiterUserIdForJob,
};
