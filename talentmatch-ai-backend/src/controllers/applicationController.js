const applicationModel = require("../models/applicationModel");
const jobModel = require("../models/jobModel");
const profileModel = require("../models/profileModel");
const matchModel = require("../models/matchModel");
const notificationModel = require("../models/notificationModel");
const { trackEvent } = require("../utils/telemetry");

async function applyToJob(req, res, next) {
  try {
    const candidateId = await profileModel.getCandidateIdByUserId(req.user.id);
    const job = await jobModel.getJobById(req.params.jobId);

    if (!job) {
      return res.status(404).json({ error: "Job not found." });
    }
    if (job.Status !== "Open") {
      return res.status(400).json({ error: "This job is no longer accepting applications." });
    }

    const existing = await applicationModel.findExisting(req.params.jobId, candidateId);
    if (existing) {
      return res.status(409).json({ error: "You have already applied to this job." });
    }

    const application = await applicationModel.createApplication(req.params.jobId, candidateId);

    // Calculate the match score immediately so the candidate and recruiter
    // both see it right away — a failure here shouldn't block the
    // application itself from succeeding (the application is already
    // saved), so it's logged rather than thrown.
    try {
      const matchResult = await matchModel.calculateMatchForCandidateAndJob(candidateId, req.params.jobId);
      await matchModel.saveMatchResultToApplication(application.Id, matchResult);
      application.MatchScore = matchResult.overallScore;
      application.MatchBreakdown = matchResult;
    } catch (matchErr) {
      console.error("Match calculation failed on apply (application still saved):", matchErr.message);
    }

    res.status(201).json(application);

    trackEvent("ApplicationSubmitted", { jobId: String(req.params.jobId), candidateId: String(candidateId) });

    // Notification is fire-and-forget after the response is already sent —
    // a candidate's application should never fail or feel slow because of
    // a notification-insert hiccup on the recruiter's side.
    try {
      const recruiterUserId = await jobModel.getRecruiterUserIdForJob(req.params.jobId);
      if (recruiterUserId) {
        await notificationModel.createNotification(
          recruiterUserId,
          "New application received",
          `A candidate applied to your posting: ${job.Title}`,
          "info"
        );
      }
    } catch (notifyErr) {
      console.error("Failed to create recruiter notification (application still succeeded):", notifyErr.message);
    }
  } catch (err) {
    next(err);
  }
}

async function listMyApplications(req, res, next) {
  try {
    const candidateId = await profileModel.getCandidateIdByUserId(req.user.id);
    const applications = await applicationModel.listApplicationsForCandidate(candidateId);
    res.json(applications);
  } catch (err) {
    next(err);
  }
}

async function listApplicationsForJob(req, res, next) {
  try {
    const recruiterId = await profileModel.getRecruiterIdByUserId(req.user.id);
    const applications = await applicationModel.listApplicationsForJob(req.params.jobId, recruiterId);
    res.json(applications);
  } catch (err) {
    next(err);
  }
}

async function updateApplicationStatus(req, res, next) {
  try {
    const { status } = req.body;
    const validStatuses = ["Applied", "Under Review", "Interview", "Offer", "Rejected"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: `Status must be one of: ${validStatuses.join(", ")}` });
    }

    const recruiterId = await profileModel.getRecruiterIdByUserId(req.user.id);
    const application = await applicationModel.updateApplicationStatus(req.params.id, recruiterId, status);
    if (!application) {
      return res.status(404).json({ error: "Application not found, or its job doesn't belong to you." });
    }
    res.json(application);

    try {
      const candidateUserId = await profileModel.getUserIdByCandidateId(application.CandidateId);
      if (candidateUserId) {
        await notificationModel.createNotification(
          candidateUserId,
          "Application status updated",
          `Your application status changed to "${status}".`,
          status === "Rejected" ? "warning" : status === "Offer" ? "success" : "info"
        );
      }
    } catch (notifyErr) {
      console.error("Failed to create candidate notification (status update still succeeded):", notifyErr.message);
    }
  } catch (err) {
    next(err);
  }
}

async function rankCandidatesForJob(req, res, next) {
  try {
    const recruiterId = await profileModel.getRecruiterIdByUserId(req.user.id);
    const rankedResults = await matchModel.rankApplicationsForJob(req.params.jobId, recruiterId);
    res.json(rankedResults);
  } catch (err) {
    next(err);
  }
}

async function recalculateMyMatch(req, res, next) {
  try {
    const candidateId = await profileModel.getCandidateIdByUserId(req.user.id);

    // Ownership check: fetch the application and confirm it actually
    // belongs to this candidate before recalculating anything.
    const applications = await applicationModel.listApplicationsForCandidate(candidateId);
    const application = applications.find((a) => a.Id === Number(req.params.id));
    if (!application) {
      return res.status(404).json({ error: "Application not found." });
    }

    const matchResult = await matchModel.calculateMatchForCandidateAndJob(candidateId, application.JobId);
    await matchModel.saveMatchResultToApplication(application.Id, matchResult);

    res.json({ ...application, MatchScore: matchResult.overallScore, MatchBreakdown: matchResult });
  } catch (err) {
    next(err);
  }
}

module.exports = { applyToJob, listMyApplications, listApplicationsForJob, updateApplicationStatus, rankCandidatesForJob, recalculateMyMatch };
