const { createCandidateSubResourceModel } = require("./candidateSubResourceFactory");

const educationModel = createCandidateSubResourceModel("Educations", [
  "Institution",
  "Degree",
  "FieldOfStudy",
  "StartDate",
  "EndDate",
  "ConfidenceScore",
  "VerificationStatus",
]);

const experienceModel = createCandidateSubResourceModel("Experiences", [
  "CompanyName",
  "JobTitle",
  "StartDate",
  "EndDate",
  "Description",
  "ConfidenceScore",
  "VerificationStatus",
]);

const projectModel = createCandidateSubResourceModel("Projects", ["Title", "Description", "Url"]);

module.exports = { educationModel, experienceModel, projectModel };
