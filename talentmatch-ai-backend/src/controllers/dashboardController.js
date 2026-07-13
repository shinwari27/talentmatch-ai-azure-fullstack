const dashboardModel = require("../models/dashboardModel");
const profileModel = require("../models/profileModel");

/**
 * One endpoint, role-aware — the frontend just calls GET /api/dashboard
 * regardless of who's logged in, and gets back whichever shape matches
 * their role. Simpler for the frontend than three separate endpoints it
 * has to know to pick between.
 */
async function getDashboard(req, res, next) {
  try {
    if (req.user.role === "Candidate") {
      const candidateId = await profileModel.getCandidateIdByUserId(req.user.id);
      return res.json(await dashboardModel.getCandidateDashboard(candidateId));
    }

    if (req.user.role === "Recruiter") {
      const recruiterId = await profileModel.getRecruiterIdByUserId(req.user.id);
      return res.json(await dashboardModel.getRecruiterDashboard(recruiterId));
    }

    // Admin
    return res.json(await dashboardModel.getAdminDashboard());
  } catch (err) {
    next(err);
  }
}

module.exports = { getDashboard };
