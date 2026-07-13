const express = require("express");
const { requireAuth, requireRole } = require("../middleware/auth");
const candidateController = require("../controllers/candidateController");

const router = express.Router();

router.use(requireAuth, requireRole("Recruiter", "Admin"));

router.get("/", candidateController.listCandidates);
router.get("/:id", candidateController.getCandidate);

module.exports = router;
