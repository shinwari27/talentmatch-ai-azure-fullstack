const languageModel = require("../models/languageModel");
const profileModel = require("../models/profileModel");

async function listMyLanguages(req, res, next) {
  try {
    const candidateId = await profileModel.getCandidateIdByUserId(req.user.id);
    const languages = await languageModel.listCandidateLanguages(candidateId);
    res.json(languages);
  } catch (err) {
    next(err);
  }
}

async function addLanguage(req, res, next) {
  try {
    const { name, proficiency } = req.body;
    if (!name || !name.trim()) {
      return res.status(400).json({ error: "Language name is required." });
    }
    const candidateId = await profileModel.getCandidateIdByUserId(req.user.id);
    const language = await languageModel.addLanguageToCandidate(candidateId, name, proficiency);
    res.status(201).json(language);
  } catch (err) {
    next(err);
  }
}

async function removeLanguage(req, res, next) {
  try {
    const candidateId = await profileModel.getCandidateIdByUserId(req.user.id);
    const removed = await languageModel.removeLanguageFromCandidate(candidateId, req.params.languageId);
    if (!removed) {
      return res.status(404).json({ error: "Language not found on this profile." });
    }
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}

module.exports = { listMyLanguages, addLanguage, removeLanguage };
