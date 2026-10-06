const Project = require("../models/Project");
const User = require("../models/User");

const createProject = async (req, res) => {
  try {
    const { name, description, projectManager, teamMembers, deadline } =
      req.body;

    if (!name || !projectManager || !deadline) {
      return res.status(400).json({
        message: "Name, project manager and deadline are required",
      });
    }

    const manager = await User.findById(projectManager);

    if (!manager) {
      return res.status(404).json({
        message: "Project manager not found",
      });
    }

    if (manager.role !== "project_manager" && manager.role !== "admin") {
      return res.status(400).json({
        message: "Selected user is not a project manager",
      });
    }

    if (teamMembers && teamMembers.length > 0) {
      const users = await User.find({
        _id: { $in: teamMembers },
      });

      if (users.length !== teamMembers.length) {
        return res.status(400).json({
          message: "One or more team members are invalid",
        });
      }
    }

    const project = await Project.create({
      name,
      description,
      projectManager,
      teamMembers,
      deadline,
      createdBy: req.usersId,
    });

    res.status(201).json({
      message: "Project created successfully",
      project,
    });
  } catch (error) {
    res.status(500).json({
      message: "Server error",
    });
  }
};

const getAllProjects = async (req, res) => {
  try {
    const projects = await Project.find()
      .populate("projectManager", "name email role")
      .populate("teamMembers", "name email role")
      .populate("createdBy", "name email role")
      .sort({ createdAt: -1 });

    res.status(200).json({
      message: "Projects fetched successfully",
      projects,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Server error",
    });
  }
};

const getProjectById = async (req, res) => {
  try {
    const { id } = req.params;

    const project = await Project.findById(id)
      .populate("projectManager", "name email role")
      .populate("teamMembers", "name email role")
      .populate("createdBy", "name email role");

    if (!project) {
      return res.status(404).json({
        message: "Project not found",
      });
    }

    res.status(200).json({
      message: "Project fetched successfully",
      project,
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      message: "Server error",
    });
  }
};

const updateProject = async (req, res) => {
  try {
    const { id } = req.params;

    const { name, description, projectManager, teamMembers, deadline } =
      req.body;

    const project = await Project.findById(id);

    if (!project) {
      return res.status(404).json({
        message: "Project not found",
      });
    }

    if (name !== undefined) {
      project.name = name;
    }

    if (description !== undefined) {
      project.description = description;
    }

    if (projectManager !== undefined) {
      project.projectManager = projectManager;
    }

    if (teamMembers !== undefined) {
      project.teamMembers = teamMembers;
    }

    if (deadline !== undefined) {
      project.deadline = deadline;
    }

    await project.save();

    res.status(200).json({
      message: "Project updated successfully",
      project,
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      message: "Server error",
    });
  }
};

const deleteProject = async (req, res) => {
  try {
    const { id } = req.params;

    const project = await Project.findById(id);

    if (!project) {
      return res.status(404).json({
        message: "Project not found",
      });
    }

    await Project.findByIdAndDelete(id);

    res.status(200).json({
      message: "Project deleted successfully",
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      message: "Server error",
    });
  }
};

module.exports = {
  createProject,
  getAllProjects,
  getProjectById,
  updateProject,
};
