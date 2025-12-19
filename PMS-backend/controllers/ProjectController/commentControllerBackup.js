const db = require("../../config/db");
const User = db.User;
const { DataTypes, UUID, where, UUIDV4 } = require("sequelize");
const { v4: uuidv4 } = require("uuid");
const project = require("../../models/project");
const Sub_task = db.Sub_task;
const Project = db.Project;
const Activity = db.Activity;
const Project_member = db.Project_member;
const Notification = db.Notification;

const Comment = db.Comment;

const createComment = async (req, res, io) => {
  const uuid = uuidv4();
  const { sub_task_id, project_id, activity_id } = req.params;
  const { comment } = req.body;

  if ((!sub_task_id && !project_id && !activity_id) || !comment) {
    return res
      .status(400)
      .json({ message: "Please provide sub_task_id and comment" });
  }

  try {
    // Check if the provided IDs exist in the respective tables
    const existingSubtask = sub_task_id
      ? await Sub_task.findByPk(sub_task_id)
      : null;
    const existingProject = project_id
      ? await Project.findByPk(project_id)
      : null;
    const existingActivity = activity_id
      ? await Activity.findByPk(activity_id)
      : null;

    //one Id must be there to create
    if (!existingSubtask && !existingProject && !existingActivity) {
      return res.status(401).json({ message: "IDs not found" });
    }
    console.log(req.id);
    const newComment = await Comment.create({
      comment_id: uuid,
      sub_task_id: sub_task_id || null,
      project_id: project_id || null,
      activity_id: activity_id || null,
      comment,
      created_by: req.id,
      updated_by: req.id,
    });

    if (existingSubtask) {
      const subTask = await Sub_task.findByPk(sub_task_id, {
        include: [
          {
            model: Project_member,
            as: "members",
            attributes: ["user_id", "project_member_id"],
          },
        ],
      });
      await Notification.create({
        notification_id: uuidv4(),
        message: ` A new comment has been added to the sub-task "${subTask.name}".`,
        user_id: subTask.members[0].user_id,
        project_id: existingProject?.existingProject.project_id,
      });

      let notificationArray = [];
      const unreadNotifications = await Notification.findAll({
        where: { read: 0 },
      });

      let customId = 1;
      for (const notification of unreadNotifications) {
        notificationArray.push({
          id: customId,
          notification_id: notification.notification_id,
          message: notification.message,
          user_id: notification.user_id,
          date: new Date(notification.createdAt).toLocaleTimeString(),
        });
        customId++;
      }

      setTimeout(() => {
        io.emit("notification", notificationArray);
      }, 3000);
    }

    return res
      .status(201)
      .json({ message: "New comment created", comment: newComment });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error" });
  }
};

const getCommentById = async (req, res) => {
  var { comment_id } = req.params;
  console.log("comment_id=======", comment_id);

  try {
    const comments = await Comment.findByPk(comment_id);
    if (!comments) {
      return res.status(404).json({ message: "Comment not found" });
    }

    const user = await User.findByPk(comments.created_by); // to get the info of comment creator
    console.log(user);
    comments.dataValues.commentedby = user.full_name;

    console.log("comment=====", comments);

    return res.status(200).json(comments);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error" });
  }
};

const getAllComments = async (req, res) => {
  const { sub_task_id, project_id, activity_id } = req.params;

  try {
    const filter = {};
    if (sub_task_id) filter.sub_task_id = sub_task_id;
    if (project_id) filter.project_id = project_id;
    if (activity_id) filter.activity_id = activity_id;

    const comments = await Comment.findAll({ where: filter });

    const getCustomTimeAgo = (date) => {
      const now = new Date();
      const commentDate = new Date(date);
      const diffInSeconds = Math.floor((now - commentDate) / 1000);
      console.log(commentDate);

      if (diffInSeconds < 60) {
        return `${diffInSeconds} seconds ago`;
      } else if (diffInSeconds < 3600) {
        const diffInMinutes = Math.floor(diffInSeconds / 60);
        return `${diffInMinutes} minutes ago`;
      } else if (diffInSeconds < 86400) {
        const diffInHours = Math.floor(diffInSeconds / 3600);
        return `${diffInHours} hours ago`;
      } else if (diffInSeconds < 2592000) {
        const diffInDays = Math.floor(diffInSeconds / 86400);
        return `${diffInDays} days ago`;
      } else if (diffInSeconds < 31536000) {
        const diffInMonths = Math.floor(diffInSeconds / 2592000);
        return `${diffInMonths} months ago`;
      } else {
        const diffInYears = Math.floor(diffInSeconds / 31536000);
        return `${diffInYears} years ago`;
      }
    };

    const commentWithCustomTime = [];

    for (let i = 0; i < comments.length; i++) {
      const comment = comments[i];
      const user = await User.findByPk(comment.created_by);
      if (user) {
        comment.dataValues.commentedBy = user.full_name;
      }
      const result = getCustomTimeAgo(comment.createdAt);
      commentWithCustomTime.push({ comment, result });
    }

    return res.status(200).json(commentWithCustomTime);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error" });
  }
};

const updateComment = async (req, res) => {
  const { comment_id } = req.params;

  const { comment } = req.body;

  if (!comment) {
    return res.status(400).json({ message: "Please provide comment" });
  }

  try {
    const existingComment = await Comment.findByPk(comment_id);
    if (!existingComment) {
      return res.status(404).json({ message: "Comment not found" });
    }

    await existingComment.update({ comment });
    return res.status(200).json({ message: "Comment updated" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error" });
  }
};

const deleteComment = async (req, res) => {
  const { comment_id } = req.params;

  try {
    const existingComment = await Comment.findByPk(comment_id);
    if (!existingComment) {
      return res.status(404).json({ message: "Comment not found" });
    }

    await existingComment.destroy();
    return res.status(200).json({ message: "Comment deleted" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  createComment,
  getAllComments,
  getCommentById,
  updateComment,
  deleteComment,
};
