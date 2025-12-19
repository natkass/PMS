const express = require("express");
const { body, param, query } = require("express-validator");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const verifyJWT = require("../../middlewares/verifyJWT.js");

function Router(io) {
  const router = express.Router();
  const CommentController = require("../../controllers/ProjectController/commentController");

  /* -------------------- Multer Config -------------------- */
  const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      const uploadDir = "uploads/comments";
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }
      cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
      const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
      cb(
        null,
        file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname)
      );
    },
  });

  const fileFilter = (req, file, cb) => {
    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "application/vnd.ms-excel",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "application/vnd.ms-powerpoint",
      "application/vnd.openxmlformats-officedocument.presentationml.presentation",
      "text/plain",
      "application/zip",
      "application/x-rar-compressed",
    ];

    allowedTypes.includes(file.mimetype)
      ? cb(null, true)
      : cb(new Error("Invalid file type"), false);
  };

  const upload = multer({
    storage,
    fileFilter,
    limits: { fileSize: 10 * 1024 * 1024 },
  });

  /* -------------------- Validators -------------------- */
  const validateComment = [
    body("comment")
      .notEmpty()
      .withMessage("Comment is required")
      .trim()
      .isLength({ max: 2000 }),
    body("is_private").optional().isBoolean(),
  ];

  /* -------------------- Routes -------------------- */

  // Create comment (generic)
  router.route("/comment").post(verifyJWT, validateComment, (req, res) => {
    CommentController.createComment(req, res, io);
  });

  // Create comment by context
  router
    .route("/comment/activity/:activity_id")
    .post(
      verifyJWT,
      param("activity_id").isUUID(),
      validateComment,
      (req, res) => CommentController.createComment(req, res, io)
    );

  router
    .route("/comment/project/:project_id")
    .post(
      verifyJWT,
      param("project_id").isUUID(),
      validateComment,
      (req, res) => CommentController.createComment(req, res, io)
    );

  router
    .route("/comment/subtask/:sub_task_id")
    .post(
      verifyJWT,
      param("sub_task_id").isUUID(),
      validateComment,
      (req, res) => CommentController.createComment(req, res, io)
    );

  // Get comments
  router
    .route("/comment")
    .get(
      verifyJWT,
      [
        query("project_id").optional().isUUID(),
        query("activity_id").optional().isUUID(),
        query("sub_task_id").optional().isUUID(),
        query("sort_by")
          .optional()
          .isIn(["newest", "oldest", "most_liked", "most_replied", "pinned"]),
      ],
      CommentController.getComments
    );

  // Get single comment
  router
    .route("/comment/:comment_id")
    .get(
      verifyJWT,
      param("comment_id").isUUID(),
      CommentController.getCommentById
    );

  // Update comment
  router
    .route("/comment/:comment_id")
    .put(
      verifyJWT,
      param("comment_id").isUUID(),
      validateComment,
      CommentController.updateComment
    );

  // Delete comment
  router
    .route("/comment/:comment_id")
    .delete(
      verifyJWT,
      param("comment_id").isUUID(),
      CommentController.deleteComment
    );

  // Like / Unlike
  router
    .route("/comment/:comment_id/like")
    .post(
      verifyJWT,
      param("comment_id").isUUID(),
      CommentController.toggleLike
    );

  // Pin / Unpin
  router
    .route("/comment/:comment_id/pin")
    .post(verifyJWT, param("comment_id").isUUID(), CommentController.togglePin);

  // Upload attachment
  router
    .route("/comment/:comment_id/attachments")
    .post(
      verifyJWT,
      param("comment_id").isUUID(),
      upload.single("file"),
      CommentController.uploadAttachment
    );

  // Remove attachment
  router
    .route("/comment/attachments/:attachment_id")
    .delete(
      verifyJWT,
      param("attachment_id").isUUID(),
      CommentController.removeAttachment
    );

  // Comment stats
  router
    .route("/comment/stats")
    .get(verifyJWT, CommentController.getCommentStats);

  return router;
}

module.exports = Router;
