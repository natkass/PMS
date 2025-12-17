import {
  Grid,
  InputAdornment,
  Paper,
  TextField,
  Typography,
  Box,
  Container,
  Card,
  CardContent,
  Chip,
  LinearProgress,
  alpha,
  useTheme,
} from "@mui/material";
import Backdrop from "@mui/material/Backdrop";
import { BarChart } from "@mui/x-charts/BarChart";
import React, { useEffect, useState, useRef } from "react";
import { Helmet } from "react-helmet-async";
import ClipLoader from "react-spinners/ClipLoader";
import apiService from "../services/apiServices";
import "./Home.css";

// Icons
import TaskIcon from "@mui/icons-material/Checklist";
import ActivityIcon from "@mui/icons-material/ListAlt";
import SubTaskIcon from "@mui/icons-material/Splitscreen";
import SearchIcon from "@mui/icons-material/Search";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import ScheduleIcon from "@mui/icons-material/Schedule";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import PieChartIcon from "@mui/icons-material/PieChart";
import TimelineIcon from "@mui/icons-material/Timeline";

// Charts
import { PieChart } from "@mui/x-charts/PieChart";
import { styled } from "@mui/material/styles";

// Export Components
import ExportControls from "./dashboard/ExportControls";
import {
  exportToPDF,
  exportToExcel,
  exportToCSV,
  prepareProjectDashboardData,
  prepareTasksData,
} from "../utils/exportUtils";

// Styled Components
const StatCard = styled(Card)(({ theme }) => ({
  borderRadius: 16,
  boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
  transition: "all 0.3s ease-in-out",
  "&:hover": {
    transform: "translateY(-4px)",
    boxShadow: "0 8px 32px rgba(0,0,0,0.12)",
  },
  position: "relative",
  overflow: "hidden",
  "&::before": {
    content: '""',
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 4,
    background: "linear-gradient(90deg, #3b82f6, #8b5cf6)",
  },
}));

const ProgressBar = styled(LinearProgress)(({ theme, value }) => ({
  height: 8,
  borderRadius: 4,
  backgroundColor: theme.palette.grey[200],
  "& .MuiLinearProgress-bar": {
    borderRadius: 4,
    background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
  },
}));

const Dashboard = (props) => {
  const theme = useTheme();
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [loading, setLoading] = useState(false);
  const [userInfo] = useState(() => {
    return JSON.parse(localStorage.getItem("userInfo")) || [];
  });
  const [activities, setActivities] = useState([]);
  const [activityLength, setActivityLength] = useState(0);
  const [tasks, setTasks] = useState([]);
  const [totalTasks, setTotalTasks] = useState(0);
  const [totalSubTasks, setTotalSubTasks] = useState(0);
  const [completedTasks, setCompletedTasks] = useState([]);
  const [onProgressTasks, setOnProgressTasks] = useState([]);
  const [pendingTask, setPendingTasks] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  // Refs for export
  const dashboardRef = useRef(null);
  const taskOverviewRef = useRef(null);
  const milestoneChartRef = useRef(null);
  const distributionChartRef = useRef(null);
  const statsCardsRef = useRef(null);

  const fetchActivities = async () => {
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
        return 1;
      });

      const milestoneActivities = sortedResponse.filter(
        (activity) => activity.activity.is_milestone === true
      );
      setActivities(milestoneActivities);

      let all_tasks = [];
      for (const activity of sortedResponse) {
        const task = activity.tasks;
        if (task.length === 0) {
          continue;
        }
        all_tasks.push(...task);
      }

      setTasks(all_tasks);
      const completed_task = all_tasks.filter(
        (data) => data.task_status === "Completed"
      );
      setCompletedTasks(completed_task);

      const on_progress_task = all_tasks.filter(
        (data) => data.task_status === "On Progress"
      );
      setOnProgressTasks(on_progress_task);

      const pending_task = all_tasks.filter(
        (data) => data.task_status === "Pending"
      );
      setPendingTasks(pending_task);

      setActivityLength(sortedResponse.length);
      setTotalTasks(
        sortedResponse.reduce((n, { Tasklength }) => n + Tasklength, 0)
      );
      setTotalSubTasks(
        sortedResponse.reduce(
          (n, { sub_tasks_length }) => n + sub_tasks_length,
          0
        )
      );
      setLoading(false);
    } catch (error) {
      console.error("Error fetching activity:", error);
      setLoading(false);
    }
  };

  const calculateProgress = (startDate, endDate) => {
    const currentDate = new Date();
    const totalDuration = new Date(endDate) - new Date(startDate);
    const elapsedDuration = currentDate - new Date(startDate);
    const progress = Math.min(
      Math.max((elapsedDuration / totalDuration) * 100, 0),
      100
    );
    return progress;
  };

  const getProgressColor = (progress, taskStatus) => {
    if (taskStatus === "Completed") {
      return theme.palette.success.main;
    } else if (progress < 75) {
      return theme.palette.warning.main;
    } else if (progress <= 100 && taskStatus !== "Completed") {
      return theme.palette.error.main;
    } else {
      return theme.palette.info.main;
    }
  };

  const getStatusChipProps = (status) => {
    switch (status) {
      case "Completed":
        return { color: "success", icon: <CheckCircleIcon fontSize="small" /> };
      case "On Progress":
        return { color: "warning", icon: <ScheduleIcon fontSize="small" /> };
      case "Pending":
        return { color: "info", icon: <ScheduleIcon fontSize="small" /> };
      default:
        return { color: "default", icon: null };
    }
  };

  const getInitialsColor = (char) => {
    const colors = [
      theme.palette.primary.main,
      theme.palette.secondary.main,
      theme.palette.success.main,
      theme.palette.warning.main,
      theme.palette.error.main,
      theme.palette.info.main,
    ];
    const index = char.toLowerCase().charCodeAt(0) % colors.length;
    return colors[index];
  };

  const search = tasks.filter(
    (task) =>
      task.name && task.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const indexOfLastItem = currentPage * rowsPerPage;
  const indexOfFirstItem = indexOfLastItem - rowsPerPage;
  const currentItems = search.slice(indexOfFirstItem, indexOfLastItem);
  const pageCount = Math.ceil(search.length / rowsPerPage);

  useEffect(() => {
    fetchActivities();
  }, [props.setSelectedProjectInfo.project_id]);

  const handlePageChange = (event, value) => {
    setCurrentPage(value);
  };

  const handleRowsPerPageChange = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setCurrentPage(1);
  };

  const chartData = [
    {
      label: "Completed",
      value: completedTasks.length,
      color: theme.palette.success.main,
    },
    {
      label: "In Progress",
      value: onProgressTasks.length,
      color: theme.palette.warning.main,
    },
    {
      label: "Pending",
      value: pendingTask.length,
      color: theme.palette.info.main,
    },
  ];

  const barChartData = activities.map((data) => {
    const progress = calculateProgress(
      data.activity.start_date,
      data.activity.end_date
    );
    return {
      name: data.activity.name,
      progress: parseInt(progress),
      color: getProgressColor(progress, data.activity.status || "Pending"),
    };
  });

  // Prepare data for exports
  const dashboardStats = {
    activityLength,
    totalTasks,
    totalSubTasks,
    completedTasks: completedTasks.length,
    onProgressTasks: onProgressTasks.length,
    pendingTasks: pendingTask.length,
    completionRate:
      totalTasks > 0
        ? Math.round((completedTasks.length / totalTasks) * 100)
        : 0,
  };

  const fullDashboardData = prepareProjectDashboardData({
    activities,
    tasks,
    stats: dashboardStats,
    projectInfo: props.setSelectedProjectInfo,
  });

  // Section specific data
  const tasksData = prepareTasksData(tasks);
  const upcomingData = prepareTasksData(
    tasks.filter((task) => {
      if (!task.end_date) return false;
      const dueDate = new Date(task.end_date);
      const today = new Date();
      const daysUntilDue = Math.ceil((dueDate - today) / (1000 * 60 * 60 * 24));
      return daysUntilDue > 0 && daysUntilDue <= 30;
    })
  );

  // Dashboard refs for full export
  const dashboardRefs = {
    Stats_Cards: statsCardsRef,
    Task_Overview: taskOverviewRef,
    Milestone_Progress: milestoneChartRef,
    Task_Distribution: distributionChartRef,
  };

  return (
    <Box className=" w-full mr-0 lg:mr-5 mt-5 lg:mt-6" ref={dashboardRef}>
      <Helmet>
        <title>{props.setSelectedProjectInfo.name} - Dashboard</title>
      </Helmet>

      <Backdrop
        sx={{
          color: "#fff",
          zIndex: (theme) => theme.zIndex.drawer + 1,
          backgroundColor: "rgba(0,0,0,0.8)",
        }}
        open={loading}
      >
        <Box sx={{ textAlign: "center" }}>
          <ClipLoader color={theme.palette.primary.main} size={60} />
          <Typography variant="h6" sx={{ mt: 2, color: "white" }}>
            Loading Dashboard...
          </Typography>
        </Box>
      </Backdrop>

      <Container maxWidth="xl" sx={{ pb: 6 }}>
        {/* Header */}
        <Box
          sx={{
            mb: 4,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
          }}
        >
          <Box>
            <Typography
              variant="h4"
              sx={{
                fontWeight: 700,
                color: "#082f49",
                mb: 1,
              }}
            >
              {props.setSelectedProjectInfo.name}
            </Typography>
            <Typography variant="body1" sx={{ color: "text.secondary" }}>
              Project Overview & Analytics Dashboard
            </Typography>
          </Box>

          <ExportControls
            sectionName="Project Dashboard"
            sectionRef={dashboardRef}
            sectionData={fullDashboardData}
            dashboardRefs={dashboardRefs}
            fullDashboardData={fullDashboardData}
            showFullExport={true}
            variant="group"
          />
        </Box>

        {/* Stats Cards */}
        <Box ref={statsCardsRef}>
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} sm={6} md={3}>
              <StatCard>
                <CardContent sx={{ p: 3 }}>
                  <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                    <Box
                      sx={{
                        p: 1.5,
                        borderRadius: 2,
                        backgroundColor: alpha(theme.palette.primary.main, 0.1),
                        color: theme.palette.primary.main,
                        mr: 2,
                      }}
                    >
                      <ActivityIcon />
                    </Box>
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        Total Activities
                      </Typography>
                      <Typography variant="h4" sx={{ fontWeight: 700 }}>
                        {activityLength}
                      </Typography>
                    </Box>
                  </Box>
                  <Typography variant="caption" color="text.secondary">
                    Active project milestones
                  </Typography>
                </CardContent>
              </StatCard>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <StatCard>
                <CardContent sx={{ p: 3 }}>
                  <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                    <Box
                      sx={{
                        p: 1.5,
                        borderRadius: 2,
                        backgroundColor: alpha(theme.palette.success.main, 0.1),
                        color: theme.palette.success.main,
                        mr: 2,
                      }}
                    >
                      <TaskIcon />
                    </Box>
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        Total Tasks
                      </Typography>
                      <Typography variant="h4" sx={{ fontWeight: 700 }}>
                        {totalTasks}
                      </Typography>
                    </Box>
                  </Box>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <TrendingUpIcon
                      sx={{ color: "success.main", fontSize: 16 }}
                    />
                    <Typography variant="caption" color="success.main">
                      {completedTasks.length} completed
                    </Typography>
                  </Box>
                </CardContent>
              </StatCard>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <StatCard>
                <CardContent sx={{ p: 3 }}>
                  <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                    <Box
                      sx={{
                        p: 1.5,
                        borderRadius: 2,
                        backgroundColor: alpha(theme.palette.info.main, 0.1),
                        color: theme.palette.info.main,
                        mr: 2,
                      }}
                    >
                      <SubTaskIcon />
                    </Box>
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        Total Sub Tasks
                      </Typography>
                      <Typography variant="h4" sx={{ fontWeight: 700 }}>
                        {totalSubTasks}
                      </Typography>
                    </Box>
                  </Box>
                  <Typography variant="caption" color="text.secondary">
                    Detailed task breakdown
                  </Typography>
                </CardContent>
              </StatCard>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <StatCard>
                <CardContent sx={{ p: 3 }}>
                  <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                    <Box
                      sx={{
                        p: 1.5,
                        borderRadius: 2,
                        backgroundColor: alpha(theme.palette.warning.main, 0.1),
                        color: theme.palette.warning.main,
                        mr: 2,
                      }}
                    >
                      <ScheduleIcon />
                    </Box>
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        In Progress
                      </Typography>
                      <Typography variant="h4" sx={{ fontWeight: 700 }}>
                        {onProgressTasks.length}
                      </Typography>
                    </Box>
                  </Box>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                    <Typography variant="caption" color="text.secondary">
                      Completion Rate:
                    </Typography>
                    <Typography variant="caption" sx={{ fontWeight: 600 }}>
                      {totalTasks > 0
                        ? `${Math.round(
                            (completedTasks.length / totalTasks) * 100
                          )}%`
                        : "0%"}
                    </Typography>
                  </Box>
                </CardContent>
              </StatCard>
            </Grid>
          </Grid>
        </Box>

        {/* Task Overview Section */}
        <Paper
          elevation={0}
          sx={{
            borderRadius: 3,
            mb: 4,
            border: `1px solid ${theme.palette.divider}`,
            overflow: "hidden",
          }}
          ref={taskOverviewRef}
        >
          <Box
            sx={{
              p: 3,
              backgroundColor: "background.paper",
              borderBottom: `1px solid ${theme.palette.divider}`,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                Task Overview
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Monitor and manage all project tasks
              </Typography>
            </Box>

            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
              <TextField
                size="small"
                placeholder="Search tasks..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon color="action" />
                    </InputAdornment>
                  ),
                  sx: { borderRadius: 2, minWidth: 250 },
                }}
              />

              <ExportControls
                sectionName="Task Overview"
                sectionRef={taskOverviewRef}
                sectionData={tasksData}
                sectionType="tasks"
                variant="chip"
                size="small"
              />
            </Box>
          </Box>

          <Box sx={{ p: 3 }}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={4}>
                <Box
                  sx={{
                    p: 3,
                    borderRadius: 2,
                    backgroundColor: alpha(theme.palette.primary.main, 0.05),
                    border: `1px solid ${alpha(
                      theme.palette.primary.main,
                      0.1
                    )}`,
                  }}
                >
                  <Typography
                    variant="h3"
                    sx={{
                      fontWeight: 700,
                      color: "text.primary",
                      mb: 1,
                    }}
                  >
                    {totalTasks}
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 600, mb: 2 }}>
                    Total Tasks
                  </Typography>
                  <ProgressBar
                    variant="determinate"
                    value={totalTasks > 0 ? 100 : 0}
                    sx={{ mb: 2 }}
                  />
                </Box>

                <Box
                  sx={{
                    p: 3,
                    borderRadius: 2,
                    backgroundColor: alpha(theme.palette.success.main, 0.05),
                    border: `1px solid ${alpha(
                      theme.palette.success.main,
                      0.1
                    )}`,
                    mt: 2,
                  }}
                >
                  <Typography
                    variant="h3"
                    sx={{
                      fontWeight: 700,
                      color: theme.palette.success.main,
                      mb: 1,
                    }}
                  >
                    {completedTasks.length}
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 600, mb: 2 }}>
                    Completed
                  </Typography>
                  <ProgressBar
                    variant="determinate"
                    value={
                      totalTasks > 0
                        ? (completedTasks.length / totalTasks) * 100
                        : 0
                    }
                  />
                </Box>

                <Box
                  sx={{
                    p: 3,
                    borderRadius: 2,
                    backgroundColor: alpha(theme.palette.warning.main, 0.05),
                    border: `1px solid ${alpha(
                      theme.palette.warning.main,
                      0.1
                    )}`,
                    mt: 2,
                  }}
                >
                  <Typography
                    variant="h3"
                    sx={{
                      fontWeight: 700,
                      color: theme.palette.warning.main,
                      mb: 1,
                    }}
                  >
                    {onProgressTasks.length}
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 600, mb: 2 }}>
                    In Progress
                  </Typography>
                  <ProgressBar
                    variant="determinate"
                    value={
                      totalTasks > 0
                        ? (onProgressTasks.length / totalTasks) * 100
                        : 0
                    }
                  />
                </Box>
              </Grid>

              <Grid item xs={12} md={8}>
                <Paper
                  elevation={0}
                  sx={{
                    borderRadius: 2,
                    border: `1px solid ${theme.palette.divider}`,
                    overflow: "hidden",
                  }}
                >
                  <Box sx={{ overflowX: "auto" }}>
                    <Box
                      component="table"
                      sx={{ width: "100%", borderCollapse: "collapse" }}
                    >
                      <Box component="thead">
                        <Box
                          component="tr"
                          sx={{
                            backgroundColor: "background.default",
                            borderBottom: `1px solid ${theme.palette.divider}`,
                          }}
                        >
                          <Box
                            component="th"
                            sx={{ p: 2, textAlign: "left", minWidth: 200 }}
                          >
                            <Typography
                              variant="subtitle2"
                              sx={{ fontWeight: 600 }}
                            >
                              Task Name
                            </Typography>
                          </Box>
                          <Box
                            component="th"
                            sx={{ p: 2, textAlign: "left", minWidth: 120 }}
                          >
                            <Typography
                              variant="subtitle2"
                              sx={{ fontWeight: 600 }}
                            >
                              Due Date
                            </Typography>
                          </Box>
                          <Box
                            component="th"
                            sx={{ p: 2, textAlign: "left", minWidth: 150 }}
                          >
                            <Typography
                              variant="subtitle2"
                              sx={{ fontWeight: 600 }}
                            >
                              Progress
                            </Typography>
                          </Box>
                          <Box
                            component="th"
                            sx={{ p: 2, textAlign: "left", minWidth: 120 }}
                          >
                            <Typography
                              variant="subtitle2"
                              sx={{ fontWeight: 600 }}
                            >
                              Status
                            </Typography>
                          </Box>
                        </Box>
                      </Box>
                      <Box component="tbody">
                        {currentItems.length > 0 ? (
                          currentItems.map((task, index) => {
                            const progress = calculateProgress(
                              task.start_date,
                              task.end_date
                            );
                            const chipProps = getStatusChipProps(
                              task.task_status
                            );
                            return (
                              <Box
                                component="tr"
                                key={task.id}
                                sx={{
                                  borderBottom: `1px solid ${theme.palette.divider}`,
                                  "&:hover": {
                                    backgroundColor: "action.hover",
                                  },
                                }}
                              >
                                <Box component="td" sx={{ p: 2 }}>
                                  <Box
                                    sx={{
                                      display: "flex",
                                      alignItems: "center",
                                    }}
                                  >
                                    <Box
                                      sx={{
                                        width: 36,
                                        height: 36,
                                        borderRadius: "50%",
                                        backgroundColor: getInitialsColor(
                                          task.name.charAt(0)
                                        ),
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        color: "white",
                                        fontWeight: 600,
                                        mr: 2,
                                        flexShrink: 0,
                                      }}
                                    >
                                      {task.name.charAt(0).toUpperCase()}
                                    </Box>
                                    <Typography
                                      variant="body2"
                                      sx={{ fontWeight: 500 }}
                                    >
                                      {task.name.charAt(0).toUpperCase() +
                                        task.name.slice(1)}
                                    </Typography>
                                  </Box>
                                </Box>
                                <Box component="td" sx={{ p: 2 }}>
                                  <Typography variant="body2">
                                    {new Date(
                                      task.end_date
                                    ).toLocaleDateString()}
                                  </Typography>
                                </Box>
                                <Box component="td" sx={{ p: 2 }}>
                                  <Box
                                    sx={{
                                      display: "flex",
                                      alignItems: "center",
                                      gap: 2,
                                    }}
                                  >
                                    <Box sx={{ flexGrow: 1 }}>
                                      <ProgressBar
                                        variant="determinate"
                                        value={progress}
                                      />
                                    </Box>
                                    <Typography
                                      variant="body2"
                                      sx={{
                                        fontWeight: 600,
                                        minWidth: 40,
                                        color: getProgressColor(
                                          progress,
                                          task.task_status
                                        ),
                                      }}
                                    >
                                      {progress.toFixed(1)}%
                                    </Typography>
                                  </Box>
                                </Box>
                                <Box component="td" sx={{ p: 2 }}>
                                  <Chip
                                    size="small"
                                    label={task.task_status}
                                    color={chipProps.color}
                                    icon={chipProps.icon}
                                    sx={{ fontWeight: 500 }}
                                  />
                                </Box>
                              </Box>
                            );
                          })
                        ) : (
                          <Box component="tr">
                            <Box
                              component="td"
                              colSpan={4}
                              sx={{ p: 4, textAlign: "center" }}
                            >
                              <Typography
                                variant="body1"
                                color="text.secondary"
                              >
                                No tasks found
                              </Typography>
                            </Box>
                          </Box>
                        )}
                      </Box>
                    </Box>
                  </Box>

                  {search.length > 0 && (
                    <Box
                      sx={{
                        p: 2,
                        borderTop: `1px solid ${theme.palette.divider}`,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        flexWrap: "wrap",
                        gap: 2,
                      }}
                    >
                      <Box
                        sx={{ display: "flex", alignItems: "center", gap: 2 }}
                      >
                        <Typography variant="body2" color="text.secondary">
                          Rows per page:
                        </Typography>
                        <TextField
                          select
                          size="small"
                          value={rowsPerPage}
                          onChange={handleRowsPerPageChange}
                          SelectProps={{
                            native: true,
                          }}
                          sx={{ minWidth: 80 }}
                        >
                          <option value={5}>5</option>
                          <option value={10}>10</option>
                          <option value={25}>25</option>
                        </TextField>
                      </Box>
                      <Box
                        sx={{ display: "flex", alignItems: "center", gap: 1 }}
                      >
                        <Typography variant="body2" color="text.secondary">
                          Page {currentPage} of {pageCount}
                        </Typography>
                        <Box sx={{ display: "flex", gap: 0.5 }}>
                          {Array.from(
                            { length: Math.min(5, pageCount) },
                            (_, i) => {
                              let pageNumber;
                              if (pageCount <= 5) {
                                pageNumber = i + 1;
                              } else if (currentPage <= 3) {
                                pageNumber = i + 1;
                              } else if (currentPage >= pageCount - 2) {
                                pageNumber = pageCount - 4 + i;
                              } else {
                                pageNumber = currentPage - 2 + i;
                              }

                              return (
                                <Chip
                                  key={pageNumber}
                                  label={pageNumber}
                                  onClick={() =>
                                    handlePageChange(null, pageNumber)
                                  }
                                  color={
                                    currentPage === pageNumber
                                      ? "primary"
                                      : "default"
                                  }
                                  size="small"
                                  clickable
                                />
                              );
                            }
                          )}
                        </Box>
                      </Box>
                    </Box>
                  )}
                </Paper>
              </Grid>
            </Grid>
          </Box>
        </Paper>

        {/* Charts Section */}
        <Grid container spacing={3}>
          {/* Milestone Chart */}
          <Grid item xs={12} lg={8}>
            <Paper
              elevation={0}
              sx={{
                p: 3,
                borderRadius: 3,
                height: "100%",
                border: `1px solid ${theme.palette.divider}`,
              }}
              ref={milestoneChartRef}
            >
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  mb: 3,
                }}
              >
                <Box sx={{ display: "flex", alignItems: "center" }}>
                  <Box
                    sx={{
                      p: 1,
                      borderRadius: 2,
                      backgroundColor: alpha(theme.palette.primary.main, 0.1),
                      color: theme.palette.primary.main,
                      mr: 2,
                    }}
                  >
                    <TimelineIcon />
                  </Box>
                  <Box>
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      Milestone Progress
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Track milestone completion rates
                    </Typography>
                  </Box>
                </Box>

                <ExportControls
                  sectionName="Milestone Progress"
                  sectionRef={milestoneChartRef}
                  sectionData={barChartData}
                  sectionType="milestones"
                  variant="chip"
                  size="small"
                />
              </Box>

              {activities.length > 0 ? (
                <Box sx={{ height: 320 }}>
                  <BarChart
                    series={[
                      {
                        data: barChartData.map((d) => d.progress),
                        color: theme.palette.primary.main,
                      },
                    ]}
                    height={320}
                    xAxis={[
                      {
                        data: barChartData.map((d) => d.name),
                        scaleType: "band",
                        tickLabelStyle: {
                          angle: 45,
                          textAnchor: "start",
                          fontSize: 12,
                        },
                      },
                    ]}
                    yAxis={[
                      {
                        min: 0,
                        max: 100,
                      },
                    ]}
                    margin={{ top: 20, bottom: 70, left: 40, right: 20 }}
                    grid={{ vertical: true }}
                    tooltip={{ trigger: "item" }}
                  />
                </Box>
              ) : (
                <Box
                  sx={{
                    height: 320,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexDirection: "column",
                    gap: 2,
                  }}
                >
                  <TimelineIcon sx={{ fontSize: 48, color: "text.disabled" }} />
                  <Typography variant="body1" color="text.secondary">
                    No milestone data available
                  </Typography>
                </Box>
              )}
            </Paper>
          </Grid>

          {/* Task Distribution Chart */}
          <Grid item xs={12} lg={4}>
            <Paper
              elevation={0}
              sx={{
                p: 3,
                borderRadius: 3,
                height: "100%",
                border: `1px solid ${theme.palette.divider}`,
              }}
              ref={distributionChartRef}
            >
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  mb: 3,
                }}
              >
                <Box sx={{ display: "flex", alignItems: "center" }}>
                  <Box
                    sx={{
                      p: 1,
                      borderRadius: 2,
                      backgroundColor: alpha(theme.palette.info.main, 0.1),
                      color: theme.palette.info.main,
                      mr: 2,
                    }}
                  >
                    <PieChartIcon />
                  </Box>
                  <Box>
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      Task Distribution
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Overview by status
                    </Typography>
                  </Box>
                </Box>

                <ExportControls
                  sectionName="Task Distribution"
                  sectionRef={distributionChartRef}
                  sectionData={chartData}
                  sectionType="distribution"
                  variant="chip"
                  size="small"
                />
              </Box>

              {tasks.length > 0 ? (
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: 3,
                  }}
                >
                  <PieChart
                    series={[
                      {
                        data: chartData,
                        innerRadius: 40,
                        outerRadius: 80,
                        paddingAngle: 2,
                        cornerRadius: 4,
                        highlightScope: { fade: "global", highlight: "item" },
                      },
                    ]}
                    height={240}
                    slotProps={{
                      legend: { hidden: true },
                    }}
                  />
                  <Box
                    sx={{
                      display: "flex",
                      flexDirection: "column",
                      gap: 1.5,
                      width: "100%",
                    }}
                  >
                    {chartData.map((item, index) => (
                      <Box
                        key={index}
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          p: 2,
                          borderRadius: 2,
                          backgroundColor: alpha(item.color, 0.05),
                          border: `1px solid ${alpha(item.color, 0.1)}`,
                        }}
                      >
                        <Box
                          sx={{ display: "flex", alignItems: "center", gap: 2 }}
                        >
                          <Box
                            sx={{
                              width: 12,
                              height: 12,
                              borderRadius: "50%",
                              backgroundColor: item.color,
                            }}
                          />
                          <Typography variant="body2" sx={{ fontWeight: 500 }}>
                            {item.label}
                          </Typography>
                        </Box>
                        <Typography variant="h6" sx={{ fontWeight: 700 }}>
                          {item.value}
                        </Typography>
                      </Box>
                    ))}
                  </Box>
                </Box>
              ) : (
                <Box
                  sx={{
                    height: 240,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexDirection: "column",
                    gap: 2,
                  }}
                >
                  <PieChartIcon sx={{ fontSize: 48, color: "text.disabled" }} />
                  <Typography variant="body1" color="text.secondary">
                    No task data available
                  </Typography>
                </Box>
              )}
            </Paper>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default Dashboard;
