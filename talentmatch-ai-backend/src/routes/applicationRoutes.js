const express = require("express");
const { requireAuth, requireRole } = require("../middleware/auth");
const applicationController = require("../controllers/applicationController");

const router = express.Router();

router.get("/mine", requireAuth, requireRole("Candidate"), applicationController.listMyApplications);
router.post("/:id/recalculate", requireAuth, requireRole("Candidate"), applicationController.recalculateMyMatch);
router.patch("/:id/status", requireAuth, requireRole("Recruiter"), applicationController.updateApplicationStatus);

module.exports = router;
