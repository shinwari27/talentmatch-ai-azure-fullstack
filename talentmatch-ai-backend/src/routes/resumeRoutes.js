const express = require("express");
const multer = require("multer");
const { requireAuth, requireRole } = require("../middleware/auth");
const { resumeUploadLimiter } = require("../middleware/rateLimiter");
const { uploadResumeMiddleware } = require("../middleware/upload");
const resumeController = require("../controllers/resumeController");

const router = express.Router();

/**
 * Multer reports file-too-large / wrong-type errors by calling next(err)
 * itself, but those errors don't carry an HTTP status the generic error
 * handler understands — without this wrapper they'd fall through as a
 * generic 500 instead of a clear 400.
 */
function handleUploadErrors(req, res, next) {
  uploadResumeMiddleware(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      return res.status(400).json({ error: err.message });
    }
    if (err) {
      return res.status(400).json({ error: err.message });
    }
    next();
  });
}

router.post(
  "/upload",
  requireAuth,
  requireRole("Candidate"),
  resumeUploadLimiter,
  handleUploadErrors,
  resumeController.uploadResume
);

module.exports = router;
