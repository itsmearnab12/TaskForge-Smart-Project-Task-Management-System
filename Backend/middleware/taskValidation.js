const { body, query, param } = require("express-validator");

const createTaskValidation = [
  body("title").trim().notEmpty().withMessage("Task title is required"),

  body("project")
    .notEmpty()
    .withMessage("Project ID is required")
    .isMongoId()
    .withMessage("Invalid project ID"),

  body("assignedTo")
    .notEmpty()
    .withMessage("Assigned user ID is required")
    .isMongoId()
    .withMessage("Invalid assigned user ID"),

  body("priority")
    .optional()
    .isIn(["low", "medium", "high"])
    .withMessage("Invalid priority"),

  body("status")
    .optional()
    .isIn(["todo", "in_progress", "completed"])
    .withMessage("Invalid status"),

  body("dueDate")
    .notEmpty()
    .withMessage("Due date is required")
    .isISO8601()
    .withMessage("Invalid due date"),
];

const taskIdValidation = [
  param("id").isMongoId().withMessage("Invalid task ID"),
];

const taskQueryValidation = [
  query("page")
    .optional()
    .isInt({ min: 1 })
    .withMessage("Page must be a positive number"),

  query("limit")
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage("Limit must be between 1 and 100"),

  query("status")
    .optional()
    .isIn(["todo", "in_progress", "completed"])
    .withMessage("Invalid status"),

  query("priority")
    .optional()
    .isIn(["low", "medium", "high"])
    .withMessage("Invalid priority"),

  query("project").optional().isMongoId().withMessage("Invalid project ID"),

  query("assignedTo").optional().isMongoId().withMessage("Invalid user ID"),
];

module.exports = {
  createTaskValidation,
  taskIdValidation,
  taskQueryValidation,
};
