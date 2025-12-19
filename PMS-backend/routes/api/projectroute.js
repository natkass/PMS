const express = require("express");
function Router(io) {
  const router = express.Router();
  const activityController = require("../../controllers/ProjectController/activityController.js");
  const taskController = require("../../controllers/ProjectController/taskController.js");
  const majortaskController = require("../../controllers/ProjectController/major_taskController.js");
  const sub_taskController = require("../../controllers/ProjectController/sub_taskController.js");
  const multer = require("multer");
  const documentTypeController = require("../../controllers/ProjectController/documentType.js");
  const documentController = require("../../controllers/ProjectController/document.js");
  const projectController = require("../../controllers/ProjectController/projectController.js");
  const CommentController = require("../../controllers/ProjectController/commentController");
  const notebookController = require("../../controllers/ProjectController/notebookController.js");
  const milestoneController = require("../../controllers/ProjectController/milestoneController.js");
  const projectnotfication = require("../../controllers/notficationControllers/projectnotfication.js");
  const verifyJWT = require("../../middlewares/verifyJWT.js");
  const verifyAccessWithoutProject = require("../../middlewares/verifyAccessWithoutProject.js");
  const verifyAccessWithProject = require("../../middlewares/verifyAccessWithProject.js");
  var storage = multer.diskStorage({
    destination: function (req, file, cb) {
      console.log("calling destination...");
      cb(null, "./public/documents/");
    },
    filename: function (req, file, cb) {
      console.log(file.originalname);
      cb(null, new Date().getTime() + file.originalname);
    },
  });
  var upload = multer({ storage: storage });

  router.route("/notification").get((req, res) => {
    try {
      projectnotfication.handleGetAllNotifications(req, res, io);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Server error" });
    }
  });

  router.route("/notification/markasread/:user_id").put((req, res) => {
    try {
      projectnotfication.markNotificationAsRead(req, res, io);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Server error" });
    }
  });

  // router
  //   .route("/project/add")
  //   .post(
  //     upload.array("documents", 5),
  //     verifyJWT,
  //     verifyAccessWithoutProject(process.env.CREATE_ACTIVITY),
  //     (req, res) => {
  //       try {
  //         projectController.handleNewProject(req, res, io);
  //       } catch (error) {
  //         console.error(error);
  //         res.status(500).json({ message: "Server error" });
  //       }
  //     }
  //   );
  router
    .route("/activity/newactivity/:project_id")
    .post(
      verifyJWT,
      verifyAccessWithProject(process.env.CREATE_ACTIVITY),
      (req, res) => {
        try {
          activityController.createActivity(req, res, io);
        } catch (error) {
          console.error(error);
          res.status(500).json({ message: "Server error" });
        }
      }
    );
  router.route("/activity/:id").get(activityController.getActivityById);
  router
    .route("/getAllactivity/:project_id")
    .get(activityController.getAllActivities);
  router.route("/updateactivity/:id").post(activityController.updateActivity);
  router.route("/deleteactivity/:id").delete(activityController.deleteActivity);

  //  router.route('/getAllactivitymember')
  //    .get(taskController.getAllactivityMembers)
  router
    .route("/getAllmemebrsofactivity/:id")
    .get(activityController.handleGetAllMembersOfActivity);
  // fetch all projectmembers for activity members

  router
    .route("/getAllProjectMembers/:project_id")
    .get(activityController.getAlllprojectMembers);

  //Task routers

  router.route("/task/newTask/:activity_id").post((req, res) => {
    try {
      taskController.createTask(req, res, io);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Server error" });
    }
  });
  router.route("/task/:id").get(taskController.getTaskById);
  router.route("/taskmember/:id").get(taskController.gettaskmember);
  router.route("/getAlltask/:activity_id").get(taskController.getAllTasks);
  router.route("/updateTask/:task_id").post(taskController.updateTask);
  router.route("/deleteTask/:id").delete(taskController.deleteTask);

  //sub_Task routers

  router.route("/sub_task/newSubTask/:task_id").post((req, res) => {
    try {
      sub_taskController.createSubTask(req, res, io);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Server error" });
    }
  });
  router.route("/sub_task/:id").get(sub_taskController.getSubTaskById);
  router
    .route("/sub_taskmembers/:id")
    .get(sub_taskController.getSubTaskMembers);
  router
    .route("/getsub_taskofmember/:project_member_id")
    .get(sub_taskController.getSubtaskofmember);

  router
    .route("/getAllSub_task/:task_id")
    .get(sub_taskController.getAllSubTasks);
  router.route("/updateSub_task/:id").post(sub_taskController.updateSubTask);
  router.route("/deleteSub_ask/:id").delete(sub_taskController.deleteSubTask);
  router.route("/updateSub_taskstatus/:id").post((req, res) => {
    try {
      sub_taskController.updateSubTaskStatus(req, res, io);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Server error" });
    }
  });

  router
    .route("/document/add/:projectId")
    .post(
      upload.array("files", 5),
      documentController.handleNewDocumentToProject
    );
  router
    .route("/document/update/:projectId/:documentId")
    .put(upload.single("file"), documentController.handleUpdateDocument);

  router
    .route("/document/getAll")
    .get(documentController.handleGetAllDocuments);
  router
    .route("/document/get/:projectId")
    .get(documentController.handleGetDocumentByProjectId);

  router
    .route("/documentType/add")
    .post(documentTypeController.handleNewDocumentType);
  router
    .route("/documentType/getAll")
    .get(documentTypeController.handleGetAllDocumentTypes);
  router
    .route("/documentType/get/:id")
    .get(documentTypeController.handleGetDocumentTypeById);
  router
    .route("/documentType/update/:id")
    .put(documentTypeController.handleUpdateDocumentType);
  router
    .route("/updateProject/:projectId")
    .post(projectController.handleUpdateProject);
  router
    .route("/documentType/delete/:id")
    .delete(documentTypeController.handleDeleteDocumentType);

  //

  // project routes
  router
    .route("/project/add")
    .post(
      upload.array("documents", 5),
      verifyJWT,
      verifyAccessWithoutProject(process.env.CREATE_PROJECT),
      (req, res) => {
        try {
          projectController.handleNewProject(req, res, io);
        } catch (error) {
          console.error(error);
          res.status(500).json({ message: "Server error" });
        }
      }
    );
  router
    .route("/getAll")
    .get(verifyJWT, projectController.handleGetAllProjects);
  router.route("/get/:projectId").get(projectController.handleGetProjectById);
  router
    .route("/getMembers/:projectId")
    .get(projectController.handleGetProjectMemberById);

  // // //get milestone from three table
  // //getAllMilstonerouter.route('/getAllmilestone/:idType/:id')
  router
    .route("/getAllmilestone/:idType/:id")
    .get(milestoneController.getAllMilestone);

  //comment

  // router
  //   .route("/newcommentsubtask/:sub_task_id")
  //   .post(verifyJWT, (req, res) => {
  //     try {
  //       CommentController.createComment(req, res, io);
  //     } catch (error) {
  //       console.error(error);
  //       res.status(500).json({ message: "Server error" });
  //     }
  //   });
  // router
  //   .route("/newcommentproject/:project_id")
  //   .post(verifyJWT, CommentController.createComment);
  // router
  //   .route("/newcommentactivity/:activity_id")
  //   .post(verifyJWT, CommentController.createComment);

  // router
  //   .route("/comment/:comment_id")
  //   .get(verifyJWT, CommentController.getCommentById);

  // router
  //   .route("/getAllacommentOfSubtask/:sub_task_id")
  //   .get(verifyJWT, CommentController.getAllComments);
  // router
  //   .route("/getAllacommentOfProject/:project_id")
  //   .get(verifyJWT, CommentController.getAllComments);

  // router
  //   .route("/getAllacommentOfActivity/:activity_id")
  //   .get(verifyJWT, CommentController.getAllComments);

  // router
  //   .route("/updatecomment/:comment_id")
  //   .put(verifyJWT, CommentController.updateComment);
  // router
  //   .route("/deletecomment/:comment_id")
  //   .delete(verifyJWT, CommentController.deleteComment);

  //notebook route
  router
    .route("/newnotebooksubtask/:sub_task_id")
    .post(verifyJWT, notebookController.createNotebook);
  router
    .route("/newnotebookproject/:project_id")
    .post(verifyJWT, notebookController.createNotebook);
  router
    .route("/newnotebookactivity/:activity_id")
    .post(verifyJWT, notebookController.createNotebook);
  router
    .route("/newnotebooktask/:task_id")
    .post(verifyJWT, notebookController.createNotebook);

  router
    .route("/notebook/:notebook_id")
    .get(verifyJWT, notebookController.getNotebookById);

  router
    .route("/getAllnotebookOfSubtask/:sub_task_id")
    .get(verifyJWT, notebookController.getAllNotebooks);
  router
    .route("/getAllanotebookOfProject/:project_id")
    .get(verifyJWT, notebookController.getAllNotebooks);

  router
    .route("/getAllnotebookOfActivity/:activity_id")
    .get(verifyJWT, notebookController.getAllNotebooks);
  router
    .route("/getAllnotebookOftask/:task_id")
    .get(verifyJWT, notebookController.getAllNotebooks);

  router
    .route("/updatenotebook/:notebook_id")
    .put(verifyJWT, notebookController.updateNotebook);
  router
    .route("/deletenotebook/:notebook_id")
    .delete(verifyJWT, notebookController.deleteNotebook);

  return router;
}

module.exports = Router;
