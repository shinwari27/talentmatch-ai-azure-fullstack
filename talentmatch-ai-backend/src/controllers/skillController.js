const skillModel = require("../models/skillModel");
const profileModel = require("../models/profileModel");

async function listMySkills(req, res, next) {
  try {
    const candidateId = await profileModel.getCandidateIdByUserId(req.user.id);
    const skills = await skillModel.listCandidateSkills(candidateId);
    res.json(skills);
  } catch (err) {
    next(err);
  }
}

async function addSkill(req, res, next) {
  try {
    const { name } = req.body;
    if (!name || !name.trim()) {
      return res.status(400).json({ error: "Skill name is required." });
    }
    const candidateId = await profileModel.getCandidateIdByUserId(req.user.id);
    const skill = await skillModel.addSkillToCandidate(candidateId, name);
    res.status(201).json(skill);
  } catch (err) {
    next(err);
  }
}

async function removeSkill(req, res, next) {
  try {
    const candidateId = await profileModel.getCandidateIdByUserId(req.user.id);
    const removed = await skillModel.removeSkillFromCandidate(candidateId, req.params.skillId);
    if (!removed) {
      return res.status(404).json({ error: "Skill not found on this profile." });
    }
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}

module.exports = { listMySkills, addSkill, removeSkill };
