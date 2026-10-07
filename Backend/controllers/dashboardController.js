const Task = require("../models/Task");
const Project = require("../models/Project");
const User = require("../models/User");

const getTaskStatistics = async (req, res) => {
  try {
    const totalTasks = await Task.countDocuments();

    const todoTasks = await Task.countDocuments({
      status: "todo",
    });

    const inProgressTasks = await Task.countDocuments({
      status: "in_progress",
    });

    const completedTasks = await Task.countDocuments({
      status: "completed",
    });

    res.status(200).json({
      message: "Task statistics fetched successfully",
      statistics: {
        totalTasks,
        todoTasks,
        inProgressTasks,
        completedTasks,
      },
    });
  } catch (error) {
    res.status(500).json({
      message: "Server error",
    });
  }
};

const getUpcomingDeadlines = async (req, res) => {
  try {
    const today = new Date();

    const nextSevenDays = new Date();
    nextSevenDays.setDate(today.getDate() + 7);

    const tasks = await Task.find({
      dueDate: {
        $gte: today,
        $lte: nextSevenDays,
      },
      status: {
        $ne: "completed",
      },
    })
      .populate("project", "name")
      .populate("assignedTo", "name email")
      .sort({ dueDate: 1 });

    res.status(200).json({
      message: "Upcoming deadlines fetched successfully",
      tasks,
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      message: "Server error",
    });
  }
};

const getProjectProgress = async (req, res) => {
  try {
    const projects = await Project.find()
      .select("name description deadline")
      .sort({ created: -1 });

    const projectProgress = await Promise.all(
      projects.map(async (project) => {
        const totalTasks = await Task.countDocuments({
          project: project._id,
        });

        const completedTasks = await Task.countDocuments({
          project: project._id,
          status: "completed",
        });

        let progress = 0;

        if (totalTasks > 0) {
          progress = Math.round((completedTasks / totalTasks) * 100);
        }

        return {
          projectId: project._id,
          projectName: project.name,
          deadline: project.deadline,
          totalTasks,
          completedTasks,
          progress,
        };
      }),
    );

    res.status(200).json({
      message: "Project progress fetched successfully",
      projects: projectProgress,
    });
  } catch (error) {
    res.status(500).json({
      message: "Server error",
    });
  }
};

const getCompletedVsPending = async (req, res) => {
  try {
    const completedTasks = await Task.countDocuments({
      status: "completed",
    });

    const pendingTasks = await Task.countDocuments({
      status: {
        $in: ["todo", "in_progress"],
      },
    });

    const totalTasks = completedTasks + pendingTasks;

    res.status(200).json({
      message: "Completed vs pending tasks fetched successfully",
      statistics: {
        totalTasks,
        completedTasks,
        pendingTasks,
      },
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server error" });
  }
};

const getTeamPerformance = async (req, res) => {
  try {
    const teamMembers = await User.find({
      role: "team_member",
    }).select("name email");

    const teamPerformance = await Promise.all(
      teamMembers.map(async (member) => {
        const totalTasks = await Task.countDocuments({
          assignedTo: member._id,
        });

        const completedTasks = await Task.countDocuments({
          assignedTo: member._id,
          status: "completed",
        });

        const pendingTasks = await Task.countDocuments({
          assignedTo: member._id,
          status: {
            $in: ["todo", "in_progress"],
          },
        });

        let completionRate = 0;

        if (totalTasks > 0) {
          completionRate = Math.round((completedTasks / totalTasks) * 100);
        }

        return {
          userId: member._id,
          name: member.name,
          email: member.email,
          totalTasks,
          completedTasks,
          pendingTasks,
          completionRate,
        };
      }),
    );

    res.status(200).json({
      message: "Team performance fetched successfully",
      teamPerformance,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  getTaskStatistics,
  getUpcomingDeadlines,
  getProjectProgress,
  getCompletedVsPending,
  getTeamPerformance,
};
