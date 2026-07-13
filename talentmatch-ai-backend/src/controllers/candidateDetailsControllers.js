const { createCandidateSubResourceController } = require("./candidateSubResourceControllerFactory");
const {
  educationModel,
  experienceModel,
  projectModel,
} = require("../models/candidateDetailsModels");

const educationController = createCandidateSubResourceController(educationModel, "Education entry");
const experienceController = createCandidateSubResourceController(experienceModel, "Experience entry");
const projectController = createCandidateSubResourceController(projectModel, "Project");

module.exports = {
  educationController,
  experienceController,
  projectController,
};
