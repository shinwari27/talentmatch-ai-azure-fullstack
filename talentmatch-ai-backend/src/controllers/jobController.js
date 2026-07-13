const jobModel = require("../models/jobModel");
const jobSkillModel = require("../models/jobSkillModel");
const jobCertificationModel = require("../models/jobCertificationModel");
const jobLanguageModel = require("../models/jobLanguageModel");
const profileModel = require("../models/profileModel");

// Public/candidate-facing: browse open jobs
async function listOpenJobs(req, res, next) {
  try {
    const { search, location, category, experience, page } = req.query;
    const result = await jobModel.listJobs({
      search,
      location,
      category,
      experience,
      status: "Open",
      page: page ? parseInt(page, 10) : 1,
    });

    // Attach each job's required skills — the frontend's job cards show these.
    const jobsWithSkills = await Promise.all(
      result.jobs.map(async (job) => ({
        ...job,
        skills: await jobSkillModel.listJobSkills(job.Id),
      }))
    );

    res.json({ ...result, jobs: jobsWithSkills });
  } catch (err) {
    next(err);
  }
}

async function getJob(req, res, next) {
  try {
    const job = await jobModel.getJobById(req.params.id);
    if (!job) {
      return res.status(404).json({ error: "Job not found." });
    }
    const skills = await jobSkillModel.listJobSkills(job.Id);
    const preferredCertifications = await jobCertificationModel.listJobCertifications(job.Id);
    const preferredLanguages = await jobLanguageModel.listJobLanguages(job.Id);
    res.json({ ...job, skills, preferredCertifications, preferredLanguages });
  } catch (err) {
    next(err);
  }
}

// Recruiter-facing: manage their own jobs
async function listMyJobs(req, res, next) {
  try {
    const recruiterId = await profileModel.getRecruiterIdByUserId(req.user.id);
    const jobs = await jobModel.listJobsByRecruiter(recruiterId);
    res.json(jobs);
  } catch (err) {
    next(err);
  }
}

async function createJob(req, res, next) {
  try {
    const recruiterId = await profileModel.getRecruiterIdByUserId(req.user.id);
    const job = await jobModel.createJob(recruiterId, req.body);

    const skills = req.body.skills?.length ? await jobSkillModel.setJobSkills(job.Id, req.body.skills) : [];
    const preferredCertifications = req.body.preferredCertifications?.length
      ? await jobCertificationModel.setJobCertifications(job.Id, req.body.preferredCertifications)
      : [];
    const preferredLanguages = req.body.preferredLanguages?.length
      ? await jobLanguageModel.setJobLanguages(job.Id, req.body.preferredLanguages)
      : [];

    res.status(201).json({ ...job, skills, preferredCertifications, preferredLanguages });
  } catch (err) {
    next(err);
  }
}

async function updateJob(req, res, next) {
  try {
    const recruiterId = await profileModel.getRecruiterIdByUserId(req.user.id);
    const job = await jobModel.updateJob(recruiterId, req.params.id, req.body);
    if (!job) {
      return res.status(404).json({ error: "Job not found, or it doesn't belong to you." });
    }

    const skills = req.body.skills
      ? await jobSkillModel.setJobSkills(job.Id, req.body.skills)
      : await jobSkillModel.listJobSkills(job.Id);
    const preferredCertifications = req.body.preferredCertifications
      ? await jobCertificationModel.setJobCertifications(job.Id, req.body.preferredCertifications)
      : await jobCertificationModel.listJobCertifications(job.Id);
    const preferredLanguages = req.body.preferredLanguages
      ? await jobLanguageModel.setJobLanguages(job.Id, req.body.preferredLanguages)
      : await jobLanguageModel.listJobLanguages(job.Id);

    res.json({ ...job, skills, preferredCertifications, preferredLanguages });
  } catch (err) {
    next(err);
  }
}

async function closeJob(req, res, next) {
  try {
    const recruiterId = await profileModel.getRecruiterIdByUserId(req.user.id);
    const job = await jobModel.setJobStatus(recruiterId, req.params.id, "Closed");
    if (!job) {
      return res.status(404).json({ error: "Job not found, or it doesn't belong to you." });
    }
    res.json(job);
  } catch (err) {
    next(err);
  }
}

async function reopenJob(req, res, next) {
  try {
    const recruiterId = await profileModel.getRecruiterIdByUserId(req.user.id);
    const job = await jobModel.setJobStatus(recruiterId, req.params.id, "Open");
    if (!job) {
      return res.status(404).json({ error: "Job not found, or it doesn't belong to you." });
    }
    res.json(job);
  } catch (err) {
    next(err);
  }
}

async function deleteJob(req, res, next) {
  try {
    const recruiterId = await profileModel.getRecruiterIdByUserId(req.user.id);
    const deleted = await jobModel.deleteJob(recruiterId, req.params.id);
    if (!deleted) {
      return res.status(404).json({ error: "Job not found, or it doesn't belong to you." });
    }
    res.status(204).send();
  } catch (err) {
    next(err); // a 409 from the model (job has applications) flows through to the error handler correctly
  }
}

module.exports = {
  listOpenJobs,
  getJob,
  listMyJobs,
  createJob,
  updateJob,
  closeJob,
  reopenJob,
  deleteJob,
};
