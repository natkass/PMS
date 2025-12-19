const { validationResult } = require("express-validator");
const { Op, Sequelize } = require("sequelize");
const { v4: uuidv4 } = require("uuid");

const fs = require("fs");
const path = require("path");

const { sequelize } = require("../../config/db");
const db = require("../../config/db");

const Comment = db.Comment;
const CommentLike = db.CommentLike;
const CommentAttachment = db.CommentAttachment;
const User = db.User;
const project = require("../../models/project");
const Sub_task = db.Sub_task;
const Project = db.Project;
const Activity = db.Activity;
const Project_member = db.Project_member;
const Notification = db.Notification;

/* ======================= HELPERS ======================= */

const getCommentWithDetails = async (comment_id) => {
  return await Comment.findOne({
    where: { comment_id, is_deleted: false },
  });
};

const getNestedReplies = async (parent_comment_id, filters) => {
  const { include_deleted, show_private, user_id, user_role } = filters;

  const where = { parent_comment_id };
  if (!include_deleted) where.is_deleted = false;

  if (!show_private && !["admin", "manager"].includes(user_role)) {
    where[Op.or] = [{ is_private: false }, { created_by: user_id }];
  }

  const replies = await Comment.findAll({
    where,
    include: [{ model: User, as: "author" }],
    order: [["createdAt", "ASC"]],
  });

  for (const r of replies) {
    if (r.replies_count > 0) {
      r.dataValues.replies = await getNestedReplies(r.comment_id, filters);
    }
  }
  return replies;
};

/* ======================= CREATE ======================= */

const createComment = async (req, res) => {
  const transaction = await sequelize.transaction();

  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        errors: errors.array(),
      });
    }

    const {
      comment,
      is_private = false,
      project_id,
      sub_task_id,
      activity_id,
      parentId,
    } = req.body;

    const user_id = req.id;
    const parent_comment_id = parentId || null;

    const commentData = {
      comment,
      is_private,
      project_id,
      sub_task_id,
      activity_id,
      parent_comment_id,
      created_by: user_id,
    };

    const newComment = await Comment.create(commentData, { transaction });

    if (parent_comment_id) {
      await Comment.increment("replies_count", {
        by: 1,
        where: { comment_id: parent_comment_id },
        transaction,
      });
    }

    await transaction.commit();

    // Get the complete comment with details
    const completeComment = await getCommentWithDetails(newComment.comment_id);

    res.status(201).json({
      success: true,
      message: parent_comment_id
        ? "Reply added successfully"
        : "Comment created successfully",
      data: completeComment,
    });
  } catch (error) {
    if (!transaction.finished) {
      await transaction.rollback();
    }
    console.error("Error creating comment:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to create comment",
    });
  }
};

/* ======================= READ ======================= */

const getComments = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const {
      project_id,
      activity_id,
      sub_task_id,
      parent_comment_id = null,
      include_deleted = false,
      show_private = false,
      sort_by = "newest",
    } = req.query;

    const user_id = req.id;

    const where = { parent_comment_id };

    if (!include_deleted) where.is_deleted = false;
    if (project_id) where.project_id = project_id;
    if (activity_id) where.activity_id = activity_id;
    if (sub_task_id) where.sub_task_id = sub_task_id;

    if (!show_private) {
      where[Op.or] = [{ is_private: false }, { created_by: user_id }];
    }

    const order =
      sort_by === "oldest"
        ? [["createdAt", "ASC"]]
        : sort_by === "most_liked"
          ? [
            ["likes_count", "DESC"],
            ["createdAt", "DESC"],
          ]
          : sort_by === "most_replied"
            ? [
              ["replies_count", "DESC"],
              ["createdAt", "DESC"],
            ]
            : sort_by === "pinned"
              ? [
                ["is_pinned", "DESC"],
                ["createdAt", "DESC"],
              ]
              : [["createdAt", "DESC"]];

    const comments = await Comment.findAll({ where, order, raw: true });

    const commentIds = comments.map((c) => c.comment_id);

    const replies = commentIds.length
      ? await Comment.findAll({
        where: {
          parent_comment_id: { [Op.in]: commentIds },
          ...(include_deleted ? {} : { is_deleted: false }),
          ...(show_private
            ? {}
            : { [Op.or]: [{ is_private: false }, { created_by: user_id }] }),
        },
        order: [["createdAt", "ASC"]],
        raw: true,
      })
      : [];

    const allItems = [...comments, ...replies];

    const userIds = [...new Set(allItems.map((i) => i.created_by))];

    const users = await User.findAll({
      where: { user_id: userIds },
      attributes: ["user_id", "full_name", "email"],
      raw: true,
    });

    const userMap = {};
    users.forEach((u) => (userMap[u.user_id] = u));

    const repliesByParent = {};
    replies.forEach((r) => {
      if (!repliesByParent[r.parent_comment_id]) {
        repliesByParent[r.parent_comment_id] = [];
      }
      repliesByParent[r.parent_comment_id].push({
        ...r,
        user: userMap[r.created_by] || null,
      });
    });

    const likes = await CommentLike.findAll({
      where: { comment_id: commentIds },
      attributes: ["comment_id", "user_id"],
      raw: true,
    });

    const likesByComment = {};
    likes.forEach((l) => {
      if (!likesByComment[l.comment_id]) likesByComment[l.comment_id] = [];
      likesByComment[l.comment_id].push(l.user_id);
    });

    const userLikedMap = {};
    commentIds.forEach((id) => {
      const arr = likesByComment[id] || [];
      userLikedMap[id] = arr.includes(user_id);
    });

    const result = comments.map((c) => {
      const commentLikes = likesByComment[c.comment_id] || [];

      return {
        ...c,
        user: userMap[c.created_by] || null,
        likes_count: commentLikes.length,
        liked_by_user: userLikedMap[c.comment_id] || false,
        likes: commentLikes.map((uid) => userMap[uid] || { user_id: uid }),
        replies: repliesByParent[c.comment_id] || [],
      };
    });

    res.json({ success: true, data: result });
  } catch (e) {
    console.error(e);
    res.status(500).json({ success: false, message: e.message });
  }
};

const getCommentById = async (req, res) => {
  const comment = await getCommentWithDetails(req.params.comment_id);
  if (!comment) return res.status(404).json({ message: "Not found" });
  res.json(comment);
};

/* ======================= UPDATE ======================= */

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

/* ======================= DELETE ======================= */

const deleteComment = async (req, res) => {
  await Comment.update(
    { is_deleted: true },
    { where: { comment_id: req.params.comment_id } }
  );
  res.json({ success: true });
};

/* ======================= LIKE ======================= */

const toggleLike = async (req, res) => {
  const t = await db.sequelize.transaction();
  try {
    const like = await CommentLike.findOne({
      where: { comment_id: req.params.comment_id, user_id: req.id },
    });

    if (like) {
      await like.destroy({ transaction: t });
      await Comment.decrement("likes_count", {
        by: 1,
        where: { comment_id: req.params.comment_id },
        transaction: t,
      });
    } else {
      await CommentLike.create(
        { comment_id: req.params.comment_id, user_id: req.id },
        { transaction: t }
      );
      await Comment.increment("likes_count", {
        by: 1,
        where: { comment_id: req.params.comment_id },
        transaction: t,
      });
    }

    await t.commit();
    return res.status(200).json({
      success: true,
    });
  } catch (e) {
    await t.rollback();
    res.status(500).json({ message: e.message });
  }
};

/* ======================= PIN ======================= */

const togglePin = async (req, res) => {
  const c = await Comment.findByPk(req.params.comment_id);
  await c.update({ is_pinned: !c.is_pinned });
  res.json({ success: true });
};

/* ======================= ATTACHMENTS ======================= */

const uploadAttachment = async (req, res) => {
  const attachment = await CommentAttachment.create({
    comment_id: req.params.comment_id,
    file_name: req.file.originalname,
    file_path: req.file.path,
    uploaded_by: req.user.user_id,
  });
  res.status(201).json(attachment);
};

const removeAttachment = async (req, res) => {
  await CommentAttachment.update(
    { is_deleted: true },
    { where: { attachment_id: req.params.attachment_id } }
  );
  res.json({ success: true });
};

/* ======================= STATS ======================= */

const getCommentStats = async (req, res) => {
  const stats = await Comment.findAll({
    attributes: [
      [Sequelize.fn("COUNT", Sequelize.col("comment_id")), "total_comments"],
    ],
    raw: true,
  });
  res.json(stats[0]);
};

const getUserComments = async (req, res) => {
  const comments = await Comment.findAll({
    where: { created_by: req.params.user_id },
    include: [{ model: User, as: "author" }],
  });
  res.json(comments);
};

/* ======================= EXPORTS ======================= */

module.exports = {
  createComment,
  getComments,
  getCommentById,
  updateComment,
  deleteComment,
  toggleLike,
  togglePin,
  uploadAttachment,
  removeAttachment,
  getCommentStats,
  getUserComments,
};
