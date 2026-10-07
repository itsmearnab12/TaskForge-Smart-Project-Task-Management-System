const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");
const {
  getTaskStatistics,
  getUpcomingDeadlines,
  getProjectProgress,
  getCompletedVsPending,
} = require("../controllers/dashboardController");

const router = express.Router();

router.get(
  "/task-statistics",
  authMiddleware,
  roleMiddleware("admin", "project_manager", "team_member"),
  getTaskStatistics,
);

router.get(
  "/upcoming-deadlines",
  authMiddleware,
  roleMiddleware("admin", "project_manager", "team_member"),
  getUpcomingDeadlines,
);

router.get(
  "/project-progress",
  authMiddleware,
  roleMiddleware("admin", "project_manager", "team_member"),
  getProjectProgress,
);

router.get(
  "/completed-vs-pending",
  authMiddleware,
  roleMiddleware("admin", "project_manager", "team_member"),
  getCompletedVsPending,
);

module.exports = router;
