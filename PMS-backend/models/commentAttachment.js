"use strict";
const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const CommentAttachment = sequelize.define(
    "CommentAttachment",
    {
      attachment_id: {
        type: DataTypes.UUID,
        allowNull: false,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4,
      },
      comment_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: "comments",
          key: "comment_id",
        },
      },
      file_name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      file_size: {
        type: DataTypes.BIGINT,
        allowNull: false,
      },
      file_type: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      file_url: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      is_uploaded: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      uploaded_by: {
        type: DataTypes.UUID,
        allowNull: false,
      },
      created_by: DataTypes.UUID,
      updated_by: DataTypes.UUID,
      createdAt: DataTypes.DATE,
      updatedAt: DataTypes.DATE,
      is_deleted: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      deletionAt: DataTypes.DATE,
      deletedBy: DataTypes.UUID,
    },
    {
      timestamps: true,
      sequelize,
      tableName: "comment_attachments",
      modelName: "CommentAttachment",
    }
  );

  CommentAttachment.associate = function (models) {
    CommentAttachment.belongsTo(models.Comment, {
      foreignKey: "comment_id",
      onDelete: "CASCADE",
    });

    CommentAttachment.belongsTo(models.User, {
      foreignKey: "uploaded_by",
      as: "uploader",
    });
  };

  return CommentAttachment;
};
