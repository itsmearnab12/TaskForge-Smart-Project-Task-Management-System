const Project = require("../models/Project");
const Task = require("../models/Task");
const User = require("../models/User");

const createTask = async (req, res) => {
  try {
    const {
      title,
      description,
      project,
      assignedTo,
      priority,
      status,
      dueDate,
    } = req.body;

    if (!title || !project || !assignedTo || !dueDate) {
      return res.status(400).json({
        message: "Title, project, assigned user and due date are required",
      });
    }

    const exisitingProject = await Project.findById(project);

    if (!exisitingProject) {
      return res.status(404).json({
        message: "Project not found",
      });
    }

    const user = await User.findById(assignedTo);

    if (!user) {
      return res.status(404).json({
        message: "Assigned user not found",
      });
    }

    const isTeamMember = exisitingProject.teamMembers.some(
      (memberId = memberId.toString() === assignedTo),
    );

    if (!isTeamMember) {
      return res.status(400).json({
        message: "User is not member of this project",
      });
    }

    const task = await Task.create({
      title,
      description,
      project,
      assignedTo,
      priority,
      status,
      dueDate,
      createdBy: req.userId,
    });

    res.status(201).json({
      message: "Task created successfully",
      task,
    });
  } catch (error) {
    res.status(500).json({
      message: "Server error",
    });
  }
};

const getAllTasks = async (req, res) => {
  try {
    const {
      search,
      status,
      priority,
      project,
      assignedTo,
      page = 1,
      limit = 10,
    } = req.query;

    let filter = {};

    if (search) {
      filter.$or = [
        {
          title: {
            $regex: search,
            $options: "i",
          },
        },
        {
          description: {
            $regex: search,
            $options: "i",
          },
        },
      ];
    }

    if (status) {
      filter.status = status;
    }

    if (priority) {
      filter.priority = priority;
    }

    if (project) {
      filter.project = project;
    }

    if (assignedTo) {
      filter.assignedTo = assignedTo;
    }

    const pageNumber = Number(page);
    const limitNumber = Number(limit);

    const skip = (pageNumber - 1) * limitNumber;

    const totalTasks = await Task.countDocuments(filter);

    const tasks = await Task.find(filter)
      .populate("project", "name")
      .populate("assignedTo", "name email")
      .populate("createdBy", "name email")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNumber);

    const totalPages = Math.ceil(totalTasks / limitNumber);

    res.status(200).json({
      message: "Tasks fetched successfully",
      pagination: {
        currentPage: pageNumber,
        limit: limitNumber,
        totalTasks,
        totalPages,
      },
      tasks,
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      message: "Server error",
    });
  }
};

const getTaskById = async (req, res) => {
  try {
    const { id } = req.params;

    const task = await Task.findById(id)
      .populate("project", "name description deadline")
      .populate("assignedTo", "name email role")
      .populate("createdBy", "name email role");

    if (!task) {
      return res.status(404).json({
        message: "Task not found",
      });
    }

    res.status(200).json({
      message: "Tasks fetched successfully",
      task,
    });
  } catch (error) {
    res.status(500).json({
      message: "Server error",
    });
  }
};

const updateTask = async (req, res) => {
  try {
    const { id } = req.params;

    const { title, description, assignedTo, priority, status, dueDate } =
      req.body;

    const task = await Task.findById(id);

    if (!task) {
      return res.status(404).json({
        message: "Task not found",
      });
    }

    if (assignedTo !== undefined) {
      const user = await User.findById(assignedTo);

      if (!user) {
        return res.status(404).json({
          message: "Assigned user not found",
        });
      }

      const project = await Project.findById(task.project);

      const isTeamMember = project.teamMembers.some(
        (memberId) => memberId.toString() === assignedTo,
      );

      if (!isTeamMember) {
        return res.status(400).json({
          message: "User is not a member of this project",
        });
      }

      task.assignedTo = assignedTo;
    }

    if (title !== undefined) {
      task.title = title;
    }

    if (description !== undefined) {
      task.description = description;
    }

    if (priority !== undefined) {
      task.priority = priority;
    }

    if (status !== undefined) {
      task.status = status;
    }

    if (dueDate !== undefined) {
      task.dueDate = dueDate;
    }

    await task.save();

    res.status(200).json({
      message: "Task updated successfully",
      task,
    });
  } catch (error) {
    res.status(500).json({
      message: "Server error",
    });
  }
};

const deleteTask = async (req, res) => {
  try {
    const { id } = req.params;

    const task = await Task.findById(id);

    if (!task) {
      return res.status(404).json({
        message: "Task not found",
      });
    }

    await Task.findByIdAndDelete(id);

    res.status(200).json({
      message: "Task deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      message: "Server error",
    });
  }
};

const assignTask = async (req, res) => {
  try {
    const { id } = req.params;
    const { assignedTo } = req.body;

    if (!assignedTo) {
      return res.status(400).json({
        message: "Assigned user ID is required",
      });
    }

    const task = await Task.findById(id);

    if (!task) {
      return res.status(404).json({
        message: "Task not found",
      });
    }

    const user = await User.findById(assignedTo);

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    if (user.role !== "team_member") {
      return res.status(400).json({
        message: "task can only be assigned to a team member",
      });
    }

    const project = await Project.findById(task.project);

    if (!project) {
      return res.status(404).json({
        message: "Project not found",
      });
    }

    const isTeamMember = project.teamMembers.some(
      (memberId) => memberId.toString() === assignedTo,
    );

    if (!isTeamMember) {
      return res.status(400).json({
        message: "User is not a member of this project",
      });
    }

    task.assignedTo = assignedTo;

    await task.save();

    res.status(200).json({
      message: "Task assigned successfully",
      task,
    });
  } catch (error) {
    res.status(500).json({
      message: "Server error",
    });
  }
};

const updateTaskStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({
        message: "Status is required",
      });
    }

    const allowedStatuses = ["todo", "in_progress", "complete"];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        message: "Invalid status",
      });
    }

    const task = await Task.findById(id);

    if (!task) {
      return res.status(404).json({
        message: "Task not found",
      });
    }

    task.status = status;

    await task.save();

    res.status(200).json({
      message: "Task status update successfully",
      task,
    });
  } catch (error) {
    res.status(500).json({
      message: "Server error",
    });
  }
};

const updateTaskPriority = async (req, res) => {
  try {
    const { id } = req.params;
    const { priority } = req.body;

    if (!priority) {
      return res.status(400).json({
        message: "Priority is required",
      });
    }

    const allowedPriorities = ["low", "medium", "high"];

    if (!allowedPriorities.includes(priority)) {
      return res.status(400).json({
        message: "Invalid priority",
      });
    }

    const task = await Task.findById(id);

    if (!task) {
      return res.status(404).json({
        message: "Task not found",
      });
    }

    task.priority = priority;

    await task.save();

    res.status(200).json({
      message: "Task priority updated successfully",
      task,
    });
  } catch (error) {
    res.status(500).json({
      message: "Server error",
    });
  }
};

const updateTaskDueDate = async (req, res) => {
  try {
    const { id } = req.params;
    const { dueDate } = req.body;

    if (!dueDate) {
      return res.status(400).json({
        message: "Due date is required",
      });
    }

    const task = await Task.findById(id);

    if (!task) {
      return res.json(404).json({
        message: "Task not found",
      });
    }

    const newDueDate = new Date(dueDate);

    if (isNaN(newDueDate.getTime())) {
      return res.status(400).json({
        message: "Invalid due date",
      });
    }

    task.dueDate = newDueDate;

    await task.save();

    res.status(200).json({
      message: "Task due date updated successfully",
      task,
    });
  } catch (error) {
    res.status(500).json({
      message: "Server error",
    });
  }
};

const uploadTaskAttachment = async (req, res) => {
  try {
    const { id } = req.params;

    const task = await Task.findById(id);

    if (!task) {
      return res.status(404).json({
        message: "Task not found",
      });
    }

    if (!req.file) {
      return res.status(400).json({
        message: "Please upload a file",
      });
    }

    task.attachments.push({
      fileName: req.file.originalname,
      filePath: req.file.path,
      uploadedBy: req.userId,
    });

    await task.save();

    res.status(200).json({
      message: "File uploaded successfully",
      attachment: task.attachments[task.attachments.length - 1],
    });
  } catch (error) {
    res.status(500).json({
      message: "Server error",
    });
  }
};

const getTaskAttachments = async (req, res) => {
  try {
    const { id } = req.params;

    const task = await Task.findById(id)
      .select("title attachments")
      .populate("attachments.uploadedBy", "name email role");

    if (!task) {
      return res.status(404).json({
        message: "Task not found",
      });
    }

    res.status(200).json({
      message: "Task attachments fetched successfully",
      attachments: task.attachments,
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      message: "Server error",
    });
  }
};

module.exports = {
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
};
