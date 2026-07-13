const express = require("express");
const { requireAuth, requireRole } = require("../middleware/auth");
const { jobValidation } = require("../middleware/validators");
const jobController = require("../controllers/jobController");
const applicationController = require("../controllers/applicationController");

const router = express.Router();

// --- Public / candidate browsing (no auth required to view) ---
router.get("/", jobController.listOpenJobs);

// --- Recruiter management (must come before "/:id" so "mine" isn't parsed as an id) ---
router.get("/mine", requireAuth, requireRole("Recruiter"), jobController.listMyJobs);
router.post("/", requireAuth, requireRole("Recruiter"), jobValidation, jobController.createJob);

router.get("/:id", jobController.getJob);
router.put("/:id", requireAuth, requireRole("Recruiter"), jobValidation, jobController.updateJob);
router.patch("/:id/close", requireAuth, requireRole("Recruiter"), jobController.closeJob);
router.patch("/:id/reopen", requireAuth, requireRole("Recruiter"), jobController.reopenJob);
router.delete("/:id", requireAuth, requireRole("Recruiter"), jobController.deleteJob);

// --- Applications ---
router.post("/:jobId/apply", requireAuth, requireRole("Candidate"), applicationController.applyToJob);
router.get(
  "/:jobId/applications",
  requireAuth,
  requireRole("Recruiter"),
  applicationController.listApplicationsForJob
);
router.post(
  "/:jobId/rank",
  requireAuth,
  requireRole("Recruiter"),
  applicationController.rankCandidatesForJob
);

module.exports = router;
