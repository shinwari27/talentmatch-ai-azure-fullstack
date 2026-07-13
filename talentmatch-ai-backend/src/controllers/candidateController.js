const candidateModel = require("../models/candidateModel");
const profileModel = require("../models/profileModel");

async function listCandidates(req, res, next) {
  try {
    const { search, location, skill } = req.query;
    const filters = { search, location, skill };

    if (req.user.role === "Admin") {
      const candidates = await candidateModel.listAllCandidatesAsAdmin(filters);
      return res.json(candidates);
    }

    const recruiterId = await profileModel.getRecruiterIdByUserId(req.user.id);
    const candidates = await candidateModel.listCandidatesForRecruiter(recruiterId, filters);
    res.json(candidates);
  } catch (err) {
    next(err);
  }
}

async function getCandidate(req, res, next) {
  try {
    const candidateId = req.params.id;

    if (req.user.role !== "Admin") {
      const recruiterId = await profileModel.getRecruiterIdByUserId(req.user.id);
      const visible = await candidateModel.candidateVisibleToRecruiter(candidateId, recruiterId);
      if (!visible) {
        return res.status(403).json({
          error: "You can only view candidates who have applied to one of your job postings.",
        });
      }
    }

    const candidate = await candidateModel.getCandidateDetail(candidateId);
    if (!candidate) {
      return res.status(404).json({ error: "Candidate not found." });
    }
    res.json(candidate);
  } catch (err) {
    next(err);
  }
}

module.exports = { listCandidates, getCandidate };
