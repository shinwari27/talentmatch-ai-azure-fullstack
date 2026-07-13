const express = require("express");
const { requireAuth, requireRole } = require("../middleware/auth");
const analyticsController = require("../controllers/analyticsController");

const router = express.Router();

router.get("/", requireAuth, requireRole("Recruiter"), analyticsController.getAnalytics);

module.exports = router;
