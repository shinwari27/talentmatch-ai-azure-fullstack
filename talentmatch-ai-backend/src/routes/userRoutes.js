const express = require("express");
const { requireAuth, requireRole } = require("../middleware/auth");
const { passwordChangeLimiter } = require("../middleware/rateLimiter");
const profileController = require("../controllers/profileController");
const {
  educationController,
  experienceController,
  projectController,
} = require("../controllers/candidateDetailsControllers");
const skillController = require("../controllers/skillController");
const languageController = require("../controllers/languageController");
const certificationController = require("../controllers/certificationController");

const router = express.Router();

router.use(requireAuth); // every route below requires a logged-in user

router.get("/me/profile", profileController.getMyProfile);
router.put("/me/profile", profileController.updateMyProfile);
router.put("/me/password", passwordChangeLimiter, profileController.changePassword);

// Education / Experience / Certifications / Projects — Candidate-only sub-resources
const candidateOnly = requireRole("Candidate");

router.get("/me/education", candidateOnly, educationController.list);
router.post("/me/education", candidateOnly, educationController.create);
router.put("/me/education/:id", candidateOnly, educationController.update);
router.delete("/me/education/:id", candidateOnly, educationController.remove);
router.patch("/me/education/:id/verify", candidateOnly, educationController.verify);

router.get("/me/experience", candidateOnly, experienceController.list);
router.post("/me/experience", candidateOnly, experienceController.create);
router.put("/me/experience/:id", candidateOnly, experienceController.update);
router.delete("/me/experience/:id", candidateOnly, experienceController.remove);
router.patch("/me/experience/:id/verify", candidateOnly, experienceController.verify);

router.get("/me/certifications", candidateOnly, certificationController.listMyCertifications);
router.post("/me/certifications", candidateOnly, certificationController.addCertification);
router.delete("/me/certifications/:certificationId", candidateOnly, certificationController.removeCertification);

router.get("/me/projects", candidateOnly, projectController.list);
router.post("/me/projects", candidateOnly, projectController.create);
router.put("/me/projects/:id", candidateOnly, projectController.update);
router.delete("/me/projects/:id", candidateOnly, projectController.remove);

router.get("/me/skills", candidateOnly, skillController.listMySkills);
router.post("/me/skills", candidateOnly, skillController.addSkill);
router.delete("/me/skills/:skillId", candidateOnly, skillController.removeSkill);

router.get("/me/languages", candidateOnly, languageController.listMyLanguages);
router.post("/me/languages", candidateOnly, languageController.addLanguage);
router.delete("/me/languages/:languageId", candidateOnly, languageController.removeLanguage);

module.exports = router;
