const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");
const upload = require("../middleware/uploadMiddlware");
const {
  createTask,
  getAllTasks,
  getTaskById,
  updateTask,
  deleteTask,
  assignTask,
  updateTaskStatus,
  updateTaskPriority,
  updateTaskDueDate,
  uploadTaskAttachment,
  getTaskAttachments,
} = require("../controllers/taskController");

const router = express.Router();

router.post(
  "/",
  authMiddleware,
  roleMiddleware("admin", "project_manager"),
  createTask,
);

router.get(
  "/",
  authMiddleware,
  roleMiddleware("admin", "project_manager", "team_member"),
  getAllTasks,
);

router.get(
  "/:id",
  authMiddleware,
  roleMiddleware("admin", "project_manager", "team_member"),
  getTaskById,
);

router.put(
  "/:id",
  authMiddleware,
  roleMiddleware("admin", "project_manager"),
  updateTask,
);

router.delete(
  "/:id",
  authMiddleware,
  roleMiddleware("admin", "project_manager"),
  deleteTask,
);

router.put(
  "/:id/assign",
  authMiddleware,
  roleMiddleware("admin", "project_manager"),
  assignTask,
);

router.put(
  "/:id/status",
  authMiddleware,
  roleMiddleware("admin", "project_manager", "team_member"),
  updateTaskStatus,
);

router.put(
  "/:id/priority",
  authMiddleware,
  roleMiddleware("admin", "project_manager"),
  updateTaskPriority,
);

router.put(
  "/:id/due-date",
  authMiddleware,
  roleMiddleware("admin", "project_manager"),
  updateTaskDueDate,
);

router.post(
  "/:id/attachments",
  authMiddleware,
  roleMiddleware("admin", "project_manager", "team_member"),
  upload.single("file"),
  uploadTaskAttachment,
);

router.get(
  "/:id/attachments",
  authMiddleware,
  roleMiddleware("admin", "project_manager", "team_member"),
  getTaskAttachments,
);

module.exports = router;
