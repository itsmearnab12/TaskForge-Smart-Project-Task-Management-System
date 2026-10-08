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
    const { search, projectManager, page = 1, limit = 10 } = req.query;

    let filter = {};

    if (search) {
      filter.$or = [
        {
          name: {
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

    if (projectManager) {
      filter.projectManager = projectManager;
    }

    const pageNumber = Number(page);
    const limitNumber = Number(limit);

    const skip = (pageNumber - 1) * limitNumber;

    const totalProjects = await Project.countDocuments(filter);

    const projects = await Project.find(filter)
      .populate("projectManager", "name email")
      .populate("teamMembers", "name email")
      .populate("createdBy", "name email")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNumber);

    const totalPages = Math.ceil(totalProjects / limitNumber);

    res.status(200).json({
      message: "Projects fetched successfully",
      pagination: {
        currentPage: pageNumber,
        limit: limitNumber,
        totalProjects,
        totalPages,
      },
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

const assignedProjectManager = async (req, res) => {
  try {
    const { id } = req.params;
    const { projectManager } = req.body;

    if (!projectManager) {
      return res.status(400).json({
        message: "Project manager ID is required",
      });
    }

    const manager = await User.findById(projectManager);

    if (!manager) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    if (manager.role !== "project_manager" && manager.role !== "admin") {
      return res.status(400).json({
        message: "Selected user cannot be assigned as project manager",
      });
    }

    const project = await Project.findById(id);

    if (!project) {
      return res.status(404).json({
        message: "Project not found",
      });
    }

    project.projectManager = projectManager;

    await project.save();

    res.status(200).json({
      message: "Project manager assigned successfully",
      project,
    });
  } catch (error) {
    res.status(500).json({
      message: "Server error",
    });
  }
};

const addTeamMember = async (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({
        message: "User ID is required",
      });
    }

    const project = await Project.findById(id);

    if (!project) {
      return res.status(404).json({
        message: "Project not found",
      });
    }

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    if (user.role !== "team_member") {
      return res.status(400).json({
        message: "Onlly team member can be added to the project",
      });
    }

    if (project.teamMembers.includes(userId)) {
      return res.status(400).json({
        message: "User is already a team member of this project",
      });
    }

    project.teamMembers.push(userID);

    await project.save();

    res.status(200).json({
      messsage: "Team member added successfully",
      project,
    });
  } catch (error) {
    res.status(500).json({
      message: "Server error",
    });
  }
};

const removeTeamMember = async (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({
        message: "User ID is required",
      });
    }

    const project = await Project.findById(id);

    if (!project) {
      return res.status(404).json({
        message: "Project not found",
      });
    }

    const isMember = project.teamMembers.some(
      (memberId) => memberId.toString() === userId,
    );

    if (!isMember) {
      return res.status(400).json({
        messsage: "User is not a member of this project",
      });
    }

    project.teamMembers = project.teamMembers.filter(
      (memberId) => memberId.toString() !== userId,
    );

    await project.save();

    res.status(200).json({
      message: "Team member removed successfully",
      project,
    });
  } catch (error) {
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
  deleteProject,
  assignedProjectManager,
  addTeamMember,
  removeTeamMember,
};
