const certificationModel = require("../models/certificationModel");
const profileModel = require("../models/profileModel");

async function listMyCertifications(req, res, next) {
  try {
    const candidateId = await profileModel.getCandidateIdByUserId(req.user.id);
    const certifications = await certificationModel.listCandidateCertifications(candidateId);
    res.json(certifications);
  } catch (err) {
    next(err);
  }
}

async function addCertification(req, res, next) {
  try {
    const { name, issuedBy, issueDate, expiryDate } = req.body;
    if (!name || !name.trim()) {
      return res.status(400).json({ error: "Certification name is required." });
    }
    const candidateId = await profileModel.getCandidateIdByUserId(req.user.id);
    const cert = await certificationModel.addCertificationToCandidate(candidateId, name, {
      issuedBy, issueDate, expiryDate,
    });
    res.status(201).json(cert);
  } catch (err) {
    next(err);
  }
}

async function removeCertification(req, res, next) {
  try {
    const candidateId = await profileModel.getCandidateIdByUserId(req.user.id);
    const removed = await certificationModel.removeCertificationFromCandidate(candidateId, req.params.certificationId);
    if (!removed) {
      return res.status(404).json({ error: "Certification not found on this profile." });
    }
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}

module.exports = { listMyCertifications, addCertification, removeCertification };
