"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable("comments", {
      comment_id: {
        type: Sequelize.UUID,
        allowNull: false,
        primaryKey: true,
        defaultValue: Sequelize.UUIDV4,
      },
      sub_task_id: {
        type: Sequelize.UUID,
        allowNull: true,
        references: {
          model: "sub_tasks",
          key: "sub_task_id",
        },
        onDelete: "CASCADE",
      },
      project_id: {
        type: Sequelize.UUID,
        allowNull: true,
        references: {
          model: "projects",
          key: "project_id",
        },
        onDelete: "CASCADE",
      },
      activity_id: {
        type: Sequelize.UUID,
        allowNull: true,
        references: {
          model: "activities",
          key: "activity_id",
        },
        onDelete: "CASCADE",
      },
      parent_comment_id: {
        type: Sequelize.UUID,
        allowNull: true,
        references: {
          model: "comments",
          key: "comment_id",
        },
        onDelete: "CASCADE",
      },
      comment: {
        type: Sequelize.TEXT,
        allowNull: false,
      },
      is_pinned: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      is_private: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      likes_count: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
      },
      replies_count: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
      },
      edited_at: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      created_by: {
        type: Sequelize.UUID,
        allowNull: false,
      },
      updated_by: {
        type: Sequelize.UUID,
        allowNull: true,
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      is_deleted: {
        allowNull: false,
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      deletionAt: {
        allowNull: true,
        type: Sequelize.DATE,
      },
      deletedBy: {
        allowNull: true,
        type: Sequelize.UUID,
      },
    });

    await queryInterface.createTable("comment_likes", {
      like_id: {
        type: Sequelize.UUID,
        allowNull: false,
        primaryKey: true,
        defaultValue: Sequelize.UUIDV4,
      },
      comment_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: "comments",
          key: "comment_id",
        },
        onDelete: "CASCADE",
      },
      user_id: {
        type: Sequelize.UUID,
        allowNull: false,
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      is_deleted: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
    });

    await queryInterface.addIndex("comment_likes", {
      fields: ["comment_id", "user_id"],
      unique: true,
      where: {
        is_deleted: false,
      },
      name: "unique_comment_like",
    });

    await queryInterface.createTable("comment_attachments", {
      attachment_id: {
        type: Sequelize.UUID,
        allowNull: false,
        primaryKey: true,
        defaultValue: Sequelize.UUIDV4,
      },
      comment_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: "comments",
          key: "comment_id",
        },
        onDelete: "CASCADE",
      },
      file_name: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      file_path: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      file_url: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      file_size: {
        type: Sequelize.BIGINT,
        allowNull: false,
      },
      file_type: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      mime_type: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      uploaded_by: {
        type: Sequelize.UUID,
        allowNull: false,
      },
      created_by: {
        type: Sequelize.UUID,
        allowNull: true,
      },
      updated_by: {
        type: Sequelize.UUID,
        allowNull: true,
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      is_deleted: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      deletionAt: {
        allowNull: true,
        type: Sequelize.DATE,
      },
      deletedBy: {
        allowNull: true,
        type: Sequelize.UUID,
      },
    });

    await queryInterface.addIndex("comments", ["project_id"]);
    await queryInterface.addIndex("comments", ["activity_id"]);
    await queryInterface.addIndex("comments", ["sub_task_id"]);
    await queryInterface.addIndex("comments", ["parent_comment_id"]);
    await queryInterface.addIndex("comments", ["created_by"]);
    await queryInterface.addIndex("comments", ["is_pinned"]);
    await queryInterface.addIndex("comments", ["is_private"]);
    await queryInterface.addIndex("comments", ["createdAt"]);

    await queryInterface.addIndex("comment_likes", ["comment_id"]);
    await queryInterface.addIndex("comment_likes", ["user_id"]);

    await queryInterface.addIndex("comment_attachments", ["comment_id"]);
    await queryInterface.addIndex("comment_attachments", ["uploaded_by"]);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable("comment_attachments");
    await queryInterface.dropTable("comment_likes");
    await queryInterface.dropTable("comments");
  },
};
