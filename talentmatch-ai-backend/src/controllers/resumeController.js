const resumeModel = require("../models/resumeModel");
const profileModel = require("../models/profileModel");

async function uploadResume(req, res, next) {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded. Attach a file under the 'resume' field." });
    }

    const candidateId = await profileModel.getCandidateIdByUserId(req.user.id);
    const { candidate, parsingError, extractedSummary } = await resumeModel.saveResumeToProfile(
      req.user.id,
      candidateId,
      req.file
    );

    res.json({
      message: "Resume uploaded and processed.",
      resumeBlobUrl: candidate.ResumeBlobUrl,
      resumeScore: candidate.ResumeScore,
      parsingError,
      extractedSummary,
    });
  } catch (err) {
    next(err);
  }
}

module.exports = { uploadResume };
