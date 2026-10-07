const express = require("express");

const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

const {
  createComment,
  getTaskComments,
} = require("../controllers/commentController");

const router = express.Router();

router.post(
  "/:taskId",
  authMiddleware,
  roleMiddleware("admin", "project_manager", "team_member"),
  createComment,
);

router.get(
  "/:taskId",
  authMiddleware,
  roleMiddleware("admin", "project_manager", "team_member"),
  getTaskComments,
);

module.exports = router;
