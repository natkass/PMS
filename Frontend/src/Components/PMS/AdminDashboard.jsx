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
  CardHeader,
  Avatar,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
} from "@mui/material";
import Backdrop from "@mui/material/Backdrop";
import { BarChart } from "@mui/x-charts/BarChart";
import React, { useEffect, useState, useRef } from "react";
import { Helmet } from "react-helmet-async";
import ClipLoader from "react-spinners/ClipLoader";
import apiService from "../services/apiServices";
import "./Home.css";

// Icons
import ChecklistIcon from "@mui/icons-material/Checklist";
import HistoryToggleOffIcon from "@mui/icons-material/HistoryToggleOff";
import ListAltIcon from "@mui/icons-material/ListAlt";
import TimelineOutlinedIcon from "@mui/icons-material/TimelineOutlined";
import SearchIcon from "@mui/icons-material/Search";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import PeopleIcon from "@mui/icons-material/People";
import PieChartIcon from "@mui/icons-material/PieChart";
import TimelineIcon from "@mui/icons-material/Timeline";
import FilterListIcon from "@mui/icons-material/FilterList";

// Charts
import { PieChart } from "@mui/x-charts/PieChart";
import { styled } from "@mui/material/styles";

// Table
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Pagination from "@mui/material/Pagination";
import { tableCellClasses } from "@mui/material/TableCell";

// Export Components
import ExportControls from "./dashboard/ExportControls";
import {
  exportToPDF,
  exportToExcel,
  exportToCSV,
  prepareAdminDashboardData,
  exportAdminDashboardToExcel,
  exportAdminProjectsToCSV,
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
  },
}));

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

const ProgressBar = styled(LinearProgress)(({ theme, value }) => ({
  height: 8,
  borderRadius: 4,
  backgroundColor: theme.palette.grey[200],
  "& .MuiLinearProgress-bar": {
    borderRadius: 4,
  },
}));

const DashboardContainer = styled(Box)(({ theme }) => ({
  backgroundColor: theme.palette.background.default,
  minHeight: "100vh",
  pt: { xs: 2, md: 3 },
}));

const AdminDashboard = (props) => {
  const theme = useTheme();
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [loading, setLoading] = useState(false);
  const [projects, setProjects] = useState([]);
  const [projects2, setProjects2] = useState([]);
  const [totalProjects, setTotalProjects] = useState(0);
  const [completedProjects, setCompletedProjects] = useState(0);
  const [onProgressProjects, setOnProgressProjects] = useState(0);
  const [pendingProjects, setPendingProjects] = useState(0);
  const [projectManagers, setProjectManagers] = useState([]);
  const [selectedProject2, setSelectedProject2] = useState(null);
  const [filteredActivities, setFilteredActivities] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [userInfo] = useState(() => {
    return JSON.parse(localStorage.getItem("userInfo")) || [];
  });

  // Refs for export
  const dashboardRef = useRef(null);
  const projectsTableRef = useRef(null);
  const milestoneChartRef = useRef(null);
  const projectStatsChartRef = useRef(null);
  const statsCardsRef = useRef(null);

  // Helper function to get manager names
  const getManagerNames = (managers) => {
    if (!managers || !Array.isArray(managers)) return "N/A";

    const names = managers
      .filter((manager) => manager && manager.UserRoleToUser)
      .map((manager) => manager.UserRoleToUser.full_name || "Unnamed Manager")
      .filter((name) => name !== "Unnamed Manager");

    return names.length > 0 ? names.join(", ") : "N/A";
  };

  // Helper function to format budget
  const formatBudget = (budget) => {
    if (budget == null || isNaN(budget)) {
      return "N/A";
    }

    if (budget >= 1000000000) {
      const billions = budget / 1000000000;
      return `${(Math.round(billions * 100) / 100).toFixed(2)}B`;
    } else if (budget >= 1000000) {
      const millions = budget / 1000000;
      return `${(Math.round(millions * 100) / 100).toFixed(2)}M`;
    }
    return budget.toLocaleString();
  };

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const projectsData = await apiService.getAllProjects(
        userInfo.access_token
      );

      const nonProjectRelatedRoles = userInfo.foundUser.Roles.filter(
        (role) => !role.project_related
      ).map((role) => role.name);

      const sectorData = await apiService.getSectors(userInfo.access_token);
      const isDepartmentAdminRolePresent =
        nonProjectRelatedRoles.includes("Department Admin");

      const isClusterAdminRolePresent =
        nonProjectRelatedRoles.includes("Cluster Admin");

      const userDivisionId = userInfo.foundUser.division_id;
      const userId = userInfo.foundUser.user_id;
      const validDivisionIds = sectorData.flatMap((sector) => {
        const isUserLeader = sector.leader.some(
          (leader) => leader.user_id === userId
        );
        if (isUserLeader) {
          return sector.sector.Divisions.map((sector) => sector.division_id);
        }
        return [];
      });

      const filteredProjects = isClusterAdminRolePresent
        ? projectsData.filter((project) =>
            validDivisionIds.includes(project.division_id)
          )
        : isDepartmentAdminRolePresent
        ? projectsData.filter(
            (project) => project.division_id === userDivisionId
          )
        : projectsData;

      setProjects2(filteredProjects);

      const totalProjects = filteredProjects.length;
      const completedProjects = filteredProjects.filter(
        (project) => project.overall_progress === "Completed"
      ).length;
      const inProgressProjects = filteredProjects.filter(
        (project) => project.overall_progress === "On Progress"
      ).length;
      const pendingProjects = filteredProjects.filter(
        (project) => project.overall_progress === "Pending"
      ).length;

      const sortedResponse = filteredProjects.sort((a, b) => {
        if (a.createdAt > b.createdAt) {
          return -1;
        } else if (a.createdAt < b.createdAt) {
          return 1;
        }
        return 0;
      });

      const projectManagers = filteredProjects.map(
        (project) => project.project_manager
      );

      setProjects(sortedResponse);
      setTotalProjects(totalProjects);
      setCompletedProjects(completedProjects);
      setOnProgressProjects(inProgressProjects);
      setPendingProjects(pendingProjects);
      setProjectManagers(projectManagers);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching projects:", error);
      setLoading(false);
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

  const getStatusChip = (status) => {
    const colors = {
      Completed: {
        bg: alpha(theme.palette.success.main, 0.1),
        color: theme.palette.success.main,
      },
      "On Progress": {
        bg: alpha(theme.palette.warning.main, 0.1),
        color: theme.palette.warning.main,
      },
      Pending: {
        bg: alpha(theme.palette.info.main, 0.1),
        color: theme.palette.info.main,
      },
      Canceled: {
        bg: alpha(theme.palette.error.main, 0.1),
        color: theme.palette.error.main,
      },
    };

    const style = colors[status] || {
      bg: alpha(theme.palette.grey[500], 0.1),
      color: theme.palette.grey[500],
    };

    return (
      <Chip
        label={status}
        size="small"
        sx={{
          backgroundColor: style.bg,
          color: style.color,
          fontWeight: 600,
          border: `1px solid ${alpha(style.color, 0.2)}`,
        }}
      />
    );
  };

  const filterMilestoneActivities = (projectId) => {
    const project = projects2.find(
      (project) => project.project_id === projectId
    );
    if (project) {
      const milestoneActivities = project.activity.filter(
        (activity) => activity.is_milestone === true
      );
      setFilteredActivities(milestoneActivities);
    } else {
      setFilteredActivities([]);
    }
  };

  const handleProjectChange = (event) => {
    setSelectedProject2(event.target.value);
  };

  const filteredRows = projects.filter(
    (row) =>
      row.name && row.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const indexOfLastItem = currentPage * rowsPerPage;
  const indexOfFirstItem = indexOfLastItem - rowsPerPage;
  const currentItems = filteredRows.slice(indexOfFirstItem, indexOfLastItem);
  const pageCount = Math.ceil(filteredRows.length / rowsPerPage);

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
      value: completedProjects,
      color: theme.palette.success.main,
    },
    {
      label: "In Progress",
      value: onProgressProjects,
      color: theme.palette.warning.main,
    },
    {
      label: "Pending",
      value: pendingProjects,
      color: theme.palette.info.main,
    },
  ];

  const dropdownOptions = projects2.map((project) => ({
    value: project.project_id,
    label: project.name,
  }));

  useEffect(() => {
    if (selectedProject2 !== null) {
      filterMilestoneActivities(selectedProject2);
    }
  }, [selectedProject2]);

  useEffect(() => {
    fetchProjects();
  }, []);

  const statsCards = [
    {
      title: "Total Projects",
      value: totalProjects,
      icon: <ListAltIcon />,
      color: theme.palette.primary.main,
      subtitle: "All active projects",
    },
    {
      title: "Completed",
      value: completedProjects,
      icon: <ChecklistIcon />,
      color: theme.palette.success.main,
      subtitle: `${
        totalProjects > 0
          ? Math.round((completedProjects / totalProjects) * 100)
          : 0
      }% completion rate`,
    },
    {
      title: "In Progress",
      value: onProgressProjects,
      icon: <HistoryToggleOffIcon />,
      color: theme.palette.warning.main,
      subtitle: "Actively being worked on",
    },
    {
      title: "Pending",
      value: pendingProjects,
      icon: <TimelineOutlinedIcon />,
      color: theme.palette.info.main,
      subtitle: "Awaiting start",
    },
  ];

  // Prepare data for exports
  const dashboardStats = {
    totalProjects,
    completedProjects,
    onProgressProjects,
    pendingProjects,
    completionRate:
      totalProjects > 0
        ? Math.round((completedProjects / totalProjects) * 100)
        : 0,
  };

  // Calculate total and average budget
  const totalBudget = filteredRows.reduce((sum, project) => {
    const budget = parseFloat(project.budget) || 0;
    return sum + budget;
  }, 0);

  const avgBudget =
    filteredRows.length > 0 ? totalBudget / filteredRows.length : 0;

  // Calculate budget by status
  const budgetByStatus = {
    completed: filteredRows
      .filter((p) => p.overall_progress === "Completed")
      .reduce((sum, p) => sum + (parseFloat(p.budget) || 0), 0),
    inProgress: filteredRows
      .filter((p) => p.overall_progress === "On Progress")
      .reduce((sum, p) => sum + (parseFloat(p.budget) || 0), 0),
    pending: filteredRows
      .filter((p) => p.overall_progress === "Pending")
      .reduce((sum, p) => sum + (parseFloat(p.budget) || 0), 0),
  };

  const fullDashboardData = {
    projects: filteredRows,
    stats: dashboardStats,
    totalBudget,
    avgBudget,
    budgetByStatus,
    projectManagers,
    userInfo: userInfo.foundUser,
    selectedProject: selectedProject2,
    filteredActivities,
    formatBudget,
    getManagerNames,
  };

  // Prepare projects data with manager and budget
  const projectsData = filteredRows.map((project, index) => ({
    "Project Name": project.name || "",
    "Project ID": project.project_id?.slice(0, 8) + "..." || "",
    "Start Date": project.start_date
      ? new Date(project.start_date).toLocaleDateString()
      : "",
    "End Date": project.end_date
      ? new Date(project.end_date).toLocaleDateString()
      : "",
    "Budget (ETB)": project.budget ? formatBudget(project.budget) : "N/A",
    "Budget (Numeric)": parseFloat(project.budget) || 0,
    Manager: getManagerNames(project.project_manager),
    Department: project.division?.name || "N/A",
    Status: project.overall_progress || "",
    "Duration (Days)":
      project.start_date && project.end_date
        ? Math.ceil(
            (new Date(project.end_date) - new Date(project.start_date)) /
              (1000 * 60 * 60 * 24)
          )
        : 0,
  }));

  // Prepare milestone data
  const milestoneData = filteredActivities.map((activity, index) => {
    const calculateProgress = (startDate, endDate) => {
      if (!startDate || !endDate) return 0;
      const currentDate = new Date();
      const totalDuration = new Date(endDate) - new Date(startDate);
      const elapsedDuration = currentDate - new Date(startDate);
      const progress = Math.min(
        Math.max((elapsedDuration / totalDuration) * 100, 0),
        100
      );
      return progress.toFixed(1);
    };

    return {
      "Milestone Name": activity.name || "",
      "Start Date": activity.start_date
        ? new Date(activity.start_date).toLocaleDateString()
        : "",
      "End Date": activity.end_date
        ? new Date(activity.end_date).toLocaleDateString()
        : "",
      Status: activity.status || "",
      Progress: `${calculateProgress(activity.start_date, activity.end_date)}%`,
      "Is Milestone": activity.is_milestone ? "Yes" : "No",
    };
  });

  // Prepare statistics data
  const statisticsData = [
    ...chartData.map((item) => ({
      ...item,
      Percentage: `${
        totalProjects > 0 ? Math.round((item.value / totalProjects) * 100) : 0
      }%`,
      "Budget (ETB)": formatBudget(
        budgetByStatus[item.label.toLowerCase().replace(" ", "")] || 0
      ),
      "Budget %":
        totalBudget > 0
          ? `${Math.round(
              ((budgetByStatus[item.label.toLowerCase().replace(" ", "")] ||
                0) /
                totalBudget) *
                100
            )}%`
          : "0%",
    })),
  ];

  // Dashboard refs for full export
  const dashboardRefs = {
    Stats_Cards: statsCardsRef,
    All_Projects: projectsTableRef,
    Milestone_Progress: milestoneChartRef,
    Project_Statistics: projectStatsChartRef,
  };

  return (
    <Box className="ml-auto w-full  mt-6 mr-0 lg:mr-5 " ref={dashboardRef}>
      <Helmet>
        <title>Admin Dashboard - Project Management System</title>
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
                color: "#0A5077",
                mb: 1,
              }}
            >
              Admin Dashboard
            </Typography>
            <Typography variant="body1" sx={{ color: "text.secondary" }}>
              Overview of all projects and team performance
            </Typography>
          </Box>

          <ExportControls
            sectionName="Admin Dashboard"
            sectionRef={dashboardRef}
            sectionData={fullDashboardData}
            dashboardRefs={dashboardRefs}
            fullDashboardData={fullDashboardData}
            sectionType="admin"
            showFullExport={true}
            variant="group"
          />
        </Box>

        {/* Stats Cards */}
        <Box ref={statsCardsRef}>
          <Grid container spacing={3} sx={{ mb: 6 }}>
            {statsCards.map((stat, index) => (
              <Grid item xs={12} sm={6} md={3} key={index}>
                <StatCard
                  sx={{
                    "&::before": {
                      background: `linear-gradient(90deg, ${
                        stat.color
                      }, ${alpha(stat.color, 0.7)})`,
                    },
                  }}
                >
                  <CardContent sx={{ p: 3 }}>
                    <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                      <Box
                        sx={{
                          p: 1.5,
                          borderRadius: 2,
                          backgroundColor: alpha(stat.color, 0.1),
                          color: stat.color,
                          mr: 2,
                        }}
                      >
                        {stat.icon}
                      </Box>
                      <Box sx={{ flexGrow: 1 }}>
                        <Typography variant="body2" color="text.secondary">
                          {stat.title}
                        </Typography>
                        <Typography variant="h4" sx={{ fontWeight: 700 }}>
                          {stat.value}
                        </Typography>
                      </Box>
                    </Box>
                    <Typography variant="caption" color="text.secondary">
                      {stat.subtitle}
                    </Typography>
                  </CardContent>
                </StatCard>
              </Grid>
            ))}
          </Grid>
        </Box>

        {/* Projects Table */}
        <Paper
          elevation={0}
          sx={{
            borderRadius: 3,
            mb: 4,
            border: `1px solid ${theme.palette.divider}`,
            overflow: "hidden",
          }}
          ref={projectsTableRef}
        >
          <Box
            sx={{
              p: 3,
              backgroundColor: "background.paper",
              borderBottom: `1px solid ${theme.palette.divider}`,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: 2,
            }}
          >
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                All Projects
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Manage and monitor all projects
              </Typography>
            </Box>
            <Box
              sx={{
                display: "flex",
                gap: 2,
                flexWrap: "wrap",
                alignItems: "center",
              }}
            >
              <TextField
                size="small"
                placeholder="Search projects..."
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
              <FormControl size="small" sx={{ minWidth: 120 }}>
                <InputLabel>Rows</InputLabel>
                <Select
                  value={rowsPerPage}
                  onChange={handleRowsPerPageChange}
                  label="Rows"
                >
                  <MenuItem value={5}>5</MenuItem>
                  <MenuItem value={10}>10</MenuItem>
                  <MenuItem value={25}>25</MenuItem>
                </Select>
              </FormControl>

              <ExportControls
                sectionName="All Projects"
                sectionRef={projectsTableRef}
                sectionData={projectsData}
                sectionType="projects"
                variant="chip"
                size="small"
              />
            </Box>
          </Box>

          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <StyledTableCell>Project</StyledTableCell>
                  <StyledTableCell>Timeline</StyledTableCell>
                  <StyledTableCell>Budget</StyledTableCell>
                  <StyledTableCell>Manager</StyledTableCell>
                  <StyledTableCell>Department</StyledTableCell>
                  <StyledTableCell align="center">Status</StyledTableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {currentItems.length > 0 ? (
                  currentItems.map((project, index) => (
                    <StyledTableRow key={index}>
                      <StyledTableCell>
                        <Box sx={{ display: "flex", alignItems: "center" }}>
                          <Avatar
                            sx={{
                              width: 40,
                              height: 40,
                              bgcolor: getInitialsColor(project.name.charAt(0)),
                              mr: 2,
                              fontWeight: 600,
                            }}
                          >
                            {project.name.charAt(0).toUpperCase()}
                          </Avatar>
                          <Box>
                            <Typography
                              variant="body1"
                              sx={{ fontWeight: 600 }}
                            >
                              {project.name}
                            </Typography>
                            <Typography
                              variant="caption"
                              color="text.secondary"
                            >
                              ID: {project.project_id?.slice(0, 8)}...
                            </Typography>
                          </Box>
                        </Box>
                      </StyledTableCell>
                      <StyledTableCell>
                        <Box>
                          <Typography variant="body2">
                            {new Date(project.start_date).toLocaleDateString()}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            to {new Date(project.end_date).toLocaleDateString()}
                          </Typography>
                        </Box>
                      </StyledTableCell>
                      <StyledTableCell>
                        <Box sx={{ display: "flex", alignItems: "center" }}>
                          <AttachMoneyIcon
                            sx={{
                              fontSize: 16,
                              mr: 0.5,
                              color: "success.main",
                            }}
                          />
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>
                            {formatBudget(project.budget)} ETB
                          </Typography>
                        </Box>
                      </StyledTableCell>
                      <StyledTableCell>
                        <Box
                          sx={{ display: "flex", alignItems: "center", gap: 1 }}
                        >
                          <PeopleIcon
                            sx={{ fontSize: 16, color: "action.active" }}
                          />
                          <Typography variant="body2">
                            {getManagerNames(project.project_manager)}
                          </Typography>
                        </Box>
                      </StyledTableCell>
                      <StyledTableCell>
                        <Typography variant="body2">
                          {project.division?.name || "N/A"}
                        </Typography>
                      </StyledTableCell>
                      <StyledTableCell align="center">
                        {getStatusChip(project.overall_progress)}
                      </StyledTableCell>
                    </StyledTableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                      <Typography variant="body1" color="text.secondary">
                        No projects found
                      </Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>

          {filteredRows.length > 0 && (
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
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <Typography variant="body2" color="text.secondary">
                  Showing {indexOfFirstItem + 1}-
                  {Math.min(indexOfLastItem, filteredRows.length)} of{" "}
                  {filteredRows.length} projects
                </Typography>
                <Chip
                  size="small"
                  icon={<AttachMoneyIcon />}
                  label={`Total Budget: ${formatBudget(totalBudget)} ETB`}
                  color="success"
                  variant="outlined"
                />
              </Box>
              <Pagination
                count={pageCount}
                page={currentPage}
                onChange={handlePageChange}
                color="primary"
                size="small"
                showFirstButton
                showLastButton
              />
            </Box>
          )}
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
                  flexWrap: "wrap",
                  gap: 2,
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
                  <Box sx={{ flexGrow: 1 }}>
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      Milestone Progress
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Track milestone completion by project
                    </Typography>
                  </Box>
                </Box>

                <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                  <FormControl size="small" sx={{ minWidth: 200 }}>
                    <Select
                      value={selectedProject2 || ""}
                      onChange={handleProjectChange}
                      displayEmpty
                      renderValue={(selected) => {
                        if (!selected) {
                          return <em>Select a project</em>;
                        }
                        const project = projects2.find(
                          (p) => p.project_id === selected
                        );
                        return project?.name || selected;
                      }}
                    >
                      <MenuItem value="">
                        <em>Select a project</em>
                      </MenuItem>
                      {dropdownOptions.map((option) => (
                        <MenuItem key={option.value} value={option.value}>
                          {option.label}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>

                  <ExportControls
                    sectionName="Milestone Progress"
                    sectionRef={milestoneChartRef}
                    sectionData={milestoneData}
                    sectionType="milestones"
                    variant="chip"
                    size="small"
                  />
                </Box>
              </Box>

              {selectedProject2 && filteredActivities.length > 0 ? (
                <Box sx={{ height: 320 }}>
                  <BarChart
                    series={[
                      {
                        data: filteredActivities.map((activity) => {
                          const progress = (start_date, end_date) => {
                            const currentDate = new Date();
                            const totalDuration =
                              new Date(end_date) - new Date(start_date);
                            const elapsedDuration =
                              currentDate - new Date(start_date);
                            return Math.min(
                              Math.max(
                                (elapsedDuration / totalDuration) * 100,
                                0
                              ),
                              100
                            );
                          };
                          return parseInt(
                            progress(activity.start_date, activity.end_date)
                          );
                        }),
                        color: theme.palette.primary.main,
                        label: "Progress %",
                      },
                    ]}
                    height={320}
                    xAxis={[
                      {
                        data: filteredActivities.map(
                          (activity) => activity.name
                        ),
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
                        valueFormatter: (value) => `${value}%`,
                      },
                    ]}
                    margin={{ top: 20, bottom: 70, left: 40, right: 20 }}
                    grid={{ vertical: true }}
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
                    {selectedProject2
                      ? "No milestone data available"
                      : "Select a project to view milestones"}
                  </Typography>
                </Box>
              )}
            </Paper>
          </Grid>

          {/* Project Statistics Chart */}
          <Grid item xs={12} lg={4}>
            <Paper
              elevation={0}
              sx={{
                p: 3,
                borderRadius: 3,
                height: "100%",
                border: `1px solid ${theme.palette.divider}`,
              }}
              ref={projectStatsChartRef}
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
                      Project Statistics
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Distribution by status
                    </Typography>
                  </Box>
                </Box>

                <ExportControls
                  sectionName="Project Statistics"
                  sectionRef={projectStatsChartRef}
                  sectionData={statisticsData}
                  sectionType="statistics"
                  variant="chip"
                  size="small"
                />
              </Box>

              {totalProjects > 0 ? (
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
                          <Box>
                            <Typography
                              variant="body2"
                              sx={{ fontWeight: 500 }}
                            >
                              {item.label}
                            </Typography>
                            <Typography
                              variant="caption"
                              color="text.secondary"
                            >
                              {formatBudget(
                                budgetByStatus[
                                  item.label.toLowerCase().replace(" ", "")
                                ] || 0
                              )}{" "}
                              ETB
                            </Typography>
                          </Box>
                        </Box>
                        <Box
                          sx={{ display: "flex", alignItems: "center", gap: 1 }}
                        >
                          <Typography variant="h6" sx={{ fontWeight: 700 }}>
                            {item.value}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            (
                            {totalProjects > 0
                              ? Math.round((item.value / totalProjects) * 100)
                              : 0}
                            %)
                          </Typography>
                        </Box>
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
                    No project data available
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

export default AdminDashboard;
