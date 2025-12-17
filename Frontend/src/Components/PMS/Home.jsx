import React, { useEffect, useState, useRef } from "react";
import {
  Grid,
  InputAdornment,
  Paper,
  TextField,
  Typography,
  Box,
  Container,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Pagination,
  useTheme,
  styled,
  tableCellClasses,
  Card,
  CardContent,
  alpha,
  Chip,
} from "@mui/material";
import { Helmet } from "react-helmet-async";
import "./Home.css";

// Icons
import ChecklistIcon from "@mui/icons-material/Checklist";
import HistoryToggleOffIcon from "@mui/icons-material/HistoryToggleOff";
import ListAltIcon from "@mui/icons-material/ListAlt";
import SearchIcon from "@mui/icons-material/Search";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import TaskIcon from "@mui/icons-material/Task";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import PieChartIcon from "@mui/icons-material/PieChart";

// Charts
import { PieChart } from "@mui/x-charts/PieChart";

// Services
import apiService from "../services/apiServices";

// Components
import ExportControls from "./dashboard/ExportControls";
import { DashboardStatCard } from "./dashboard/StatCard";

// Utils
import {
  exportSectionToPDF,
  exportToExcel,
  exportToCSV,
  prepareFullDashboardData,
  prepareTasksData,
  prepareProjectsData,
  prepareUpcomingTasksData,
} from "../utils/exportUtils";

// Custom styled components
const StyledTableCell = styled(TableCell)(({ theme }) => ({
  [`&.${tableCellClasses.head}`]: {
    backgroundColor: theme.palette.primary.main,
    color: theme.palette.common.white,
    fontSize: 14,
    fontWeight: 600,
  },
  [`&.${tableCellClasses.body}`]: {
    fontSize: 14,
  },
  padding: theme.spacing(1.5),
}));

const StyledTableRow = styled(TableRow)(({ theme }) => ({
  "&:nth-of-type(odd)": {
    backgroundColor: theme.palette.action.hover,
  },
  "&:hover": {
    backgroundColor: theme.palette.action.selected,
    cursor: "pointer",
    transition: "background-color 0.2s ease",
  },
  "&:last-child td, &:last-child th": {
    border: 0,
  },
}));

const StatCard = styled(Card)(({ theme }) => ({
  height: "100%",
  borderRadius: 12,
  boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
  transition: "transform 0.3s ease, box-shadow 0.3s ease",
  "&:hover": {
    transform: "translateY(-4px)",
    boxShadow: "0 8px 30px rgba(0,0,0,0.12)",
  },
}));

const ProgressBar = styled("div")(({ theme, progress, color }) => ({
  position: "relative",
  width: "100%",
  height: 8,
  backgroundColor: theme.palette.grey[200],
  borderRadius: 4,
  overflow: "hidden",
  "&::after": {
    content: '""',
    position: "absolute",
    top: 0,
    left: 0,
    height: "100%",
    width: `${progress}%`,
    backgroundColor: color,
    borderRadius: 4,
    transition: "width 0.5s ease",
  },
}));

function Home() {
  const theme = useTheme();
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [page2, setPage2] = useState(1);
  const [rowsPerPage2, setRowsPerPage2] = useState(5);
  const [selectedProject, setSelectedProject] = useState();
  const [userInfo, setUserInfo] = useState(() => {
    return JSON.parse(localStorage.getItem("userInfo")) || [];
  });
  const [projects, setProjects] = useState([]);
  const [projects2, setProjects2] = useState([]);
  const [projectsAssigned, setProjectsAssigned] = useState([]);
  const [totalProjects, setTotalProjects] = useState(0);
  const [completedProjects, setCompletedProjects] = useState(0);
  const [onProgressProjects, setOnProgressProjects] = useState(0);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  // Refs for export
  const dashboardRef = useRef(null);
  const taskTableRef = useRef(null);
  const projectsTableRef = useRef(null);
  const upcomingTableRef = useRef(null);
  const statsCardsRef = useRef(null);
  const chartRef = useRef(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await apiService.getUsers();
      setProjects(response.Projects);
      setProjects2(response.Projects);
      setProjectsAssigned(response.Projects);
      setTotalProjects(response.Projects.length);
      const completedProjects = response.Projects.filter(
        (project) => project.overall_progress === "Completed"
      );
      const onProgressProjects = response.Projects.filter(
        (project) => project.overall_progress === "On Progress"
      );
      setCompletedProjects(completedProjects.length);
      setOnProgressProjects(onProgressProjects.length);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching user data:", error);
    }
  };

  // Calculate subtask statistics
  const projectsWithSubtasks = projects.filter((project) =>
    project.activity.some((activity) =>
      activity.Task.some((task) => task.subTask.length > 0)
    )
  );

  const totalSubtasksLength = projectsWithSubtasks.reduce((total, project) => {
    return (
      total +
      project.activity.reduce((acc, activity) => {
        return (
          acc +
          activity.Task.reduce((sum, task) => {
            return sum + task.subTask.length;
          }, 0)
        );
      }, 0)
    );
  }, 0);

  const totalCompletedSubtasksLength = projectsWithSubtasks.reduce(
    (total, project) => {
      return (
        total +
        project.activity.reduce((acc, activity) => {
          return (
            acc +
            activity.Task.reduce((sum, task) => {
              return (
                sum +
                task.subTask.reduce((subtaskSum, subtask) => {
                  return subtask.subtask_status === "Completed"
                    ? subtaskSum + 1
                    : subtaskSum;
                }, 0)
              );
            }, 0)
          );
        }, 0)
      );
    },
    0
  );

  const totalPendingSubtasksLength = projectsWithSubtasks.reduce(
    (total, project) => {
      return (
        total +
        project.activity.reduce((acc, activity) => {
          return (
            acc +
            activity.Task.reduce((sum, task) => {
              return (
                sum +
                task.subTask.reduce((subtaskSum, subtask) => {
                  return subtask.subtask_status === "Pending"
                    ? subtaskSum + 1
                    : subtaskSum;
                }, 0)
              );
            }, 0)
          );
        }, 0)
      );
    },
    0
  );

  const totalInProgressSubtasksLength = projectsWithSubtasks.reduce(
    (total, project) => {
      return (
        total +
        project.activity.reduce((acc, activity) => {
          return (
            acc +
            activity.Task.reduce((sum, task) => {
              return (
                sum +
                task.subTask.reduce((subtaskSum, subtask) => {
                  return subtask.subtask_status === "On Progress"
                    ? subtaskSum + 1
                    : subtaskSum;
                }, 0)
              );
            }, 0)
          );
        }, 0)
      );
    },
    0
  );

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
    } else if (taskStatus === "Pending") {
      return theme.palette.warning.main;
    } else if (progress < 75) {
      return theme.palette.warning.main;
    } else {
      return theme.palette.error.main;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Completed":
        return theme.palette.success.main;
      case "On Progress":
        return theme.palette.warning.main;
      case "Pending":
        return theme.palette.info.main;
      case "Canceled":
        return theme.palette.error.main;
      default:
        return theme.palette.grey[500];
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

  // Filter and sort logic
  const filteredProjects = projects.filter((project) =>
    project.activity.some((activity) =>
      activity.Task.some(
        (task) =>
          task.subTask &&
          task.subTask.some(
            (subTask) =>
              subTask.name &&
              subTask.name.toLowerCase().includes(searchTerm.toLowerCase())
          )
      )
    )
  );

  const allSubTasks = filteredProjects.flatMap((project) =>
    project.activity.flatMap((activity) =>
      activity.Task.flatMap((task) =>
        task.subTask
          ? task.subTask
              .filter((subTask) =>
                subTask.name.toLowerCase().includes(searchTerm.toLowerCase())
              )
              .map((subTask) => ({
                ...subTask,
                projectName: project.name,
              }))
          : []
      )
    )
  );

  const isDueWithin15Days = (dueDate) => {
    const today = new Date();
    const dueDateObj = new Date(dueDate);
    const fifteenDaysFromNow = new Date(today);
    fifteenDaysFromNow.setDate(today.getDate() + 15);
    return dueDateObj >= today && dueDateObj <= fifteenDaysFromNow;
  };

  const filteredProjects2 = projects.flatMap((project) =>
    project.activity.flatMap((activity) =>
      activity.Task.flatMap((task) =>
        task.subTask
          ? task.subTask
              .filter(
                (subTask) =>
                  subTask.end_date && isDueWithin15Days(subTask.end_date)
              )
              .map((subTask) => ({
                ...subTask,
                projectName: project.name,
              }))
          : []
      )
    )
  );

  const sortedSubTasks = filteredProjects2.sort((a, b) => {
    return new Date(a.end_date) - new Date(b.end_date);
  });
  const limitedSubTasks = sortedSubTasks.slice(0, 10);

  // Pagination
  const indexOfLastItem = page * rowsPerPage;
  const indexOfFirstItem = indexOfLastItem - rowsPerPage;
  const currentItems = allSubTasks.slice(indexOfFirstItem, indexOfLastItem);
  const pageCount = Math.ceil(allSubTasks.length / rowsPerPage);

  const indexOfLastItem2 = page2 * rowsPerPage2;
  const indexOfFirstItem2 = indexOfLastItem2 - rowsPerPage2;
  const currentItems2 = projectsAssigned.slice(
    indexOfFirstItem2,
    indexOfLastItem2
  );
  const pageCount2 = Math.ceil(projectsAssigned.length / rowsPerPage2);

  const handlePageChange = (event, value) => {
    setPage(value);
  };

  const handlePageChange2 = (event, value) => {
    setPage2(value);
  };

  const handleRowsPerPageChange = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(1);
  };

  const handleRowsPerPageChange2 = (event) => {
    setRowsPerPage2(parseInt(event.target.value, 10));
    setPage2(1);
  };

  // Chart data
  const chartData = [
    {
      label: "Completed",
      value: totalCompletedSubtasksLength,
      color: theme.palette.success.main,
    },
    {
      label: "In Progress",
      value: totalInProgressSubtasksLength,
      color: theme.palette.warning.main,
    },
    {
      label: "Pending",
      value: totalPendingSubtasksLength,
      color: theme.palette.grey[500],
    },
  ];

  // Prepare data for exports
  const dashboardStats = {
    totalProjects,
    completedProjects,
    onProgressProjects,
    totalSubtasks: totalSubtasksLength,
    completedSubtasks: totalCompletedSubtasksLength,
    inProgressSubtasks: totalInProgressSubtasksLength,
    pendingSubtasks: totalPendingSubtasksLength,
  };

  const fullDashboardData = prepareFullDashboardData({
    allSubTasks,
    filteredProjects2: limitedSubTasks,
    projectsAssigned,
    stats: dashboardStats,
  });

  // Section specific data
  const tasksData = prepareTasksData(allSubTasks);
  const projectsData = prepareProjectsData(projectsAssigned);
  const upcomingData = prepareUpcomingTasksData(limitedSubTasks);

  // Dashboard refs for full export
  const dashboardRefs = {
    Stats_Cards: statsCardsRef,
    Task_List: taskTableRef,
    Upcoming_Deadlines: upcomingTableRef,
    Projects_Assigned: projectsTableRef,
    Task_Distribution: chartRef,
  };

  // Export handlers
  const handleExportPDF = async (ref, name) => {
    try {
      await exportSectionToPDF(ref, name);
    } catch (error) {
      console.error("Error exporting PDF:", error);
    }
  };

  const handleExportExcel = (data, name) => {
    try {
      exportToExcel(data, name);
    } catch (error) {
      console.error("Error exporting Excel:", error);
    }
  };

  const handleExportCSV = (data, name) => {
    try {
      exportToCSV(data, name);
    } catch (error) {
      console.error("Error exporting CSV:", error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <Box className="ml-auto w-full  mr-0 lg:mr-5 " ref={dashboardRef}>
      <Helmet>
        <title>PMS - Dashboard</title>
      </Helmet>
      <Container maxWidth="xl" sx={{ py: 3 }}>
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
                color: "#0A5077",
                mb: 1,
              }}
            >
              Dashboard Overview
            </Typography>
            <Typography variant="body1" sx={{ color: "text.secondary" }}>
              Welcome back! Here's what's happening with your projects today.
            </Typography>
          </Box>
        </Box>

        {/* Stats Cards */}
        <Box ref={statsCardsRef}>
          <Grid container spacing={3} sx={{ mb: 6 }}>
            <Grid item xs={12} sm={6} md={3}>
              <DashboardStatCard
                title="Projects Assigned"
                value={totalProjects}
                icon={ListAltIcon}
                color={theme.palette.primary.main}
                trendText="Active projects"
                trendIcon={TrendingUpIcon}
                theme={theme}
              />
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <DashboardStatCard
                title="Projects Completed"
                value={completedProjects}
                icon={ChecklistIcon}
                color={theme.palette.success.main}
                trendText={`${
                  totalProjects > 0
                    ? `${Math.round(
                        (completedProjects / totalProjects) * 100
                      )}% completion rate`
                    : "No projects"
                }`}
                theme={theme}
              />
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <DashboardStatCard
                title="Projects In Progress"
                value={onProgressProjects}
                icon={HistoryToggleOffIcon}
                color={theme.palette.warning.main}
                trendText="Actively being worked on"
                theme={theme}
              />
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <DashboardStatCard
                title="Total Tasks"
                value={totalSubtasksLength}
                icon={TaskIcon}
                color={theme.palette.info.main}
                trendText={`${totalCompletedSubtasksLength} completed`}
                theme={theme}
              />
            </Grid>
          </Grid>
        </Box>

        {/* Task List Section */}
        <Paper
          elevation={0}
          sx={{
            borderRadius: 3,
            overflow: "hidden",
            mb: 4,
            border: `1px solid ${theme.palette.divider}`,
          }}
          ref={taskTableRef}
        >
          <Box
            sx={{
              p: 3,
              bgcolor: "background.default",
              borderBottom: `1px solid ${theme.palette.divider}`,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                Task List
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Manage and track your assigned tasks
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
                  sx: { borderRadius: 2 },
                }}
                sx={{ minWidth: 250 }}
              />
              <ExportControls
                sectionName="Task List"
                sectionRef={taskTableRef}
                sectionData={tasksData}
                sectionType="tasks"
                variant="chip"
                size="small"
              />
            </Box>
          </Box>

          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <StyledTableCell>Task Name</StyledTableCell>
                  <StyledTableCell>Project</StyledTableCell>
                  <StyledTableCell>Due Date</StyledTableCell>
                  <StyledTableCell align="center">Progress</StyledTableCell>
                  <StyledTableCell align="center">Status</StyledTableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {currentItems.map((subTask, index) => {
                  const progress = calculateProgress(
                    subTask.start_date,
                    subTask.end_date
                  );
                  const progressColor = getProgressColor(
                    progress,
                    subTask.subtask_status
                  );
                  return (
                    <StyledTableRow key={index}>
                      <StyledTableCell>
                        <Box sx={{ display: "flex", alignItems: "center" }}>
                          <Box
                            sx={{
                              width: 32,
                              height: 32,
                              borderRadius: "50%",
                              bgcolor: getInitialsColor(subTask.name.charAt(0)),
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              color: "white",
                              fontWeight: 600,
                              mr: 2,
                            }}
                          >
                            {subTask.name.charAt(0).toUpperCase()}
                          </Box>
                          <Typography variant="body2" sx={{ fontWeight: 500 }}>
                            {subTask.name}
                          </Typography>
                        </Box>
                      </StyledTableCell>
                      <StyledTableCell>
                        <Typography variant="body2">
                          {subTask.projectName}
                        </Typography>
                      </StyledTableCell>
                      <StyledTableCell>
                        <Box sx={{ display: "flex", alignItems: "center" }}>
                          <CalendarTodayIcon
                            sx={{ fontSize: 16, mr: 1, color: "action.active" }}
                          />
                          <Typography variant="body2">
                            {new Date(subTask.end_date).toLocaleDateString()}
                          </Typography>
                        </Box>
                      </StyledTableCell>
                      <StyledTableCell align="center">
                        <Box
                          sx={{
                            position: "relative",
                            width: "100%",
                            maxWidth: 200,
                            mx: "auto",
                          }}
                        >
                          <ProgressBar
                            progress={progress}
                            color={progressColor}
                          />
                          <Typography
                            variant="caption"
                            sx={{
                              position: "absolute",
                              top: "50%",
                              left: "50%",
                              transform: "translate(-50%, -50%)",
                              fontWeight: 600,
                              color: progress > 50 ? "white" : "text.primary",
                            }}
                          >
                            {progress.toFixed(1)}%
                          </Typography>
                        </Box>
                      </StyledTableCell>
                      <StyledTableCell align="center">
                        <Box
                          sx={{
                            display: "inline-flex",
                            px: 1.5,
                            py: 0.5,
                            borderRadius: 1,
                            bgcolor: `${getStatusColor(
                              subTask.subtask_status
                            )}15`,
                            color: getStatusColor(subTask.subtask_status),
                            fontWeight: 600,
                            fontSize: "0.75rem",
                          }}
                        >
                          {subTask.subtask_status}
                        </Box>
                      </StyledTableCell>
                    </StyledTableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>

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
            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
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
            <Pagination
              count={pageCount}
              page={page}
              onChange={handlePageChange}
              color="primary"
              size="small"
              showFirstButton
              showLastButton
            />
          </Box>
        </Paper>

        {/* Charts and Tables Section */}
        <Grid container spacing={4}>
          {/* Near Due Date Tasks */}
          <Grid item xs={12} md={8}>
            <Paper
              elevation={0}
              sx={{
                p: 3,
                height: "100%",
                borderRadius: 3,
                border: `1px solid ${theme.palette.divider}`,
              }}
              ref={upcomingTableRef}
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
                      bgcolor: theme.palette.warning.light,
                      color: theme.palette.warning.main,
                      mr: 2,
                    }}
                  >
                    <CalendarTodayIcon />
                  </Box>
                  <Box>
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      Upcoming Deadlines
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Tasks due in the next 15 days
                    </Typography>
                  </Box>
                </Box>

                <ExportControls
                  sectionName="Upcoming Deadlines"
                  sectionRef={upcomingTableRef}
                  sectionData={upcomingData}
                  sectionType="upcoming"
                  variant="chip"
                  size="small"
                />
              </Box>

              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <StyledTableCell>Task</StyledTableCell>
                      <StyledTableCell>Project</StyledTableCell>
                      <StyledTableCell align="right">Due Date</StyledTableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {limitedSubTasks.map((subTask, index) => (
                      <TableRow
                        key={index}
                        sx={{ "&:hover": { bgcolor: "action.hover" } }}
                      >
                        <TableCell>
                          <Typography variant="body2" sx={{ fontWeight: 500 }}>
                            {subTask.name}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" color="text.secondary">
                            {subTask.projectName}
                          </Typography>
                        </TableCell>
                        <TableCell align="right">
                          <Box
                            sx={{
                              display: "inline-flex",
                              alignItems: "center",
                              px: 1.5,
                              py: 0.5,
                              borderRadius: 1,
                              bgcolor: theme.palette.warning.light,
                              color: theme.palette.warning.dark,
                            }}
                          >
                            <CalendarTodayIcon sx={{ fontSize: 14, mr: 0.5 }} />
                            <Typography
                              variant="caption"
                              sx={{ fontWeight: 600 }}
                            >
                              {new Date(subTask.end_date).toLocaleDateString()}
                            </Typography>
                          </Box>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
          </Grid>

          {/* Project Statistics Chart */}
          <Grid item xs={12} md={4}>
            <Paper
              elevation={0}
              sx={{
                p: 3,
                height: "100%",
                borderRadius: 3,
                border: `1px solid ${theme.palette.divider}`,
                display: "flex",
                flexDirection: "column",
              }}
              ref={chartRef}
            >
              <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
                <Box
                  sx={{
                    p: 1,
                    borderRadius: 2,
                    bgcolor: theme.palette.info.light,
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
                    Overview of task status
                  </Typography>
                </Box>
              </Box>

              <Box sx={{ flex: 1, display: "flex", flexDirection: "column" }}>
                <Box
                  sx={{
                    flex: 1,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    mb: 3,
                  }}
                >
                  <PieChart
                    series={[
                      {
                        data: chartData,
                        innerRadius: 40,
                        outerRadius: 70,
                        paddingAngle: 2,
                        cornerRadius: 4,
                      },
                    ]}
                    height={250}
                    slotProps={{
                      legend: { hidden: true },
                    }}
                  />
                </Box>

                <Box
                  sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}
                >
                  {chartData.map((item, index) => (
                    <Box
                      key={index}
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        p: 1.5,
                        borderRadius: 1,
                        bgcolor: "background.default",
                        border: `1px solid ${theme.palette.divider}`,
                      }}
                    >
                      <Box sx={{ display: "flex", alignItems: "center" }}>
                        <Box
                          sx={{
                            width: 12,
                            height: 12,
                            borderRadius: "50%",
                            bgcolor: item.color,
                            mr: 2,
                          }}
                        />
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                          {item.label}
                        </Typography>
                      </Box>
                      <Typography variant="body1" sx={{ fontWeight: 600 }}>
                        {item.value}
                      </Typography>
                    </Box>
                  ))}
                </Box>
              </Box>
            </Paper>
          </Grid>
        </Grid>

        {/* Projects Assigned Section */}
        <Paper
          elevation={0}
          sx={{
            mt: 4,
            mb: 10,
            borderRadius: 3,
            border: `1px solid ${theme.palette.divider}`,
            overflow: "hidden",
          }}
          ref={projectsTableRef}
        >
          <Box
            sx={{
              p: 3,
              bgcolor: "background.default",
              borderBottom: `1px solid ${theme.palette.divider}`,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                Projects Assigned to You
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Overview of all projects under your responsibility
              </Typography>
            </Box>

            <ExportControls
              sectionName="Projects"
              sectionRef={projectsTableRef}
              sectionData={projectsData}
              sectionType="projects"
              variant="chip"
            />
          </Box>

          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <StyledTableCell>Project Name</StyledTableCell>
                  <StyledTableCell>Start Date</StyledTableCell>
                  <StyledTableCell>End Date</StyledTableCell>
                  <StyledTableCell align="center">Status</StyledTableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {currentItems2.map((project, index) => (
                  <StyledTableRow key={index}>
                    <StyledTableCell>
                      <Box sx={{ display: "flex", alignItems: "center" }}>
                        <Box
                          sx={{
                            width: 40,
                            height: 40,
                            borderRadius: 2,
                            bgcolor: getInitialsColor(project.name.charAt(0)),
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            color: "white",
                            fontWeight: 600,
                            fontSize: "1rem",
                            mr: 2,
                          }}
                        >
                          {project.name.charAt(0).toUpperCase()}
                        </Box>
                        <Box>
                          <Typography variant="body1" sx={{ fontWeight: 600 }}>
                            {project.name}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {project.overall_progress}
                          </Typography>
                        </Box>
                      </Box>
                    </StyledTableCell>
                    <StyledTableCell>
                      <Typography variant="body2">
                        {new Date(project.start_date).toLocaleDateString()}
                      </Typography>
                    </StyledTableCell>
                    <StyledTableCell>
                      <Typography variant="body2">
                        {new Date(project.end_date).toLocaleDateString()}
                      </Typography>
                    </StyledTableCell>
                    <StyledTableCell align="center">
                      <Box
                        sx={{
                          display: "inline-flex",
                          px: 2,
                          py: 0.75,
                          borderRadius: 1.5,
                          bgcolor: `${getStatusColor(
                            project.overall_progress
                          )}15`,
                          color: getStatusColor(project.overall_progress),
                          fontWeight: 600,
                          fontSize: "0.75rem",
                          alignItems: "center",
                        }}
                      >
                        <Box
                          sx={{
                            width: 8,
                            height: 8,
                            borderRadius: "50%",
                            bgcolor: getStatusColor(project.overall_progress),
                            mr: 1,
                          }}
                        />
                        {project.overall_progress}
                      </Box>
                    </StyledTableCell>
                  </StyledTableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

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
            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
              <Typography variant="body2" color="text.secondary">
                Rows per page:
              </Typography>
              <TextField
                select
                size="small"
                value={rowsPerPage2}
                onChange={handleRowsPerPageChange2}
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
            <Pagination
              count={pageCount2}
              page={page2}
              onChange={handlePageChange2}
              color="primary"
              size="small"
              showFirstButton
              showLastButton
            />
          </Box>
        </Paper>
      </Container>
    </Box>
  );
}

export default Home;
