"use strict";
const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const Comment = sequelize.define(
    "Comment",
    {
      comment_id: {
        type: DataTypes.UUID,
        allowNull: false,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4,
      },
      sub_task_id: {
        type: DataTypes.UUID,
        allowNull: true,
        references: {
          model: "sub_tasks",
          key: "sub_task_id",
        },
      },
      project_id: {
        type: DataTypes.UUID,
        allowNull: true,
        references: {
          model: "projects",
          key: "project_id",
        },
      },
      activity_id: {
        type: DataTypes.UUID,
        allowNull: true,
        references: {
          model: "activities",
          key: "activity_id",
        },
      },
      parent_comment_id: {
        type: DataTypes.UUID,
        allowNull: true,
        references: {
          model: "comments",
          key: "comment_id",
        },
      },
      comment: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      is_pinned: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      is_private: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      likes_count: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
      },
      edited_at: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      created_by: {
        type: DataTypes.UUID,
        allowNull: false,
      },
      updated_by: {
        type: DataTypes.UUID,
        allowNull: true,
      },
      createdAt: DataTypes.DATE,
      updatedAt: DataTypes.DATE,
      is_deleted: {
        allowNull: false,
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      deletionAt: DataTypes.DATE,
      deletedBy: DataTypes.UUID,
    },
    {
      timestamps: true,
      sequelize,
      tableName: "comments",
      modelName: "Comment",
    }
  );

  Comment.associate = function (models) {
    Comment.belongsTo(models.Comment, {
      as: "parent",
      foreignKey: "parent_comment_id",
      onDelete: "CASCADE",
    });

    Comment.hasMany(models.Comment, {
      as: "replies",
      foreignKey: "parent_comment_id",
      onDelete: "CASCADE",
    });

    Comment.hasMany(models.CommentLike, {
      as: "likes",
      foreignKey: "comment_id",
      onDelete: "CASCADE",
    });

    Comment.hasMany(models.CommentAttachment, {
      as: "attachments",
      foreignKey: "comment_id",
      onDelete: "CASCADE",
    });

    Comment.belongsTo(models.User, {
      foreignKey: "created_by",
      as: "commenter",
    });

    Comment.belongsTo(models.Project, {
      foreignKey: "project_id",
      onDelete: "CASCADE",
    });

    Comment.belongsTo(models.SubTask, {
      foreignKey: "sub_task_id",
      onDelete: "CASCADE",
    });

    Comment.belongsTo(models.Activity, {
      foreignKey: "activity_id",
      onDelete: "CASCADE",
    });
  };

  return Comment;
};
