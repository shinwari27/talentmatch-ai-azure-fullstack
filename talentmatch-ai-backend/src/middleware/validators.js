const { body, validationResult } = require("express-validator");

function handleValidationErrors(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ error: errors.array()[0].msg, details: errors.array() });
  }
  next();
}

const registerValidation = [
  body("fullName").trim().notEmpty().withMessage("Full name is required."),
  body("email").isEmail().withMessage("A valid email is required.").normalizeEmail(),
  body("password")
    .isLength({ min: 8 })
    .withMessage("Password must be at least 8 characters.")
    .matches(/\d/)
    .withMessage("Password must contain at least one number."),
  body("role").isIn(["Candidate", "Recruiter"]).withMessage("Role must be 'Candidate' or 'Recruiter'."),
  handleValidationErrors,
];

const loginValidation = [
  body("email").isEmail().withMessage("A valid email is required.").normalizeEmail(),
  body("password").notEmpty().withMessage("Password is required."),
  handleValidationErrors,
];

const forgotPasswordValidation = [
  body("email").isEmail().withMessage("A valid email is required.").normalizeEmail(),
  handleValidationErrors,
];

const jobValidation = [
  body("title").trim().notEmpty().withMessage("Job title is required."),
  body("companyName").trim().notEmpty().withMessage("Company name is required."),
  body("location").trim().notEmpty().withMessage("Location is required."),
  body("description").trim().notEmpty().withMessage("Job description is required."),
  body("salaryMin")
    .optional({ nullable: true })
    .isFloat({ min: 0 })
    .withMessage("Minimum salary must be a positive number."),
  body("salaryMax")
    .optional({ nullable: true })
    .isFloat({ min: 0 })
    .withMessage("Maximum salary must be a positive number.")
    .custom((value, { req }) => {
      if (req.body.salaryMin != null && value != null && Number(value) < Number(req.body.salaryMin)) {
        throw new Error("Maximum salary cannot be less than minimum salary.");
      }
      return true;
    }),
  handleValidationErrors,
];

module.exports = {
  registerValidation,
  loginValidation,
  forgotPasswordValidation,
  jobValidation,
};
