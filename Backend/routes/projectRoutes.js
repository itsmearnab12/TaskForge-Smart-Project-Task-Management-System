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
const validate = require("../middleware/validationMiddleware");
const {
  createProjectValidation,
  projectQueryValidation,
  projectIdValidation,
} = require("../middleware/projectValidation");

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

router.post(
  "/",
  authMiddleware,
  roleMiddleware("admin", "project_manger"),
  createProjectValidation,
  validate,
  createProject,
);

router.get(
  "/",
  authMiddleware,
  roleMiddleware("admin", "project", "team_memeber"),
  projectQueryValidation,
  validate,
  getAllProjects,
);

router.get(
  ":/id",
  authMiddleware,
  roleMiddleware("admin", "project_manager", "team_member"),
  projectIdValidation,
  validate,
  getProjectById,
);
module.exports = router;
