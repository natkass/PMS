"use strict";
const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const CommentLike = sequelize.define(
    "CommentLike",
    {
      like_id: {
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
      user_id: {
        type: DataTypes.UUID,
        allowNull: false,
      },
      createdAt: DataTypes.DATE,
      updatedAt: DataTypes.DATE,
      is_deleted: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
    },
    {
      timestamps: true,
      sequelize,
      tableName: "comment_likes",
      modelName: "CommentLike",
      indexes: [
        {
          unique: true,
          fields: ["comment_id", "user_id"],
          where: {
            is_deleted: false,
          },
        },
      ],
    }
  );

  CommentLike.associate = function (models) {
    CommentLike.belongsTo(models.Comment, {
      foreignKey: "comment_id",
      onDelete: "CASCADE",
    });

    CommentLike.belongsTo(models.User, {
      foreignKey: "user_id",
      as: "likedBy",
    });
  };

  return CommentLike;
};
