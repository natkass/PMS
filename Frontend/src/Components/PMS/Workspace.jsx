import React, { useEffect, useRef, useState } from "react";
import {
  Box,
  Tooltip,
  Typography,
  Badge,
  IconButton,
  InputAdornment,
  TextField,
  Backdrop,
  FormControl,
  MenuItem,
  Select,
  Card,
  CardContent,
  Grid,
  Chip,
  Avatar,
  AvatarGroup,
  Paper,
  Divider,
  Collapse,
  Fab,
  Tabs,
  Tab,
  Breadcrumbs,
  Link,
  SpeedDial,
  SpeedDialAction,
  SpeedDialIcon,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
} from "@mui/material";
import { makeStyles } from "@material-ui/core/styles";
import { Helmet } from "react-helmet-async";
import Swal from "sweetalert2";
import PuffLoader from "react-spinners/ClipLoader";

// Icons
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import CommentIcon from "@mui/icons-material/ChatBubbleOutlineOutlined";
import FlagIcon from "@mui/icons-material/Flag";
import ListAltIcon from "@mui/icons-material/ListAlt";
import AddCommentIcon from "@mui/icons-material/MapsUgcOutlined";
import PendingActionsIcon from "@mui/icons-material/PendingActions";
import SearchIcon from "@mui/icons-material/Search";
import TaskAltIcon from "@mui/icons-material/TaskAlt";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import DashboardIcon from "@mui/icons-material/Dashboard";
import ViewKanbanIcon from "@mui/icons-material/ViewKanban";
import TimelineIcon from "@mui/icons-material/Timeline";
import FilterListIcon from "@mui/icons-material/FilterList";
import SortIcon from "@mui/icons-material/Sort";
import GroupIcon from "@mui/icons-material/Group";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import DescriptionIcon from "@mui/icons-material/Description";
import PersonIcon from "@mui/icons-material/Person";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import InfoIcon from "@mui/icons-material/Info";
import CloseIcon from "@mui/icons-material/Close";
import { FaEdit, FaTrash } from "react-icons/fa";

// Config & Services
import { PERMISSIONS } from "../../config";
import apiService from "../services/apiServices";

// Components
import Subtaskcomment from "./Subtaskcomment.jsx";
import WorkspaceAddMajorTask from "./WorkspaceAddMajorTask.jsx";
import WorkspaceAddSubTask from "./WorkspaceAddSubTask.jsx";
import WorkspaceAssignMember from "./WorkspaceAssignMember.jsx";
import WorkspaceEditMajorTask from "./WorkspaceEditMajorTask.jsx";
import WorkspaceEditSubtask from "./WorkspaceEditSubtask.jsx";
import WorkspaceSubtasktrash from "./WorkspaceSubtasktrash.jsx";
import WorkspaceTaskTrash from "./WorkspaceTaskTrash.jsx";
import Subtaskcommentview from "./Subtaskcommentview.jsx";

const useStyles = makeStyles((theme) => ({
  workspaceContainer: {
    minHeight: "calc(100vh - 64px)",
    backgroundColor: "#f8fafc",
    padding: theme.spacing(3),
    [theme.breakpoints.down("sm")]: {
      padding: theme.spacing(2),
    },
  },
  activityCard: {
    borderRadius: "12px",
    border: "1px solid #e2e8f0",
    boxShadow: "0 1px 3px 0 rgba(0, 0, 0, 0.1)",
    transition: "all 0.2s ease-in-out",
    "&:hover": {
      boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
      borderColor: "#cbd5e1",
    },
    marginBottom: theme.spacing(3),
    overflow: "visible",
  },
  taskCard: {
    borderRadius: "10px",
    borderLeft: "4px solid #3b82f6",
    backgroundColor: "#ffffff",
    marginBottom: theme.spacing(2),
    transition: "all 0.2s ease-in-out",
    "&:hover": {
      transform: "translateY(-2px)",
      boxShadow: "0 4px 12px rgba(0, 0, 0, 0.08)",
    },
  },
  subtaskCard: {
    borderRadius: "8px",
    borderLeft: "3px solid #10b981",
    backgroundColor: "#f0fdfa",
    marginBottom: theme.spacing(1.5),
    transition: "all 0.2s ease-in-out",
    "&:hover": {
      backgroundColor: "#f0fdf9",
    },
  },
  statusBadge: {
    fontWeight: 600,
    fontSize: "0.75rem",
    padding: "4px 12px",
    borderRadius: "20px",
  },
  milestoneTag: {
    backgroundColor: "#f3e8ff",
    color: "#7c3aed",
    fontWeight: 600,
  },
  projectHeader: {
    background: "linear-gradient(90deg, #0c4a6e 0%, #075985 50%, #0c4a6e 100%)",
    borderRadius: "16px",
    padding: theme.spacing(4),
    color: "white",
    marginBottom: theme.spacing(4),
    position: "relative",
    overflow: "hidden",
    "&::before": {
      content: '""',
      position: "absolute",
      top: 0,
      right: 0,
      width: "200px",
      height: "200px",
      background:
        "radial-gradient(circle, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0) 70%)",
    },
  },
  floatingActions: {
    position: "fixed",
    bottom: theme.spacing(4),
    right: theme.spacing(4),
    zIndex: 1000,
  },
  progressBar: {
    height: "4px",
    borderRadius: "2px",
    backgroundColor: "#e2e8f0",
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: "2px",
    transition: "width 0.3s ease",
  },
  detailPopup: {
    borderRadius: "16px",
    maxWidth: "800px",
    width: "90%",
    maxHeight: "90vh",
    overflow: "hidden",
  },
}));

const DetailPopup = ({ open, onClose, type, data, userInfo }) => {
  const getStatusColor = (status) => {
    switch (status) {
      case "Completed":
        return { color: "#10b981", bgColor: "#d1fae5" };
      case "On Progress":
      case "In Progress":
        return { color: "#f97316", bgColor: "#ffedd5" };
      case "Pending":
        return { color: "#9ca3af", bgColor: "#f3f4f6" };
      default:
        return { color: "#6b7280", bgColor: "#f3f4f6" };
    }
  };

  const renderActivityDetails = () => (
    <>
      <DialogTitle sx={{ display: "flex", alignItems: "center", gap: 2 }}>
        <FlagIcon color="primary" />
        <Box sx={{ flex: 1 }}>
          <Typography variant="h5" fontWeight={600}>
            {data?.activity?.name}
          </Typography>
          <Box sx={{ display: "flex", alignItems: "center", gap: 2, mt: 1 }}>
            <Chip
              label={data?.activity?.activity_status || "Active"}
              size="small"
              sx={{
                backgroundColor: getStatusColor(data?.activity?.activity_status)
                  .bgColor,
                color: getStatusColor(data?.activity?.activity_status).color,
                fontWeight: 600,
              }}
            />
            {data?.activity?.is_milestone && (
              <Chip
                icon={<FlagIcon />}
                label="Milestone"
                size="small"
                sx={{ bgcolor: "#f3e8ff", color: "#7c3aed" }}
              />
            )}
          </Box>
        </Box>
      </DialogTitle>
      <DialogContent dividers>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              <CalendarTodayIcon sx={{ fontSize: 16, mr: 1 }} />
              Created Date
            </Typography>
            <Typography variant="body1" gutterBottom>
              {new Date(data?.activity?.createdAt).toLocaleDateString()}
            </Typography>

            <Typography
              variant="subtitle2"
              color="text.secondary"
              gutterBottom
              sx={{ mt: 2 }}
            >
              <AccessTimeIcon sx={{ fontSize: 16, mr: 1 }} />
              Last Updated
            </Typography>
            <Typography variant="body1" gutterBottom>
              {new Date(data?.activity?.updatedAt).toLocaleDateString()}
            </Typography>
          </Grid>
          <Grid item xs={12} md={6}>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              <TaskAltIcon sx={{ fontSize: 16, mr: 1 }} />
              Total Tasks
            </Typography>
            <Typography variant="h4" color="primary" gutterBottom>
              {data?.tasks?.length || 0}
            </Typography>

            <Typography
              variant="subtitle2"
              color="text.secondary"
              gutterBottom
              sx={{ mt: 2 }}
            >
              <DescriptionIcon sx={{ fontSize: 16, mr: 1 }} />
              Description
            </Typography>
            <Typography variant="body1" gutterBottom>
              {data?.activity?.description || "No description provided"}
            </Typography>
          </Grid>
        </Grid>

        {data?.tasks && data.tasks.length > 0 && (
          <Box sx={{ mt: 3 }}>
            <Typography variant="h6" gutterBottom>
              Tasks in this Activity
            </Typography>
            <List>
              {data.tasks.slice(0, 3).map((task, index) => (
                <ListItem
                  key={index}
                  sx={{ borderBottom: "1px solid #e2e8f0" }}
                >
                  <ListItemIcon>
                    <TaskAltIcon color="primary" />
                  </ListItemIcon>
                  <ListItemText
                    primary={task.name}
                    secondary={
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: 2,
                          mt: 1,
                        }}
                      >
                        <Chip
                          label={task.task_status}
                          size="small"
                          sx={{
                            backgroundColor: getStatusColor(task.task_status)
                              .bgColor,
                            color: getStatusColor(task.task_status).color,
                          }}
                        />
                        <Typography variant="caption" color="text.secondary">
                          {new Date(task.start_date).toLocaleDateString()} -{" "}
                          {new Date(task.end_date).toLocaleDateString()}
                        </Typography>
                      </Box>
                    }
                  />
                </ListItem>
              ))}
            </List>
          </Box>
        )}
      </DialogContent>
    </>
  );

  const renderTaskDetails = () => (
    <>
      <DialogTitle sx={{ display: "flex", alignItems: "center", gap: 2 }}>
        <TaskAltIcon color="primary" />
        <Box sx={{ flex: 1 }}>
          <Typography variant="h5" fontWeight={600}>
            {data?.name}
          </Typography>
          <Box sx={{ display: "flex", alignItems: "center", gap: 2, mt: 1 }}>
            <Chip
              label={data?.task_status || "Pending"}
              size="small"
              sx={{
                backgroundColor: getStatusColor(data?.task_status).bgColor,
                color: getStatusColor(data?.task_status).color,
                fontWeight: 600,
              }}
            />
            {data?.is_milestone && (
              <Chip
                icon={<FlagIcon />}
                label="Milestone"
                size="small"
                sx={{ bgcolor: "#f3e8ff", color: "#7c3aed" }}
              />
            )}
          </Box>
        </Box>
      </DialogTitle>
      <DialogContent dividers>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              <CalendarTodayIcon sx={{ fontSize: 16, mr: 1 }} />
              Start Date
            </Typography>
            <Typography variant="body1" gutterBottom>
              {new Date(data?.start_date).toLocaleDateString()}
            </Typography>

            <Typography
              variant="subtitle2"
              color="text.secondary"
              gutterBottom
              sx={{ mt: 2 }}
            >
              <CalendarTodayIcon sx={{ fontSize: 16, mr: 1 }} />
              End Date
            </Typography>
            <Typography variant="body1" gutterBottom>
              {new Date(data?.end_date).toLocaleDateString()}
            </Typography>

            <Typography
              variant="subtitle2"
              color="text.secondary"
              gutterBottom
              sx={{ mt: 2 }}
            >
              <AccessTimeIcon sx={{ fontSize: 16, mr: 1 }} />
              Duration
            </Typography>
            <Typography variant="body1" gutterBottom>
              {Math.ceil(
                (new Date(data?.end_date) - new Date(data?.start_date)) /
                  (1000 * 60 * 60 * 24)
              )}{" "}
              days
            </Typography>
          </Grid>
          <Grid item xs={12} md={6}>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              <GroupIcon sx={{ fontSize: 16, mr: 1 }} />
              Assigned Members
            </Typography>
            {data?.members && data.members.length > 0 ? (
              <AvatarGroup max={4} sx={{ mt: 1 }}>
                {data.members.map((member, index) => (
                  <Tooltip
                    key={index}
                    title={member.UserInfo.full_name || member.UserInfo.email}
                  >
                    <Avatar sx={{ width: 32, height: 32 }}>
                      {member.UserInfo.full_name?.charAt(0) ||
                        member.UserInfo.email?.charAt(0)}
                    </Avatar>
                  </Tooltip>
                ))}
              </AvatarGroup>
            ) : (
              <Typography variant="body2" color="text.secondary">
                No members assigned
              </Typography>
            )}

            <Typography
              variant="subtitle2"
              color="text.secondary"
              gutterBottom
              sx={{ mt: 3 }}
            >
              <DescriptionIcon sx={{ fontSize: 16, mr: 1 }} />
              Description
            </Typography>
            <Typography variant="body1" gutterBottom>
              {data?.description || "No description provided"}
            </Typography>
          </Grid>
        </Grid>

        {data?.subTask && data.subTask.length > 0 && (
          <Box sx={{ mt: 3 }}>
            <Typography variant="h6" gutterBottom>
              Subtasks ({data.subTask.length})
            </Typography>
            <List>
              {data.subTask.slice(0, 5).map((subtask, index) => (
                <ListItem
                  key={index}
                  sx={{ borderBottom: "1px solid #e2e8f0" }}
                >
                  <ListItemIcon>
                    <ListAltIcon color="success" />
                  </ListItemIcon>
                  <ListItemText
                    primary={subtask.name}
                    secondary={
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: 2,
                          mt: 1,
                        }}
                      >
                        <Chip
                          label={subtask.subtask_status}
                          size="small"
                          sx={{
                            backgroundColor: getStatusColor(
                              subtask.subtask_status
                            ).bgColor,
                            color: getStatusColor(subtask.subtask_status).color,
                          }}
                        />
                        <Typography variant="caption" color="text.secondary">
                          {new Date(subtask.start_date).toLocaleDateString()} -{" "}
                          {new Date(subtask.end_date).toLocaleDateString()}
                        </Typography>
                      </Box>
                    }
                  />
                </ListItem>
              ))}
            </List>
          </Box>
        )}
      </DialogContent>
    </>
  );

  const renderSubtaskDetails = () => (
    <>
      <DialogTitle sx={{ display: "flex", alignItems: "center", gap: 2 }}>
        <ListAltIcon color="success" />
        <Box sx={{ flex: 1 }}>
          <Typography variant="h5" fontWeight={600}>
            {data?.name}
          </Typography>
          <Box sx={{ display: "flex", alignItems: "center", gap: 2, mt: 1 }}>
            <Chip
              label={data?.subtask_status || "Pending"}
              size="small"
              sx={{
                backgroundColor: getStatusColor(data?.subtask_status).bgColor,
                color: getStatusColor(data?.subtask_status).color,
                fontWeight: 600,
              }}
            />
            {data?.is_milestone && (
              <Chip
                icon={<FlagIcon />}
                label="Milestone"
                size="small"
                sx={{ bgcolor: "#f3e8ff", color: "#7c3aed" }}
              />
            )}
          </Box>
        </Box>
      </DialogTitle>
      <DialogContent dividers>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              <CalendarTodayIcon sx={{ fontSize: 16, mr: 1 }} />
              Start Date
            </Typography>
            <Typography variant="body1" gutterBottom>
              {new Date(data?.start_date).toLocaleDateString()}
            </Typography>

            <Typography
              variant="subtitle2"
              color="text.secondary"
              gutterBottom
              sx={{ mt: 2 }}
            >
              <CalendarTodayIcon sx={{ fontSize: 16, mr: 1 }} />
              End Date
            </Typography>
            <Typography variant="body1" gutterBottom>
              {new Date(data?.end_date).toLocaleDateString()}
            </Typography>

            <Typography
              variant="subtitle2"
              color="text.secondary"
              gutterBottom
              sx={{ mt: 2 }}
            >
              <AccessTimeIcon sx={{ fontSize: 16, mr: 1 }} />
              Time Remaining
            </Typography>
            <Typography variant="body1" gutterBottom>
              {Math.ceil(
                (new Date(data?.end_date) - new Date()) / (1000 * 60 * 60 * 24)
              )}{" "}
              days
            </Typography>
          </Grid>
          <Grid item xs={12} md={6}>
            <Typography
              variant="subtitle2"
              color="text.secondary"
              gutterBottom
              sx={{ mt: 3 }}
            >
              <DescriptionIcon sx={{ fontSize: 16, mr: 1 }} />
              Description
            </Typography>
            <Typography variant="body1" gutterBottom>
              {data?.description || "No description provided"}
            </Typography>
          </Grid>
        </Grid>

        <Box sx={{ mt: 3 }}>
          <Typography variant="subtitle2" color="text.secondary" gutterBottom>
            <CommentIcon sx={{ fontSize: 16, mr: 1 }} />
            Comments ({data?.Coments?.length || 0})
          </Typography>
          {data?.Coments && data.Coments.length > 0 ? (
            <List>
              {data.Coments.slice(0, 3).map((comment, index) => (
                <ListItem
                  key={index}
                  sx={{ borderBottom: "1px solid #e2e8f0" }}
                >
                  <ListItemIcon>
                    <Avatar sx={{ width: 32, height: 32 }}>
                      {comment.user?.name?.charAt(0) ||
                        comment.user?.email?.charAt(0)}
                    </Avatar>
                  </ListItemIcon>
                  <ListItemText
                    primary={
                      <Box
                        sx={{ display: "flex", alignItems: "center", gap: 1 }}
                      >
                        <Typography variant="subtitle2">
                          {comment.user?.name || comment.user?.email}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {new Date(comment.createdAt).toLocaleDateString()}
                        </Typography>
                      </Box>
                    }
                    secondary={comment.content}
                  />
                </ListItem>
              ))}
            </List>
          ) : (
            <Typography variant="body2" color="text.secondary">
              No comments yet
            </Typography>
          )}
        </Box>
      </DialogContent>
    </>
  );

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      classes={{ paper: useStyles().detailPopup }}
    >
      {type === "activity" && renderActivityDetails()}
      {type === "task" && renderTaskDetails()}
      {type === "subtask" && renderSubtaskDetails()}
      <DialogActions>
        <Button onClick={onClose} startIcon={<CloseIcon />}>
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};

const Workspace = (props) => {
  const classes = useStyles();
  const [formData, setFormData] = useState({
    subtask_status: "",
  });
  const [showModal, setShowModal] = useState(false);
  const [showAddTaskModal, setShowAddTaskModal] = useState(false);
  const [showEditMajorTaskModal, setShowEditMajorTaskModal] = useState(false);
  const [showAddSubTaskModal, setShowAddSubTaskModal] = useState(false);
  const [showMajorTaskTrashModal, setShowMajorTaskTrashModal] = useState(false);
  const [showSubtasktrashModal, setShowSubtasktrashModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [currentPage, setCurrentPage] = useState(0);
  const [expandedItems, setExpandedItems] = useState([]);
  const [showOptions, setShowOptions] = useState({});
  const [showSubtaskOptions, setShowSubtaskOptions] = useState({});
  const [showSubsubtaskOptions, setShowSubsubtaskOptions] = useState({});
  const [commentSubModalOpen, setCommentSubModalOpen] = useState(false);
  const [viewCommentSubModalOpen, setViewCommentSubModalOpen] = useState(false);
  const [commentOnSubtask, setCommentOnSubtask] = useState(0);
  const [viewCommentOnSubtask, setViewCommentOnSubtask] = useState(0);
  const [selectedSubTaskId, setSelectedSubTaskId] = useState("");
  const [selectedTaskIndex, setSelectedTaskIndex] = useState(null);
  const [selectedSubtaskIndex, setSelectedSubtaskIndex] = useState(null);
  const [selectedSubsubtaskIndex, setSelectedSubsubtaskIndex] = useState(null);
  const [expandedActivities, setExpandedActivities] = useState([]);
  const [expandedTasks, setExpandedTasks] = useState([]);
  const [showEditSubtaskModal, setShowEditSubtaskModal] = useState(false);
  const [expandedSubtasks, setExpandedSubtasks] = useState([]);
  const [activities, setActivities] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [subTasks, setSubTasks] = useState([]);
  const [createTask, setCreateTask] = useState(0);
  const [updateTask, setUpdateTask] = useState(0);
  const [deleteTask, setDeleteTask] = useState(0);
  const [createSubTask, setCreateSubTask] = useState(0);
  const [updateSubTask, setUpdateSubTask] = useState(0);
  const [deleteSubTask, setDeleteSubTask] = useState(0);
  const [viewMode, setViewMode] = useState("list");
  const [sortBy, setSortBy] = useState("date");
  const [detailPopup, setDetailPopup] = useState({
    open: false,
    type: null,
    data: null,
  });

  const [userInfo, setUserInfo] = useState(() => {
    return JSON.parse(localStorage.getItem("userInfo")) || [];
  });
  const [permissions, setPermissions] = useState(() => {
    return JSON.parse(localStorage.getItem("permissions")) || [];
  });
  const [projectPermissions, setProjectPermissions] = useState(() => {
    return JSON.parse(localStorage.getItem("project_permissions")) || [];
  });
  const [loading, setLoading] = useState(false);
  const [noActivity, setNoActivity] = useState();
  const [selectedActivity, setSelectedActivity] = useState({});
  const [selectedTask, setSelectedTask] = useState({});
  const [selectedSubTask, setSelectedSubTask] = useState({});

  const modalRef = useRef(null);

  // Fixed toggle functions
  const toggleActivity = (index) => {
    setExpandedActivities((prev) =>
      prev.includes(index)
        ? prev.filter((item) => item !== index)
        : [...prev, index]
    );
  };

  const toggleTask = (activityIndex, taskIndex) => {
    const taskKey = `${activityIndex}-${taskIndex}`;
    setExpandedTasks((prev) =>
      prev.includes(taskKey)
        ? prev.filter((item) => item !== taskKey)
        : [...prev, taskKey]
    );
  };

  const toggleSubtask = (activityIndex, taskIndex, subtaskIndex) => {
    const subtaskKey = `${activityIndex}-${taskIndex}-${subtaskIndex}`;
    setExpandedSubtasks((prev) =>
      prev.includes(subtaskKey)
        ? prev.filter((item) => item !== subtaskKey)
        : [...prev, subtaskKey]
    );
  };

  const toggleModal = () => setShowModal(!showModal);
  const toggleEditMajorTaskModal = (index) => {
    setSelectedTaskIndex(index);
    setShowEditMajorTaskModal(!showEditMajorTaskModal);
  };

  const toggleAddTaskModal = () => setShowAddTaskModal(!showAddTaskModal);
  const toggleAddSubTaskModal = () =>
    setShowAddSubTaskModal(!showAddSubTaskModal);
  const toggleMajorTaskTrashModal = (index) => {
    setSelectedTaskIndex(index);
    setShowMajorTaskTrashModal(!showMajorTaskTrashModal);
  };

  const statusOptions = [
    {
      value: "Pending",
      label: "Pending",
      color: "#9ca3af",
      bgColor: "#f3f4f6",
    },
    {
      value: "On Progress",
      label: "In Progress",
      color: "#f97316",
      bgColor: "#ffedd5",
    },
    {
      value: "Completed",
      label: "Completed",
      color: "#10b981",
      bgColor: "#d1fae5",
    },
  ];

  const toggleSubtasktrashModal = (index) => {
    setSelectedTaskIndex(index);
    setShowSubtasktrashModal(!showSubtasktrashModal);
  };

  const toggleEditSubtaskModal = () => {
    setShowEditSubtaskModal(!showEditSubtaskModal);
  };

  const handleChange = (subtaskItem) => (event) => {
    handleStatusChange(event.target.value, subtaskItem.sub_task_id);
  };

  const handlefetchTask = async () => {
    try {
      const taskData = await apiService.getAllTasks(
        props.setSelectedProjectInfo.project_id,
        userInfo.access_token
      );
      const sortedResponse = taskData.sort((a, b) => {
        if (a.createdAt > b.createdAt) {
          return -1;
        }
      });
      setTasks(sortedResponse);
    } catch (error) {
      console.error("Error fetching projects:", error);
    }
  };

  const handlefetchSubTask = async () => {
    try {
      const taskData = await apiService.getAllSubTasks(
        props.setSelectedProjectInfo.project_id,
        userInfo.access_token
      );
      const sortedResponse = taskData.sort((a, b) => {
        if (a.createdAt > b.createdAt) {
          return -1;
        }
      });
      setSubTasks(sortedResponse);
    } catch (error) {
      console.error("Error fetching projects:", error);
    }
  };

  const handleAddTaskModalClose = () => {
    setShowAddTaskModal(false);
  };

  const handleStatusChange = async (selectedStatus, sub_task_id) => {
    formData.subtask_status = selectedStatus;
    try {
      const response = await apiService.updateSubTaskStatus(
        formData,
        sub_task_id
      );

      if (response.status === 200) {
        const Toast = Swal.mixin({
          toast: true,
          position: "top-end",
          showConfirmButton: false,
          timer: 1500,
          timerProgressBar: true,
          didOpen: (toast) => {
            toast.onmouseenter = Swal.stopTimer;
            toast.onmouseleave = Swal.resumeTimer;
          },
        });

        Toast.fire({
          icon: "success",
          title: "Sub Task Updated Successfully",
        }).then(() => {
          fetchActivities();
        });
      } else {
        console.error("failed : ", response);
        Swal.fire({
          position: "center",
          icon: "error",
          title: "Sub Task Status Update Failed",
          showConfirmButton: true,
          timer: 1500,
          customClass: {
            popup: "custom-popup-style",
          },
        });
      }
    } catch (error) {
      console.error("Sub Task Status Update failed:", error.message);
      Swal.fire({
        position: "center",
        icon: "error",
        title: "Sub Task Status Update Failed",
        showConfirmButton: true,
        timer: 1500,
        customClass: {
          popup: "custom-popup-style",
        },
      });
    }
  };

  const handleEditTaskModalClose = () => {
    setShowEditMajorTaskModal(false);
  };

  const handleEditSubTaskModalClose = () => {
    setShowEditSubtaskModal(false);
  };

  const handleAddSubModalClose = () => {
    setShowAddSubTaskModal(false);
  };

  const handleCommentModalClose = () => {
    setCommentSubModalOpen(false);
  };

  const handleViewCommentModalClose = () => {
    setViewCommentSubModalOpen(false);
  };

  const handleOpenDetailPopup = (type, data) => {
    setDetailPopup({
      open: true,
      type,
      data,
    });
  };

  const handleCloseDetailPopup = () => {
    setDetailPopup({
      open: false,
      type: null,
      data: null,
    });
  };

  const toggleAddSubSubTaskModal = () => {};

  const handleClickOutsideModal = (e) => {
    if (modalRef.current && !modalRef.current.contains(e.target)) {
      setShowModal(false);
      setShowEditMajorTaskModal(false);
      setShowAddTaskModal(false);
      setShowAddSubTaskModal(false);
      setShowMajorTaskTrashModal(false);
      setShowSubtasktrashModal(false);
      setShowEditSubtaskModal(false);
      setShowOptions({});
      setShowSubtaskOptions({});
      setSelectedTaskIndex(null);
      setSelectedSubtaskIndex(null);
    }
  };

  const toggleOptions = (
    activityIndex,
    taskIndex,
    subtaskIndex,
    subsubtaskIndex
  ) => {
    setSelectedTaskIndex(taskIndex);
    setShowOptions((prevOptions) => ({
      ...prevOptions,
      [`${activityIndex}-${taskIndex}`]:
        !prevOptions[`${activityIndex}-${taskIndex}`],
    }));
  };

  const toggleSubtaskOptions = (activityIndex, taskIndex, subtaskIndex) => {
    setSelectedSubtaskIndex(subtaskIndex);
    setShowSubtaskOptions((prevOptions) => ({
      ...prevOptions,
      [`${activityIndex}-${taskIndex}-${subtaskIndex}`]:
        !prevOptions[`${activityIndex}-${taskIndex}-${subtaskIndex}`],
    }));
  };

  const handleInputChange = (event) => {
    const target = event.target;
    const value = target.type === "checkbox" ? target.checked : target.value;
    const name = target.name;

    setFormData({
      ...formData,
      [name]: value,
    });

    fetchActivitiesWithMilestone(value);
  };

  const fetchActivitiesWithMilestone = async (isMilestone) => {
    try {
      setLoading(true);
      let activityData = await apiService.getAllActivities(
        props.setSelectedProjectInfo.project_id,
        userInfo.access_token
      );
      const sortedResponse = activityData.sort((a, b) => {
        if (a.activity.createdAt > b.activity.createdAt) {
          return -1;
        }
      });

      const filteredActivities = sortedResponse.filter(
        (activity) => activity.activity.is_milestone === isMilestone
      );

      setActivities(filteredActivities);

      filteredActivities.length === 0
        ? setNoActivity("No Activity Found")
        : setNoActivity("loading ...");
      setLoading(false);
    } catch (error) {
      console.error("Error fetching activity:", error);
    }
  };

  const fetchAllActivities = async () => {
    try {
      setLoading(true);
      let activityData = await apiService.getAllActivities(
        props.setSelectedProjectInfo.project_id,
        userInfo.access_token
      );
      const sortedResponse = activityData.sort((a, b) => {
        if (a.activity.createdAt > b.activity.createdAt) {
          return -1;
        }
      });
      setActivities(sortedResponse);
      activities.length === 0
        ? setNoActivity("No Activity Found")
        : setNoActivity("loading ...");
      setLoading(false);
    } catch (error) {
      console.error("Error fetching activity:", error);
    }
  };

  const fetchActivities = async () => {
    try {
      setLoading(true);
      const activityData = await apiService.getAllActivities(
        props.setSelectedProjectInfo.project_id,
        userInfo.access_token
      );
      const sortedResponse = activityData.sort((a, b) => {
        if (a.activity.createdAt > b.activity.createdAt) {
          return -1;
        }
      });
      setActivities(sortedResponse);
      activities.length === 0
        ? setNoActivity("No Activity Found")
        : setNoActivity("loading ...");
      setLoading(false);
    } catch (error) {
      console.error("Error fetching activity:", error);
    }
  };

  const handlefetchSubTasks = async (task_id) => {
    try {
      const subTaskData = await apiService.getAllSubTasks(task_id);
      const sortedResponse = subTaskData.sort((a, b) => {
        if (a.createdAt > b.createdAt) {
          return -1;
        }
      });
      setSubTasks(sortedResponse);
    } catch (error) {
      console.error("Error fetching sub tasks:", error);
    }
  };

  const filteredRows =
    statusFilter === "All"
      ? activities
      : activities.filter(
          (row) => row.activity.activity_status === statusFilter
        );

  const search = filteredRows.filter(
    (row) =>
      row.activity.name &&
      row.activity.name
        .toLowerCase()
        .includes(searchTerm ? searchTerm.toLowerCase() : "")
  );

  const indexOfLastActivity = currentPage;
  const indexOfFirstActivity = indexOfLastActivity;
  const currentActivities = search.slice(currentPage);

  const handleFilterClick = (status) => {
    setStatusFilter(status);
    setCurrentPage();
  };

  const handleCommentOnSubtaskClick = (activity) => {
    setSelectedSubTaskId(activity.sub_task_id);
    setCommentSubModalOpen(true);
  };

  const handleViewCommentOnSubtaskClick = (activity) => {
    setSelectedSubTaskId(activity.sub_task_id);
    setViewCommentSubModalOpen(true);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Completed":
        return { color: "#10b981", bgColor: "#d1fae5" };
      case "On Progress":
      case "In Progress":
        return { color: "#f97316", bgColor: "#ffedd5" };
      case "Pending":
        return { color: "#9ca3af", bgColor: "#f3f4f6" };
      default:
        return { color: "#6b7280", bgColor: "#f3f4f6" };
    }
  };

  useEffect(() => {
    fetchActivities();
    async function fetchUsers() {
      localStorage.setItem("userInfo", JSON.stringify(userInfo));
    }
    async function fetchPermissions() {
      localStorage.setItem("permissions", JSON.stringify(permissions));
    }
    async function fetchProjectPermissions() {
      localStorage.setItem(
        "project_permissions",
        JSON.stringify(projectPermissions)
      );
    }

    fetchUsers();
    fetchProjectPermissions();
    fetchPermissions();

    const nonProjectRelatedRoles = userInfo.foundUser.Roles.filter(
      (role) => !role.project_related
    ).map((role) => role.name);

    const isDepartmentAdminRolePresent =
      nonProjectRelatedRoles.includes("Department Admin");

    const isClusterAdminRolePresent =
      nonProjectRelatedRoles.includes("Cluster Admin");
    const isOrganizationAdminRolePresent =
      nonProjectRelatedRoles.includes("Organization Admin");

    let selectedPermission;
    if (
      isClusterAdminRolePresent ||
      isDepartmentAdminRolePresent ||
      isOrganizationAdminRolePresent
    ) {
      selectedPermission = permissions;
    } else {
      selectedPermission = projectPermissions;
    }
    const COMMENT_ON_SUBTASK = selectedPermission.filter(
      (permission) => permission.name === PERMISSIONS.COMMENT_ON_SUBTASK
    );
    const VIEW_COMMENT_ON_SUBTASK = selectedPermission.filter(
      (permission) => permission.name === PERMISSIONS.VIEW_COMMENT_ON_SUBTASK
    );
    const CREATE_TASK = projectPermissions.filter(
      (permission) => permission.name === PERMISSIONS.CREATE_TASK
    );
    const UPDATE_TASK = projectPermissions.filter(
      (permission) => permission.name === PERMISSIONS.UPDATE_TASK
    );
    const DELETE_TASK = projectPermissions.filter(
      (permission) => permission.name === PERMISSIONS.DELETE_TASK
    );

    const CREATE_SUB_TASK = projectPermissions.filter(
      (permission) => permission.name === PERMISSIONS.CREATE_SUB_TASK
    );
    const UPDATE_SUB_TASK = projectPermissions.filter(
      (permission) => permission.name === PERMISSIONS.UPDATE_SUB_TASK
    );
    const DELETE_SUB_TASK = projectPermissions.filter(
      (permission) => permission.name === PERMISSIONS.DELETE_SUB_TASK
    );
    setCommentOnSubtask(COMMENT_ON_SUBTASK.length);
    setViewCommentOnSubtask(VIEW_COMMENT_ON_SUBTASK.length);

    setCreateTask(CREATE_TASK.length);
    setUpdateTask(UPDATE_TASK.length);
    setDeleteTask(DELETE_TASK.length);
    setCreateSubTask(CREATE_SUB_TASK.length);
    setUpdateSubTask(UPDATE_SUB_TASK.length);
    setDeleteSubTask(DELETE_SUB_TASK.length);
  }, [userInfo]);

  const handleSubtaskAssigneeClick = () => {
    setShowModal(true);
  };

  const calculateProjectProgress = () => {
    if (activities.length === 0) return 0;

    let totalWeight = 0;
    let completedWeight = 0;

    activities.forEach((activity) => {
      const activityWeight = 1;
      totalWeight += activityWeight;

      if (activity.activity.activity_status === "Completed") {
        completedWeight += activityWeight;
      } else {
        if (activity.tasks && activity.tasks.length > 0) {
          let taskTotalWeight = 0;
          let taskCompletedWeight = 0;

          activity.tasks.forEach((task) => {
            const taskWeight = 1;
            taskTotalWeight += taskWeight;

            if (task.task_status === "Completed") {
              taskCompletedWeight += taskWeight;
            } else {
              if (task.subTask && task.subTask.length > 0) {
                let subtaskTotalWeight = 0;
                let subtaskCompletedWeight = 0;

                task.subTask.forEach((subtask) => {
                  const subtaskWeight = 1;
                  subtaskTotalWeight += subtaskWeight;

                  if (subtask.subtask_status === "Completed") {
                    subtaskCompletedWeight += subtaskWeight;
                  } else if (subtask.subtask_status === "On Progress") {
                    subtaskCompletedWeight += subtaskWeight * 0.5;
                  }
                });

                if (subtaskTotalWeight > 0) {
                  taskCompletedWeight +=
                    (subtaskCompletedWeight / subtaskTotalWeight) * taskWeight;
                }
              } else {
                if (task.task_status === "On Progress") {
                  taskCompletedWeight += taskWeight * 0.5;
                }
              }
            }
          });

          if (taskTotalWeight > 0) {
            completedWeight +=
              (taskCompletedWeight / taskTotalWeight) * activityWeight;
          }
        } else {
          if (activity.activity.activity_status === "On Progress") {
            completedWeight += activityWeight * 0.5;
          }
        }
      }
    });

    return totalWeight > 0
      ? Math.round((completedWeight / totalWeight) * 100)
      : 0;
  };

  return (
    <Box className={classes.workspaceContainer}>
      <Helmet>
        <title>{props.setSelectedProjectInfo.name} - Workspace</title>
      </Helmet>
      <Backdrop
        sx={{ color: "#fff", zIndex: (theme) => theme.zIndex.drawer + 1 }}
        open={loading}
      >
        <PuffLoader color="#fff" />
      </Backdrop>

      {/* Project Header */}
      <Card className={classes.projectHeader}>
        <CardContent sx={{ position: "relative", zIndex: 1 }}>
          <Grid container spacing={3} alignItems="center">
            <Grid item xs={12} md={8}>
              <Breadcrumbs
                aria-label="breadcrumb"
                sx={{ color: "white", mb: 2 }}
              >
                <Link underline="hover" color="inherit" href="#">
                  Projects
                </Link>
                <Link underline="hover" color="inherit" href="#">
                  Workspace
                </Link>
                <Typography color="white" fontWeight={600}>
                  {props.setSelectedProjectInfo.name}
                </Typography>
              </Breadcrumbs>
              <Typography
                variant="h4"
                color="white"
                fontWeight={700}
                gutterBottom
              >
                {props.setSelectedProjectInfo.name}
              </Typography>
              <Typography
                variant="body1"
                color="white"
                sx={{ opacity: 0.9, mb: 3 }}
              >
                Project Management Workspace
              </Typography>

              <Box sx={{ display: "flex", gap: 3, flexWrap: "wrap" }}>
                <Box>
                  <Typography
                    variant="caption"
                    color="white"
                    sx={{ opacity: 0.8 }}
                  >
                    Total Activities
                  </Typography>
                  <Typography variant="h6" color="white" fontWeight={600}>
                    {activities.length}
                  </Typography>
                </Box>
                <Box>
                  <Typography
                    variant="caption"
                    color="white"
                    sx={{ opacity: 0.8 }}
                  >
                    Active Tasks
                  </Typography>
                  <Typography variant="h6" color="white" fontWeight={600}>
                    {tasks.length}
                  </Typography>
                </Box>
                <Box>
                  <Typography
                    variant="caption"
                    color="white"
                    sx={{ opacity: 0.8 }}
                  >
                    Progress
                  </Typography>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                    <Typography variant="h6" color="white" fontWeight={600}>
                      {calculateProjectProgress()}%
                    </Typography>
                    <Box sx={{ flex: 1, maxWidth: 200 }}>
                      <Box
                        sx={{
                          height: 8,
                          bgcolor: "#e2e8f0",
                          borderRadius: 4,
                          overflow: "hidden",
                        }}
                      >
                        <Box
                          sx={{
                            height: "100%",
                            bgcolor: "#10b981",
                            width: `${calculateProjectProgress()}%`,
                            transition: "width 0.3s ease",
                          }}
                        />
                      </Box>
                    </Box>
                  </Box>
                </Box>
              </Box>
            </Grid>
            <Grid item xs={12} md={4}>
              <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
                <Avatar
                  sx={{
                    width: 80,
                    height: 80,
                    fontSize: "2rem",
                    fontWeight: 700,
                    bgcolor: "rgba(255,255,255,0.2)",
                    backdropFilter: "blur(10px)",
                  }}
                >
                  {props.setSelectedProjectInfo.name.charAt(0).toUpperCase()}
                </Avatar>
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Controls Bar */}
      <Paper sx={{ mb: 4, p: 3, borderRadius: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              placeholder="Search activities, tasks, or subtasks..."
              variant="outlined"
              size="small"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
                sx: { borderRadius: 2 },
              }}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
              <Tabs
                value={statusFilter}
                onChange={(e, value) => handleFilterClick(value)}
                sx={{ minHeight: 40 }}
              >
                <Tab label="All" value="All" />
                <Tab label="Active" value="On Progress" />
                <Tab label="Completed" value="Completed" />
                <Tab label="Pending" value="Pending" />
              </Tabs>
            </Box>
          </Grid>
        </Grid>

        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mt: 2,
          }}
        >
          <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
            <Chip
              icon={<FilterListIcon />}
              label="Filters"
              variant="outlined"
              clickable
            />
            <Chip
              icon={<SortIcon />}
              label="Sort by Date"
              variant="outlined"
              clickable
            />
            <label className="flex items-center gap-2 cursor-pointer group">
              <input
                type="checkbox"
                id="is_milestone"
                name="is_milestone"
                checked={formData.is_milestone}
                onChange={handleInputChange}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <span className="text-sm text-gray-700 group-hover:text-gray-900">
                Milestones Only
              </span>
            </label>
          </Box>

          <button
            onClick={fetchAllActivities}
            className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors duration-200"
          >
            Refresh All
          </button>
        </Box>
      </Paper>

      {/* Activities List */}
      <Box>
        {activities.length !== 0 ? (
          currentActivities.map((activityItem, activityIndex) => (
            <Card
              key={`activity-${activityIndex}`}
              className={classes.activityCard}
            >
              <CardContent>
                <Grid container alignItems="center" spacing={2}>
                  <Grid item xs={12} md={9}>
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 2,
                        mb: 1,
                      }}
                    >
                      <IconButton
                        size="small"
                        onClick={() => toggleActivity(activityIndex)}
                        sx={{ mr: 1 }}
                      >
                        {expandedActivities.includes(activityIndex) ? (
                          <ExpandLessIcon />
                        ) : (
                          <ExpandMoreIcon />
                        )}
                      </IconButton>
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: 2,
                          cursor: "pointer",
                        }}
                        onClick={() =>
                          handleOpenDetailPopup("activity", activityItem)
                        }
                      >
                        <Typography variant="h6" fontWeight={600}>
                          {activityItem.activity.name}
                        </Typography>
                        {activityItem.activity.is_milestone === true && (
                          <Chip
                            icon={<FlagIcon />}
                            label="Milestone"
                            size="small"
                            className={classes.milestoneTag}
                          />
                        )}
                        <Chip
                          label={activityItem.activity.activity_status}
                          size="small"
                          sx={{
                            backgroundColor: getStatusColor(
                              activityItem.activity.activity_status
                            ).bgColor,
                            color: getStatusColor(
                              activityItem.activity.activity_status
                            ).color,
                            fontWeight: 600,
                          }}
                        />
                      </Box>
                    </Box>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ mb: 2, ml: 6 }}
                    >
                      {activityItem.tasks.length} tasks • Last updated:{" "}
                      {new Date(
                        activityItem.activity.updatedAt
                      ).toLocaleDateString()}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} md={3}>
                    {createTask !== 0 && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleAddTaskModal();
                          setSelectedActivity(activityItem);
                        }}
                        className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white text-sm font-medium rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-md hover:shadow-lg"
                      >
                        <AddCircleOutlineIcon style={{ fontSize: 18 }} />
                        Add Task
                      </button>
                    )}
                  </Grid>
                </Grid>

                {/* Tasks Section - Collapsible */}
                <Collapse in={expandedActivities.includes(activityIndex)}>
                  <Box sx={{ ml: 6 }}>
                    {activityItem.tasks.map((taskItem, taskIndex) => (
                      <Box key={`task-${activityIndex}-${taskIndex}`}>
                        <Card className={classes.taskCard} sx={{ mt: 2 }}>
                          <CardContent>
                            <Grid container spacing={2} alignItems="center">
                              <Grid item xs={12} md={8}>
                                <Box
                                  sx={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 2,
                                    mb: 1,
                                  }}
                                >
                                  <IconButton
                                    size="small"
                                    onClick={() =>
                                      toggleTask(activityIndex, taskIndex)
                                    }
                                  >
                                    {expandedTasks.includes(
                                      `${activityIndex}-${taskIndex}`
                                    ) ? (
                                      <ExpandLessIcon />
                                    ) : (
                                      <ExpandMoreIcon />
                                    )}
                                  </IconButton>
                                  <Box
                                    sx={{
                                      display: "flex",
                                      alignItems: "center",
                                      gap: 2,
                                      cursor: "pointer",
                                    }}
                                    onClick={() =>
                                      handleOpenDetailPopup("task", taskItem)
                                    }
                                  >
                                    <TaskAltIcon sx={{ color: "#3b82f6" }} />
                                    <Typography
                                      variant="subtitle1"
                                      fontWeight={600}
                                    >
                                      {taskItem.name}
                                    </Typography>
                                    {taskItem.is_milestone === true && (
                                      <Chip
                                        label="Milestone"
                                        size="small"
                                        sx={{
                                          bgcolor: "#f3e8ff",
                                          color: "#7c3aed",
                                        }}
                                      />
                                    )}
                                  </Box>
                                </Box>

                                <Box
                                  sx={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 3,
                                    flexWrap: "wrap",
                                    ml: 6,
                                  }}
                                >
                                  <Box
                                    sx={{
                                      display: "flex",
                                      alignItems: "center",
                                      gap: 1,
                                    }}
                                  >
                                    <CalendarTodayIcon
                                      fontSize="small"
                                      sx={{ color: "#6b7280" }}
                                    />
                                    <Typography
                                      variant="caption"
                                      color="text.secondary"
                                    >
                                      {new Date(
                                        taskItem.start_date
                                      ).toLocaleDateString()}{" "}
                                      -{" "}
                                      {new Date(
                                        taskItem.end_date
                                      ).toLocaleDateString()}
                                    </Typography>
                                  </Box>

                                  <Box
                                    sx={{
                                      display: "flex",
                                      alignItems: "center",
                                      gap: 1,
                                    }}
                                  >
                                    <GroupIcon
                                      fontSize="small"
                                      sx={{ color: "#6b7280" }}
                                    />
                                    <AvatarGroup
                                      max={3}
                                      sx={{
                                        "& .MuiAvatar-root": {
                                          width: 24,
                                          height: 24,
                                          fontSize: 12,
                                        },
                                      }}
                                    >
                                      {taskItem.members.map((member, idx) => (
                                        <Avatar
                                          key={idx}
                                          alt={member.UserInfo.full_name}
                                          src={member.avatar}
                                        />
                                      ))}
                                    </AvatarGroup>
                                  </Box>
                                </Box>
                              </Grid>

                              <Grid item xs={12} md={4}>
                                <Box
                                  sx={{
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "space-between",
                                  }}
                                >
                                  <Chip
                                    label={taskItem.task_status}
                                    size="small"
                                    sx={{
                                      backgroundColor: getStatusColor(
                                        taskItem.task_status
                                      ).bgColor,
                                      color: getStatusColor(
                                        taskItem.task_status
                                      ).color,
                                      fontWeight: 600,
                                    }}
                                  />

                                  <Box sx={{ display: "flex", gap: 1 }}>
                                    {(updateTask !== 0 || deleteTask !== 0) && (
                                      <>
                                        {updateTask !== 0 && (
                                          <IconButton
                                            size="small"
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              toggleEditMajorTaskModal(
                                                taskIndex
                                              );
                                              setSelectedTask(taskItem);
                                            }}
                                            sx={{ color: "#10b981" }}
                                          >
                                            <FaEdit size={16} />
                                          </IconButton>
                                        )}
                                        {deleteTask !== 0 && (
                                          <IconButton
                                            size="small"
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              toggleMajorTaskTrashModal(
                                                taskIndex
                                              );
                                              setSelectedTask(taskItem);
                                            }}
                                            sx={{ color: "#ef4444" }}
                                          >
                                            <FaTrash size={16} />
                                          </IconButton>
                                        )}
                                      </>
                                    )}
                                  </Box>
                                </Box>
                              </Grid>
                            </Grid>

                            {/* Subtasks Section - Collapsible */}
                            <Collapse
                              in={expandedTasks.includes(
                                `${activityIndex}-${taskIndex}`
                              )}
                            >
                              <Box sx={{ mt: 2 }}>
                                {taskItem.subTask.map(
                                  (subtaskItem, subtaskIndex) => (
                                    <Card
                                      key={`subtask-${activityIndex}-${taskIndex}-${subtaskIndex}`}
                                      className={classes.subtaskCard}
                                      sx={{ mt: 1, ml: 4 }}
                                    >
                                      <CardContent>
                                        <Grid
                                          container
                                          spacing={2}
                                          alignItems="center"
                                        >
                                          <Grid item xs={12} md={6}>
                                            <Box
                                              sx={{
                                                display: "flex",
                                                alignItems: "center",
                                                gap: 2,
                                              }}
                                            >
                                              <IconButton
                                                size="small"
                                                onClick={() =>
                                                  toggleSubtask(
                                                    activityIndex,
                                                    taskIndex,
                                                    subtaskIndex
                                                  )
                                                }
                                              >
                                                {expandedSubtasks.includes(
                                                  `${activityIndex}-${taskIndex}-${subtaskIndex}`
                                                ) ? (
                                                  <ExpandLessIcon />
                                                ) : (
                                                  <ExpandMoreIcon />
                                                )}
                                              </IconButton>
                                              <Box
                                                sx={{
                                                  display: "flex",
                                                  alignItems: "center",
                                                  gap: 2,
                                                  cursor: "pointer",
                                                }}
                                                onClick={() =>
                                                  handleOpenDetailPopup(
                                                    "subtask",
                                                    subtaskItem
                                                  )
                                                }
                                              >
                                                <ListAltIcon
                                                  sx={{ color: "#10b981" }}
                                                />
                                                <Box>
                                                  <Typography
                                                    variant="body2"
                                                    fontWeight={500}
                                                  >
                                                    {subtaskItem.name}
                                                  </Typography>
                                                  <Typography
                                                    variant="caption"
                                                    color="text.secondary"
                                                  >
                                                    {new Date(
                                                      subtaskItem.start_date
                                                    ).toLocaleDateString()}{" "}
                                                    -{" "}
                                                    {new Date(
                                                      subtaskItem.end_date
                                                    ).toLocaleDateString()}
                                                  </Typography>
                                                </Box>
                                              </Box>
                                            </Box>
                                          </Grid>

                                          <Grid item xs={12} md={6}>
                                            <Grid
                                              container
                                              spacing={1}
                                              alignItems="center"
                                              justifyContent="flex-end"
                                            >
                                              <Grid item>
                                                <Box
                                                  sx={{
                                                    display: "flex",
                                                    gap: 1,
                                                  }}
                                                >
                                                  {viewCommentOnSubtask !==
                                                    0 && (
                                                    <Tooltip title="View comments">
                                                      <IconButton
                                                        size="small"
                                                        onClick={() => {
                                                          handleViewCommentOnSubtaskClick(
                                                            subtaskItem
                                                          );
                                                          setSelectedSubTask(
                                                            subtaskItem
                                                          );
                                                        }}
                                                      >
                                                        <Badge
                                                          badgeContent={
                                                            subtaskItem.Coments
                                                              ? subtaskItem.Coments.filter(
                                                                  (c) =>
                                                                    !c.parent_comment_id
                                                                ).length
                                                              : 0
                                                          }
                                                          color="info"
                                                          size="small"
                                                        >
                                                          <CommentIcon fontSize="small" />
                                                        </Badge>
                                                      </IconButton>
                                                    </Tooltip>
                                                  )}
                                                  {/* {commentOnSubtask !== 0 && (
                                                    <Tooltip title="Add comment">
                                                      <IconButton
                                                        size="small"
                                                        onClick={() => {
                                                          handleCommentOnSubtaskClick(
                                                            subtaskItem
                                                          );
                                                          setSelectedSubTask(
                                                            subtaskItem
                                                          );
                                                        }}
                                                      >
                                                        <AddCommentIcon fontSize="small" />
                                                      </IconButton>
                                                    </Tooltip>
                                                  )} */}
                                                </Box>
                                              </Grid>

                                              <Grid item>
                                                {taskItem.members.some(
                                                  (member) =>
                                                    member.user_id ===
                                                    userInfo.foundUser.user_id
                                                ) ? (
                                                  <FormControl
                                                    size="small"
                                                    sx={{ minWidth: 120 }}
                                                  >
                                                    <Select
                                                      value={
                                                        subtaskItem.subtask_status
                                                      }
                                                      onChange={handleChange(
                                                        subtaskItem
                                                      )}
                                                      sx={{
                                                        borderRadius: 2,
                                                        backgroundColor:
                                                          getStatusColor(
                                                            subtaskItem.subtask_status
                                                          ).bgColor,
                                                        color: getStatusColor(
                                                          subtaskItem.subtask_status
                                                        ).color,
                                                        fontWeight: 500,
                                                      }}
                                                    >
                                                      {statusOptions.map(
                                                        (option) => (
                                                          <MenuItem
                                                            key={option.value}
                                                            value={option.value}
                                                          >
                                                            {option.label}
                                                          </MenuItem>
                                                        )
                                                      )}
                                                    </Select>
                                                  </FormControl>
                                                ) : (
                                                  <Chip
                                                    label={
                                                      subtaskItem.subtask_status
                                                    }
                                                    size="small"
                                                    sx={{
                                                      backgroundColor:
                                                        getStatusColor(
                                                          subtaskItem.subtask_status
                                                        ).bgColor,
                                                      color: getStatusColor(
                                                        subtaskItem.subtask_status
                                                      ).color,
                                                      fontWeight: 600,
                                                    }}
                                                  />
                                                )}
                                              </Grid>

                                              {subtaskItem.members.some(
                                                (member) =>
                                                  member.user_id ===
                                                  userInfo.foundUser.user_id
                                              ) && (
                                                <Grid item>
                                                  <Box
                                                    sx={{
                                                      display: "flex",
                                                      gap: 0.5,
                                                    }}
                                                  >
                                                    {updateSubTask !== 0 && (
                                                      <IconButton
                                                        size="small"
                                                        onClick={(e) => {
                                                          e.stopPropagation();
                                                          toggleEditSubtaskModal(
                                                            subtaskIndex
                                                          );
                                                          setSelectedSubTask(
                                                            subtaskItem
                                                          );
                                                        }}
                                                        sx={{
                                                          color: "#10b981",
                                                        }}
                                                      >
                                                        <FaEdit size={14} />
                                                      </IconButton>
                                                    )}
                                                    {deleteSubTask !== 0 && (
                                                      <IconButton
                                                        size="small"
                                                        onClick={(e) => {
                                                          e.stopPropagation();
                                                          setShowSubtasktrashModal(
                                                            true
                                                          );
                                                          setSelectedSubTask(
                                                            subtaskItem
                                                          );
                                                        }}
                                                        sx={{
                                                          color: "#ef4444",
                                                        }}
                                                      >
                                                        <FaTrash size={14} />
                                                      </IconButton>
                                                    )}
                                                  </Box>
                                                </Grid>
                                              )}
                                            </Grid>
                                          </Grid>
                                        </Grid>

                                        {/* Subtask Details (optional additional info) */}
                                        <Collapse
                                          in={expandedSubtasks.includes(
                                            `${activityIndex}-${taskIndex}-${subtaskIndex}`
                                          )}
                                        >
                                          <Box
                                            sx={{
                                              mt: 2,
                                              ml: 6,
                                              p: 2,
                                              bgcolor: "white",
                                              borderRadius: 1,
                                            }}
                                          >
                                            {/* Task Information */}
                                            {/* Task Information - Enhanced */}
                                            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-5 border border-blue-200 shadow-sm">
                                              <div className="flex items-center justify-between mb-4">
                                                <div className="flex items-center space-x-3">
                                                  <div className="p-2 bg-blue-100 rounded-lg">
                                                    <svg
                                                      className="w-6 h-6 text-blue-600"
                                                      fill="none"
                                                      stroke="currentColor"
                                                      viewBox="0 0 24 24"
                                                    >
                                                      <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        strokeWidth={2}
                                                        d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                                                      />
                                                    </svg>
                                                  </div>
                                                  <div>
                                                    <h3 className="text-sm font-semibold text-blue-900">
                                                      Subtask Information
                                                    </h3>
                                                    <p className="text-xs text-blue-600">
                                                      Task details and assigned
                                                      members
                                                    </p>
                                                  </div>
                                                </div>
                                                <div className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                                                  ID:{" "}
                                                  {subtaskItem.task_id?.slice(
                                                    0,
                                                    6
                                                  )}
                                                  ...
                                                </div>
                                              </div>

                                              <div className="space-y-4">
                                                {/* Task Details Grid */}
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                  {/* Task Basic Info */}
                                                  <div className="space-y-3">
                                                    <div>
                                                      <div className="text-xs font-medium text-blue-700 mb-1">
                                                        Sub Task Name
                                                      </div>
                                                      <div className="flex items-center  px-3 py-2 rounded-lg ">
                                                        <svg
                                                          className="w-4 h-4 text-blue-500 mr-2"
                                                          fill="none"
                                                          stroke="currentColor"
                                                          viewBox="0 0 24 24"
                                                        >
                                                          <path
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round"
                                                            strokeWidth={2}
                                                            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                                                          />
                                                        </svg>
                                                        <span className="font-medium text-gray-800 truncate">
                                                          {subtaskItem.name}
                                                        </span>
                                                      </div>
                                                    </div>

                                                    <div>
                                                      <div className="text-xs font-medium text-blue-700 mb-1">
                                                        Sub Task Timeline
                                                      </div>
                                                      <div className="flex items-center space-x-4">
                                                        <div className="flex-1  px-3 py-2 rounded-lg ">
                                                          <div className="text-xs text-gray-500">
                                                            Start
                                                          </div>
                                                          <div className="font-medium text-sm text-gray-800">
                                                            {new Date(
                                                              subtaskItem.start_date
                                                            ).toLocaleDateString(
                                                              "en-US",
                                                              {
                                                                day: "numeric",
                                                                month: "short",
                                                                year: "numeric",
                                                              }
                                                            )}
                                                          </div>
                                                        </div>
                                                        <div className="flex-1  px-3 py-2 rounded-lg ">
                                                          <div className="text-xs text-gray-500">
                                                            End
                                                          </div>
                                                          <div className="font-medium text-sm text-gray-800">
                                                            {new Date(
                                                              subtaskItem.end_date
                                                            ).toLocaleDateString(
                                                              "en-US",
                                                              {
                                                                day: "numeric",
                                                                month: "short",
                                                                year: "numeric",
                                                              }
                                                            )}
                                                          </div>
                                                        </div>
                                                      </div>
                                                    </div>
                                                  </div>

                                                  {/* Status & Members Preview */}
                                                  <div className="space-y-3">
                                                    <div>
                                                      <div className="text-xs font-medium text-blue-700 mb-1">
                                                        Status
                                                      </div>
                                                      <div className="flex items-center  px-3 py-2 rounded-lg  ">
                                                        <div
                                                          className={`w-2 h-2 rounded-full mr-2 ${
                                                            subtaskItem.subtask_status ===
                                                            "Completed"
                                                              ? "bg-green-500"
                                                              : subtaskItem.subtask_status ===
                                                                "In Progress"
                                                              ? "bg-blue-500"
                                                              : "bg-yellow-500"
                                                          }`}
                                                        />
                                                        <span
                                                          className={`font-medium text-sm ${
                                                            subtaskItem.subtask_status ===
                                                            "Completed"
                                                              ? "text-green-700"
                                                              : subtaskItem.subtask_status ===
                                                                "In Progress"
                                                              ? "text-blue-700"
                                                              : "text-yellow-700"
                                                          }`}
                                                        >
                                                          {
                                                            subtaskItem.subtask_status
                                                          }
                                                        </span>
                                                      </div>
                                                    </div>

                                                    <div>
                                                      <div className="text-xs font-medium text-blue-700 mb-1">
                                                        Assigned Members
                                                      </div>
                                                      <div className=" rounded-lg  p-3">
                                                        {subtaskItem.members &&
                                                        subtaskItem.members
                                                          .length > 0 ? (
                                                          <div className="flex flex-wrap gap-2">
                                                            {subtaskItem.members
                                                              .slice(0, 3)
                                                              .map(
                                                                (
                                                                  member,
                                                                  index
                                                                ) => (
                                                                  <div
                                                                    key={index}
                                                                    className="flex items-center space-x-2 bg-blue-50 px-3 py-1.5 rounded-lg"
                                                                  >
                                                                    <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 text-xs font-semibold">
                                                                      {member.UserInfo?.full_name?.charAt(
                                                                        0
                                                                      ) || "U"}
                                                                    </div>
                                                                    <span className="text-sm font-medium text-gray-700 truncate max-w-[100px]">
                                                                      {member
                                                                        .UserInfo
                                                                        ?.full_name ||
                                                                        "Unnamed"}
                                                                    </span>
                                                                  </div>
                                                                )
                                                              )}
                                                            {subtaskItem.members
                                                              .length > 3 && (
                                                              <div className="flex items-center space-x-2 bg-blue-50 px-3 py-1.5 rounded-lg">
                                                                <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 text-xs font-semibold">
                                                                  +
                                                                  {subtaskItem
                                                                    .members
                                                                    .length - 3}
                                                                </div>
                                                                <span className="text-sm font-medium text-blue-600">
                                                                  {subtaskItem
                                                                    .members
                                                                    .length -
                                                                    3}{" "}
                                                                  more
                                                                </span>
                                                              </div>
                                                            )}
                                                          </div>
                                                        ) : (
                                                          <div className="flex items-center justify-center py-3">
                                                            <div className="text-center">
                                                              <svg
                                                                className="w-8 h-8 text-gray-300 mx-auto mb-2"
                                                                fill="none"
                                                                stroke="currentColor"
                                                                viewBox="0 0 24 24"
                                                              >
                                                                <path
                                                                  strokeLinecap="round"
                                                                  strokeLinejoin="round"
                                                                  strokeWidth={
                                                                    1.5
                                                                  }
                                                                  d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
                                                                />
                                                              </svg>
                                                              <p className="text-xs text-gray-500">
                                                                No members
                                                                assigned
                                                              </p>
                                                            </div>
                                                          </div>
                                                        )}
                                                      </div>
                                                    </div>
                                                  </div>
                                                </div>

                                                {/* Progress Bar (Mobile & Desktop) */}
                                                <div className="pt-2 border-t border-blue-100">
                                                  <div className="flex items-center justify-between mb-1">
                                                    <span className="text-xs font-medium text-blue-700">
                                                      Progress
                                                    </span>
                                                    <span className="text-xs text-gray-500">
                                                      {(() => {
                                                        const start = new Date(
                                                          selectedTask.start_date
                                                        );
                                                        const end = new Date(
                                                          selectedTask.end_date
                                                        );
                                                        const today =
                                                          new Date();
                                                        const diffDays =
                                                          Math.ceil(
                                                            (end - today) /
                                                              (1000 *
                                                                60 *
                                                                60 *
                                                                24)
                                                          );
                                                        return diffDays > 0
                                                          ? `${diffDays} days left`
                                                          : "Overdue";
                                                      })()}
                                                    </span>
                                                  </div>
                                                  <div className="w-full bg-gray-200 rounded-full h-2">
                                                    <div
                                                      className={`h-2 rounded-full ${
                                                        selectedTask.task_status ===
                                                        "Completed"
                                                          ? "bg-green-500"
                                                          : selectedTask.task_status ===
                                                            "In Progress"
                                                          ? "bg-blue-500"
                                                          : "bg-yellow-500"
                                                      }`}
                                                      style={{
                                                        width: `${(() => {
                                                          const start =
                                                            new Date(
                                                              selectedTask.start_date
                                                            );
                                                          const end = new Date(
                                                            selectedTask.end_date
                                                          );
                                                          const today =
                                                            new Date();
                                                          const total =
                                                            end - start;
                                                          const progress =
                                                            today - start;
                                                          const percentage =
                                                            Math.min(
                                                              Math.max(
                                                                (progress /
                                                                  total) *
                                                                  100,
                                                                0
                                                              ),
                                                              100
                                                            );
                                                          return Math.round(
                                                            percentage
                                                          );
                                                        })()}%`,
                                                      }}
                                                    />
                                                  </div>
                                                </div>
                                              </div>
                                            </div>
                                          </Box>
                                        </Collapse>
                                      </CardContent>
                                    </Card>
                                  )
                                )}

                                {createSubTask !== 0 &&
                                  taskItem.members.some(
                                    (member) =>
                                      member.user_id ===
                                      userInfo.foundUser.user_id
                                  ) && (
                                    <Box sx={{ mt: 2, ml: 4 }}>
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          toggleAddSubTaskModal();
                                          setSelectedTask(taskItem);
                                        }}
                                        className="flex items-center gap-2 px-3 py-1.5 text-blue-600 hover:text-blue-800 text-sm font-medium hover:bg-blue-50 rounded-lg transition-colors duration-200"
                                      >
                                        <AddCircleOutlineIcon
                                          style={{ fontSize: 16 }}
                                        />
                                        Add Subtask
                                      </button>
                                    </Box>
                                  )}
                              </Box>
                            </Collapse>
                          </CardContent>
                        </Card>
                      </Box>
                    ))}
                  </Box>
                </Collapse>
              </CardContent>
            </Card>
          ))
        ) : (
          <Box sx={{ textAlign: "center", py: 8 }}>
            <Typography variant="h6" color="text.secondary" gutterBottom>
              {noActivity || "No activities found"}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Create your first activity to get started
            </Typography>
          </Box>
        )}
      </Box>

      {/* Floating Action Button */}
      <SpeedDial
        ariaLabel="Quick Actions"
        sx={{ position: "fixed", bottom: 32, right: 32 }}
        icon={<SpeedDialIcon />}
        FabProps={{
          sx: {
            backgroundColor: "#0A4F76 !important",
            "&:hover": {
              backgroundColor: "#0A3D5C !important",
            },
          },
        }}
      >
        {createTask !== 0 && (
          <SpeedDialAction
            icon={<AddCircleOutlineIcon />}
            tooltipTitle="Add Task"
            onClick={() => {
              if (activities.length > 0) {
                toggleAddTaskModal();
                setSelectedActivity(activities[0]);
              }
            }}
          />
        )}
        <SpeedDialAction
          icon={<SearchIcon />}
          tooltipTitle="Search"
          onClick={() =>
            document.querySelector('input[placeholder*="Search"]').focus()
          }
        />
        <SpeedDialAction
          icon={<FilterListIcon />}
          tooltipTitle="Filter"
          onClick={() => handleFilterClick("All")}
        />
      </SpeedDial>

      {/* Detail Popup */}
      <DetailPopup
        open={detailPopup.open}
        onClose={handleCloseDetailPopup}
        type={detailPopup.type}
        data={detailPopup.data}
        userInfo={userInfo}
      />

      {/* Keep all existing modal components */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div
            ref={modalRef}
            className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden"
          >
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-bold text-gray-900">
                  Assign Team Members
                </h3>
                <button
                  onClick={toggleModal}
                  className="text-gray-400 hover:text-gray-600 transition-colors duration-200"
                >
                  <span className="text-2xl">×</span>
                </button>
              </div>
              <WorkspaceAssignMember />
            </div>
          </div>
        </div>
      )}

      {/* Keep all other modal components exactly as they were with the same logic */}
      {showEditMajorTaskModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div
            ref={modalRef}
            className="bg-white rounded-2xl shadow-2xl w-11/12 lg:w-2/3 max-h-[90vh] overflow-hidden mx-4"
          >
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-semibold text-gray-900"></h3>
                <button
                  onClick={toggleEditMajorTaskModal}
                  className="text-gray-400 hover:text-gray-600 text-2xl"
                >
                  ×
                </button>
              </div>
              <div className="overflow-y-auto max-h-[calc(90vh-80px)]">
                <WorkspaceEditMajorTask
                  selectedTask={selectedTask}
                  selectedActivity={selectedActivity}
                  selectedProject={props.setSelectedProjectInfo}
                  handlefetchActivity={fetchActivities}
                  handleCloseModal={handleEditTaskModalClose}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {showEditSubtaskModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div
            ref={modalRef}
            className="bg-white rounded-2xl shadow-2xl w-11/12 lg:w-2/3 max-h-[90vh] overflow-hidden mx-4"
          >
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-semibold text-gray-900">
                  Edit Subtask
                </h3>
                <button
                  onClick={toggleEditSubtaskModal}
                  className="text-gray-400 hover:text-gray-600 text-2xl"
                >
                  ×
                </button>
              </div>
              <div className="overflow-y-auto max-h-[calc(90vh-80px)]">
                <WorkspaceEditSubtask
                  selectedTask={selectedSubTask}
                  selectedActivity={selectedActivity}
                  selectedProject={props.setSelectedProjectInfo}
                  handlefetchSubTask={fetchActivities}
                  handleCloseModal={handleEditSubTaskModalClose}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {showAddTaskModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div
            ref={modalRef}
            className="bg-white rounded-2xl shadow-2xl w-11/12 lg:w-2/3 max-h-[90vh] overflow-hidden mx-4"
          >
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-semibold text-gray-900"></h3>
                <button
                  onClick={toggleAddTaskModal}
                  className="text-gray-400 hover:text-gray-600 text-2xl"
                >
                  ×
                </button>
              </div>
              <div className="overflow-y-auto max-h-[calc(90vh-80px)]">
                <WorkspaceAddMajorTask
                  selectedActivity={selectedActivity}
                  selectedProject={props.setSelectedProjectInfo}
                  handlefetchTask={fetchActivities}
                  handleCloseModal={handleAddTaskModalClose}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {showAddSubTaskModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div
            ref={modalRef}
            className="bg-white rounded-2xl shadow-2xl w-11/12 lg:w-2/3 max-h-[90vh] overflow-hidden mx-4"
          >
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-semibold text-gray-900">
                  Add New Subtask
                </h3>
                <button
                  onClick={toggleAddSubTaskModal}
                  className="text-gray-400 hover:text-gray-600 text-2xl"
                >
                  ×
                </button>
              </div>
              <div className="overflow-y-auto max-h-[calc(90vh-80px)]">
                <WorkspaceAddSubTask
                  selectedTask={selectedTask}
                  selectedProject={props.setSelectedProjectInfo}
                  handlefetchSubTask={fetchActivities}
                  handleCloseModal={handleAddSubModalClose}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {commentSubModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="p-6">
            <Subtaskcomment
              handlefetchActivity={fetchActivities}
              subtaskId={selectedSubTask?.sub_task_id}
              handleCloseModal={handleCommentModalClose}
            />
          </div>
        </div>
      )}

      {viewCommentSubModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-10">
          <div
            className="bg-white rounded-xl w-11/12 md:w-3/4 lg:w-2/3 max-w-6xl max-h-[90vh]"
            ref={modalRef}
          >
            <Subtaskcommentview
              handlefetchActivity={fetchActivities}
              subtaskId={selectedSubTask?.sub_task_id}
              handleCloseModal={handleViewCommentModalClose}
              userId={userInfo?.foundUser?.user_id}
              selectedTask={selectedTask}
              userPermissions={{
                canAddComment: commentOnSubtask !== 0,
                canEditOwnComments: true,
                canDeleteOwnComments: true,
                canPinComments: true,
                canViewPrivateComments:
                  userInfo?.foundUser?.role === "admin" ||
                  userInfo?.foundUser?.role === "manager",
              }}
            />
          </div>
        </div>
      )}

      {showMajorTaskTrashModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div
            ref={modalRef}
            className="bg-white rounded-xl shadow-2xl w-full max-w-2xl"
          >
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-semibold text-gray-900">
                  Delete Task
                </h3>
                <button
                  onClick={toggleMajorTaskTrashModal}
                  className="text-gray-400 hover:text-gray-600 text-2xl"
                >
                  ×
                </button>
              </div>
              <WorkspaceTaskTrash
                selectedRow={selectedTask}
                handleDeleteModalClose={toggleMajorTaskTrashModal}
                handlefetchActivity={fetchActivities}
              />
            </div>
          </div>
        </div>
      )}

      {showSubtasktrashModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div
            ref={modalRef}
            className="bg-white rounded-xl shadow-2xl w-full max-w-2xl"
          >
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-semibold text-gray-900">
                  Delete Subtask
                </h3>
                <button
                  onClick={toggleSubtasktrashModal}
                  className="text-gray-400 hover:text-gray-600 text-2xl"
                >
                  ×
                </button>
              </div>
              <WorkspaceSubtasktrash
                selectedRow={selectedSubTask}
                handleDeleteModalClose={toggleSubtasktrashModal}
                handlefetchActivity={fetchActivities}
              />
            </div>
          </div>
        </div>
      )}
    </Box>
  );
};

export default Workspace;
