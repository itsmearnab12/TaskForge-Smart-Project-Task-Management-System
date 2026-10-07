const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");
const {
  createProject,
  getAllProjects,
  getProjectById,
  updateProject,
  deleteProject,
  assignedProjectManager,
  addTeamMember,
  removeTeamMember,
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

router.delete(
  "/:id",
  authMiddleware,
  roleMiddleware("admin", "project_manager"),
  deleteProject,
);

router.put(
  "/:id/manager",
  authMiddleware,
  roleMiddleware("admin", "project_manager"),
  assignedProjectManager,
);

router.put(
  "/:id/manager/add",
  authMiddleware,
  roleMiddleware("admin", "project_manager"),
  addTeamMember,
);

router.put(
  "/:id/manager/remove",
  authMiddleware,
  roleMiddleware("admin", "project_manager"),
  removeTeamMember,
);

module.exports = router;
