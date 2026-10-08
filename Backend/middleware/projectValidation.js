const { body, query, param } = require("express-validator");

const createProjectValidation = [
  body("name").trim().notEmpty().withMessage("Project name is required"),

  body("projectManager")
    .notEmpty()
    .withMessage("Project manager ID is required")
    .isMongoId()
    .withMessage("Invalid project manager ID"),

  body("deadline")
    .notEmpty()
    .withMessage("Deadline is required")
    .isISO8601()
    .withMessage("Invalid deadline"),
];

const projectIdValidation = [
  param("id").isMongoId().withMessage("Invalid project ID"),
];

const projectQueryValidation = [
  query("page")
    .optional()
    .isInt({ min: 1 })
    .withMessage("Page must be a positive number"),

  query("limit")
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage("Limit must be between 1 and 100"),

  query("projectManager")
    .optional()
    .isMongoId()
    .withMessage("Invalid project manager ID"),
];

module.exports = {
  createProjectValidation,
  projectIdValidation,
  projectQueryValidation,
};
