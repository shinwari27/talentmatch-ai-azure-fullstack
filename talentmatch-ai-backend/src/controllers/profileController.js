const profileModel = require("../models/profileModel");
const { hashPassword, verifyPassword } = require("../utils/password");
const userModel = require("../models/userModel");

async function getMyProfile(req, res, next) {
  try {
    const profile =
      req.user.role === "Candidate"
        ? await profileModel.getCandidateProfile(req.user.id)
        : await profileModel.getRecruiterProfile(req.user.id);

    if (!profile) {
      return res.status(404).json({ error: "Profile not found." });
    }
    res.json(profile);
  } catch (err) {
    next(err);
  }
}

async function updateMyProfile(req, res, next) {
  try {
    const profile =
      req.user.role === "Candidate"
        ? await profileModel.updateCandidateProfile(req.user.id, req.body)
        : await profileModel.updateRecruiterProfile(req.user.id, req.body);

    res.json(profile);
  } catch (err) {
    next(err);
  }
}

async function changePassword(req, res, next) {
  try {
    const { currentPassword, newPassword } = req.body;

    const user = await userModel.findById(req.user.id);
    const isCorrect = await verifyPassword(currentPassword, user.PasswordHash);
    if (!isCorrect) {
      return res.status(401).json({ error: "Current password is incorrect." });
    }

    const newHash = await hashPassword(newPassword);
    await userModel.updatePassword(req.user.id, newHash);

    res.json({ message: "Password updated." });
  } catch (err) {
    next(err);
  }
}

module.exports = { getMyProfile, updateMyProfile, changePassword };
