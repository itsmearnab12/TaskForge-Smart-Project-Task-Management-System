const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");
const {
  createProject,
  getAllProjects,
  getProjectById,
  updateProject,
} = require("../controllers/projectController");

const router = express.Router();

router.post(
  "/",
  authMiddleware,
  roleMiddleware("admin", "project_manager"),
  createProject,
);

router.get(
  "/",
  authMiddleware,
  roleMiddleware("admin", "project_manager", "team_member"),
  getAllProjects,
);

router.get(
  "/:id",
  authMiddleware,
  roleMiddleware("admin", "project_manager", "team_member"),
  getProjectById,
);

router.put(
  "/:id",
  authMiddleware,
  roleMiddleware("admin", "project_manager"),
  updateProject,
);

module.exports = router;
