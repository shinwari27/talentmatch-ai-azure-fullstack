const profileModel = require("../models/profileModel");

/**
 * Pairs with candidateSubResourceFactory.js on the model side. Every one of
 * these routes needs the same first step — resolve the logged-in user's
 * CandidateId — before doing anything else, and every write needs to check
 * that the record actually belonged to that candidate (not just that an Id
 * was found), which is what stops one candidate from editing another's data
 * by guessing IDs.
 */
function createCandidateSubResourceController(model, resourceName) {
  async function list(req, res, next) {
    try {
      const candidateId = await profileModel.getCandidateIdByUserId(req.user.id);
      const items = await model.list(candidateId);
      res.json(items);
    } catch (err) {
      next(err);
    }
  }

  async function create(req, res, next) {
    try {
      const candidateId = await profileModel.getCandidateIdByUserId(req.user.id);
      const item = await model.create(candidateId, req.body);
      res.status(201).json(item);
    } catch (err) {
      next(err);
    }
  }

  async function update(req, res, next) {
    try {
      const candidateId = await profileModel.getCandidateIdByUserId(req.user.id);
      const item = await model.update(candidateId, req.params.id, req.body);
      if (!item) {
        return res.status(404).json({ error: `${resourceName} not found.` });
      }
      res.json(item);
    } catch (err) {
      next(err);
    }
  }

  async function remove(req, res, next) {
    try {
      const candidateId = await profileModel.getCandidateIdByUserId(req.user.id);
      const deleted = await model.remove(candidateId, req.params.id);
      if (!deleted) {
        return res.status(404).json({ error: `${resourceName} not found.` });
      }
      res.status(204).send();
    } catch (err) {
      next(err);
    }
  }

  async function verify(req, res, next) {
    try {
      const candidateId = await profileModel.getCandidateIdByUserId(req.user.id);
      const item = await model.verify(candidateId, req.params.id);
      if (!item) {
        return res.status(404).json({ error: `${resourceName} not found.` });
      }
      res.json(item);
    } catch (err) {
      next(err);
    }
  }

  return { list, create, update, remove, verify };
}

module.exports = { createCandidateSubResourceController };
