import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

// ============ PDF EXPORT FUNCTIONS ============

// PDF Export for entire dashboard (Home Dashboard)
export const exportToPDF = async (elementRef, fileName = "export") => {
  try {
    const element = elementRef.current || elementRef;
    if (!element) {
      console.error("No element found for PDF export");
      return;
    }

    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      logging: false,
      backgroundColor: "#ffffff",
    });

    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF("p", "mm", "a4");

    const imgWidth = 210; // A4 width in mm
    const pageHeight = 295; // A4 height in mm
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    let heightLeft = imgHeight;
    let position = 0;

    pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;

    while (heightLeft >= 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
    }

    pdf.save(`${fileName}_${getFormattedDate()}.pdf`);
  } catch (error) {
    console.error("Error generating PDF:", error);
  }
};

// Export section to PDF (alias for exportToPDF)
export const exportSectionToPDF = exportToPDF;

// Export dashboard to PDF (alias for exportToPDF)
export const exportDashboardToPDF = exportToPDF;

// ============ EXCEL EXPORT FUNCTIONS ============

export const exportToExcel = (
  data,
  fileName = "export",
  sheetName = "Data"
) => {
  try {
    const workbook = XLSX.utils.book_new();

    // If data is an array of arrays (multiple sheets)
    if (Array.isArray(data) && data[0] && Array.isArray(data[0])) {
      data.forEach((sheetData, index) => {
        const worksheet = XLSX.utils.aoa_to_sheet(sheetData);
        XLSX.utils.book_append_sheet(
          workbook,
          worksheet,
          `${sheetName}_${index + 1}`
        );
      });
    } else {
      // Single sheet
      const worksheet = XLSX.utils.json_to_sheet(data);
      XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
    }

    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });
    const blob = new Blob([excelBuffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });

    saveAs(blob, `${fileName}_${getFormattedDate()}.xlsx`);
  } catch (error) {
    console.error("Error generating Excel:", error);
  }
};

// ============ CSV EXPORT FUNCTIONS ============

export const exportToCSV = (data, fileName = "export") => {
  try {
    let csvContent = "";

    if (Array.isArray(data) && data.length > 0) {
      // Extract headers
      const headers = Object.keys(data[0]);
      csvContent += headers.join(",") + "\n";

      // Add rows
      data.forEach((item) => {
        const row = headers
          .map((header) => {
            const cell = item[header];
            return typeof cell === "string" ? `"${cell}"` : cell;
          })
          .join(",");
        csvContent += row + "\n";
      });
    }

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    saveAs(blob, `${fileName}_${getFormattedDate()}.csv`);
  } catch (error) {
    console.error("Error generating CSV:", error);
  }
};

// ============ DATA PREPARATION FUNCTIONS ============

// Home Dashboard Data Preparation
export const prepareDashboardData = (dashboardData) => {
  const {
    projects = [],
    allSubTasks = [],
    filteredProjects2 = [],
    projectsAssigned = [],
    stats = {},
  } = dashboardData;

  // Prepare summary data
  const summaryData = [
    ["Dashboard Summary", ""],
    ["Generated On", new Date().toLocaleString()],
    ["", ""],
    ["Key Metrics", "Value"],
    ["Total Projects", stats.totalProjects || 0],
    ["Completed Projects", stats.completedProjects || 0],
    ["Projects In Progress", stats.onProgressProjects || 0],
    ["Total Tasks", stats.totalSubtasks || 0],
    ["Completed Tasks", stats.completedSubtasks || 0],
    ["Tasks In Progress", stats.inProgressSubtasks || 0],
    ["Pending Tasks", stats.pendingSubtasks || 0],
  ];

  // Prepare projects data
  const projectsData = projectsAssigned.map((project) => ({
    "Project Name": project.name,
    "Start Date": new Date(project.start_date).toLocaleDateString(),
    "End Date": new Date(project.end_date).toLocaleDateString(),
    Status: project.overall_progress,
    Progress: `${project.progress || 0}%`,
  }));

  // Prepare tasks data
  const tasksData = allSubTasks.map((task) => ({
    "Task Name": task.name,
    Project: task.projectName,
    "Start Date": new Date(task.start_date).toLocaleDateString(),
    "Due Date": new Date(task.end_date).toLocaleDateString(),
    Status: task.subtask_status,
    Progress: `${calculateProgress(task.start_date, task.end_date)}%`,
  }));

  // Prepare upcoming deadlines data
  const upcomingData = filteredProjects2.map((task) => ({
    "Task Name": task.name,
    Project: task.projectName,
    "Due Date": new Date(task.end_date).toLocaleDateString(),
    "Days Remaining": Math.ceil(
      (new Date(task.end_date) - new Date()) / (1000 * 60 * 60 * 24)
    ),
  }));

  return {
    summary: summaryData,
    projects: projectsData,
    tasks: tasksData,
    upcoming: upcomingData,
    raw: {
      summaryData,
      projectsData,
      tasksData,
      upcomingData,
    },
  };
};

// Project Dashboard Data Preparation
export const prepareProjectDashboardData = (dashboardData) => {
  const {
    activities = [],
    tasks = [],
    stats = {},
    projectInfo = {},
    activityLength = 0,
    totalTasks = 0,
    totalSubTasks = 0,
    completedTasks = [],
    onProgressTasks = [],
    pendingTask = [],
  } = dashboardData;

  // Calculate completion rate
  const completionRate =
    totalTasks > 0 ? Math.round((completedTasks.length / totalTasks) * 100) : 0;

  // Prepare summary data
  const summaryData = [
    ["Project Dashboard Summary", ""],
    ["Generated On", new Date().toLocaleString()],
    ["Project Name", projectInfo.name || "N/A"],
    ["Project ID", projectInfo.project_id || "N/A"],
    ["", ""],
    ["Key Metrics", "Value"],
    ["Total Activities", activityLength || 0],
    ["Total Tasks", totalTasks || 0],
    ["Total Sub Tasks", totalSubTasks || 0],
    ["Completed Tasks", completedTasks.length || 0],
    ["In Progress Tasks", onProgressTasks.length || 0],
    ["Pending Tasks", pendingTask.length || 0],
    ["Completion Rate", `${completionRate}%`],
  ];

  // Prepare tasks data
  const tasksData = tasks.map((task) => ({
    "Task Name": task.name || "",
    "Start Date": task.start_date
      ? new Date(task.start_date).toLocaleDateString()
      : "",
    "Due Date": task.end_date
      ? new Date(task.end_date).toLocaleDateString()
      : "",
    Status: task.task_status || "",
    Progress: `${calculateProgress(task.start_date, task.end_date)}%`,
  }));

  // Prepare activities/milestones data
  const activitiesData = activities.map((activity) => ({
    "Activity Name": activity.activity?.name || "",
    "Start Date": activity.activity?.start_date
      ? new Date(activity.activity.start_date).toLocaleDateString()
      : "",
    "End Date": activity.activity?.end_date
      ? new Date(activity.activity.end_date).toLocaleDateString()
      : "",
    Status: activity.activity?.status || "",
    "Is Milestone": activity.activity?.is_milestone ? "Yes" : "No",
    "Task Count": activity.Tasklength || 0,
    "Sub Task Count": activity.sub_tasks_length || 0,
  }));

  // Prepare task distribution data
  const distributionData = [
    ["Task Distribution", "Count"],
    ["Completed", completedTasks.length || 0],
    ["In Progress", onProgressTasks.length || 0],
    ["Pending", pendingTask.length || 0],
  ];

  return {
    summary: summaryData,
    tasks: tasksData,
    activities: activitiesData,
    distribution: distributionData,
    raw: {
      summaryData,
      tasksData,
      activitiesData,
      distributionData,
    },
  };
};

// Generic Functions (Compatible with both dashboards)

export const prepareTasksData = (tasks, projectNameField = "projectName") => {
  return tasks.map((task) => ({
    "Task Name": task.name || "",
    Project: task[projectNameField] || "",
    "Start Date": task.start_date
      ? new Date(task.start_date).toLocaleDateString()
      : "",
    "Due Date": task.end_date
      ? new Date(task.end_date).toLocaleDateString()
      : "",
    Status: task.subtask_status || task.task_status || "",
    Progress: `${calculateProgress(task.start_date, task.end_date)}%`,
  }));
};

export const prepareProjectsData = (projects) => {
  return projects.map((project) => ({
    "Project Name": project.name || "",
    "Start Date": project.start_date
      ? new Date(project.start_date).toLocaleDateString()
      : "",
    "End Date": project.end_date
      ? new Date(project.end_date).toLocaleDateString()
      : "",
    Status: project.overall_progress || project.status || "",
    Progress: `${project.progress || 0}%`,
  }));
};

export const prepareUpcomingTasksData = (
  tasks,
  projectNameField = "projectName"
) => {
  // Filter tasks due in the next 30 days
  const upcomingTasks = tasks.filter((task) => {
    if (!task.end_date) return false;
    const dueDate = new Date(task.end_date);
    const today = new Date();
    const daysUntilDue = Math.ceil((dueDate - today) / (1000 * 60 * 60 * 24));
    return daysUntilDue > 0 && daysUntilDue <= 30;
  });

  return upcomingTasks.map((task) => ({
    "Task Name": task.name || "",
    Project: task[projectNameField] || "",
    "Due Date": task.end_date
      ? new Date(task.end_date).toLocaleDateString()
      : "",
    "Days Remaining": Math.ceil(
      (new Date(task.end_date) - new Date()) / (1000 * 60 * 60 * 24)
    ),
    Status: task.subtask_status || task.task_status || "",
  }));
};

// Alias for backward compatibility
export const prepareFullDashboardData = prepareDashboardData;

// ============ HELPER FUNCTIONS ============

const getFormattedDate = () => {
  return new Date().toISOString().split("T")[0];
};

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

// ============ EXPORT FOR BOTH DASHBOARDS ============

// Unified function that works for both dashboards
export const prepareDataForExport = (data, dashboardType = "home") => {
  if (dashboardType === "project") {
    return prepareProjectDashboardData(data);
  }
  return prepareDashboardData(data);
};

// Unified export function
export const exportDashboard = {
  pdf: exportToPDF,
  excel: exportToExcel,
  csv: exportToCSV,
  prepare: {
    home: prepareDashboardData,
    project: prepareProjectDashboardData,
    tasks: prepareTasksData,
    projects: prepareProjectsData,
    upcoming: prepareUpcomingTasksData,
  },
};

export const prepareAdminDashboardData = (dashboardData) => {
  const {
    projects = [],
    stats = {},
    totalBudget = 0,
    avgBudget = 0,
    projectManagers = [],
    userInfo = {},
    selectedProject = null,
    filteredActivities = [],
  } = dashboardData;

  // Get selected project name
  const selectedProjectName = selectedProject
    ? projects.find((p) => p.project_id === selectedProject)?.name || "N/A"
    : "N/A";

  // Calculate budget by status
  const budgetByStatus = {
    completed: projects
      .filter((p) => p.overall_progress === "Completed")
      .reduce((sum, p) => sum + (parseFloat(p.budget) || 0), 0),
    inProgress: projects
      .filter((p) => p.overall_progress === "On Progress")
      .reduce((sum, p) => sum + (parseFloat(p.budget) || 0), 0),
    pending: projects
      .filter((p) => p.overall_progress === "Pending")
      .reduce((sum, p) => sum + (parseFloat(p.budget) || 0), 0),
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

  // Helper function to get manager names
  const getManagerNames = (managers) => {
    if (!managers || !Array.isArray(managers)) return "N/A";

    const names = managers
      .filter((manager) => manager && manager.UserRoleToUser)
      .map((manager) => manager.UserRoleToUser.full_name || "Unnamed Manager")
      .filter((name) => name !== "Unnamed Manager");

    return names.length > 0 ? names.join(", ") : "N/A";
  };

  // Prepare summary data
  const summaryData = [
    ["ADMIN DASHBOARD SUMMARY REPORT", ""],
    ["Generated On", new Date().toLocaleString()],
    ["", ""],
    ["ADMINISTRATOR INFORMATION", ""],
    ["Admin Name", userInfo.full_name || "N/A"],
    ["Email", userInfo.email || "N/A"],
    ["Roles", userInfo.Roles?.map((role) => role.name).join(", ") || "N/A"],
    ["", ""],
    ["DASHBOARD OVERVIEW", ""],
    ["Total Projects", stats.totalProjects || 0],
    ["Completed Projects", stats.completedProjects || 0],
    ["Projects In Progress", stats.onProgressProjects || 0],
    ["Pending Projects", stats.pendingProjects || 0],
    ["Overall Completion Rate", `${stats.completionRate || 0}%`],
    ["Selected Project for Milestones", selectedProjectName],
    ["Milestones in Selected Project", filteredActivities.length],
    ["", ""],
    ["BUDGET SUMMARY", ""],
    ["Total Budget (All Projects)", `${formatBudget(totalBudget)} ETB`],
    ["Average Budget per Project", `${formatBudget(avgBudget)} ETB`],
    [
      "Completed Projects Budget",
      `${formatBudget(budgetByStatus.completed)} ETB`,
    ],
    [
      "In Progress Projects Budget",
      `${formatBudget(budgetByStatus.inProgress)} ETB`,
    ],
    ["Pending Projects Budget", `${formatBudget(budgetByStatus.pending)} ETB`],
  ];

  // Prepare projects data with manager and budget
  const projectsData = projects.map((project, index) => {
    const budget = parseFloat(project.budget) || 0;
    const duration =
      project.start_date && project.end_date
        ? Math.ceil(
            (new Date(project.end_date) - new Date(project.start_date)) /
              (1000 * 60 * 60 * 24)
          )
        : 0;

    return {
      "Project Name": project.name || "",
      "Project ID": project.project_id || "",
      "Short ID": project.project_id?.slice(0, 8) + "..." || "",
      "Start Date": project.start_date
        ? new Date(project.start_date).toLocaleDateString()
        : "",
      "End Date": project.end_date
        ? new Date(project.end_date).toLocaleDateString()
        : "",
      "Duration (Days)": duration,
      "Budget (ETB)": formatBudget(budget),
      "Budget (Numeric)": budget,
      "Manager(s)": getManagerNames(project.project_manager),
      Department: project.division?.name || "N/A",
      Status: project.overall_progress || "",
      "Budget Percentage":
        totalBudget > 0
          ? `${((budget / totalBudget) * 100).toFixed(2)}%`
          : "0%",
      "Created Date": project.createdAt
        ? new Date(project.createdAt).toLocaleDateString()
        : "",
    };
  });

  // Prepare detailed projects data for Excel
  const projectsDetailedData = [
    ["PROJECTS DETAILED REPORT", "", "", "", "", "", "", "", "", "", "", ""],
    [
      "Project Name",
      "Project ID",
      "Start Date",
      "End Date",
      "Duration (Days)",
      "Budget (ETB)",
      "Budget (Numeric)",
      "Manager(s)",
      "Department",
      "Status",
      "Budget %",
      "Created Date",
    ],
    ...projects.map((project) => {
      const budget = parseFloat(project.budget) || 0;
      const duration =
        project.start_date && project.end_date
          ? Math.ceil(
              (new Date(project.end_date) - new Date(project.start_date)) /
                (1000 * 60 * 60 * 24)
            )
          : 0;

      return [
        project.name || "",
        project.project_id || "",
        project.start_date
          ? new Date(project.start_date).toLocaleDateString()
          : "",
        project.end_date ? new Date(project.end_date).toLocaleDateString() : "",
        duration,
        formatBudget(budget),
        budget,
        getManagerNames(project.project_manager),
        project.division?.name || "N/A",
        project.overall_progress || "",
        totalBudget > 0
          ? `${((budget / totalBudget) * 100).toFixed(2)}%`
          : "0%",
        project.createdAt
          ? new Date(project.createdAt).toLocaleDateString()
          : "",
      ];
    }),
  ];

  // Prepare milestone data
  const milestoneData = filteredActivities.map((activity, index) => ({
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
    "Duration (Days)":
      activity.start_date && activity.end_date
        ? Math.ceil(
            (new Date(activity.end_date) - new Date(activity.start_date)) /
              (1000 * 60 * 60 * 24)
          )
        : 0,
  }));

  // Prepare project statistics data
  const projectStatsData = [
    [
      "PROJECT STATISTICS BY STATUS",
      "Count",
      "Percentage",
      "Budget (ETB)",
      "Budget %",
    ],
    [
      "Completed",
      stats.completedProjects || 0,
      stats.totalProjects > 0
        ? `${Math.round(
            (stats.completedProjects / stats.totalProjects) * 100
          )}%`
        : "0%",
      formatBudget(budgetByStatus.completed),
      totalBudget > 0
        ? `${Math.round((budgetByStatus.completed / totalBudget) * 100)}%`
        : "0%",
    ],
    [
      "In Progress",
      stats.onProgressProjects || 0,
      stats.totalProjects > 0
        ? `${Math.round(
            (stats.onProgressProjects / stats.totalProjects) * 100
          )}%`
        : "0%",
      formatBudget(budgetByStatus.inProgress),
      totalBudget > 0
        ? `${Math.round((budgetByStatus.inProgress / totalBudget) * 100)}%`
        : "0%",
    ],
    [
      "Pending",
      stats.pendingProjects || 0,
      stats.totalProjects > 0
        ? `${Math.round((stats.pendingProjects / stats.totalProjects) * 100)}%`
        : "0%",
      formatBudget(budgetByStatus.pending),
      totalBudget > 0
        ? `${Math.round((budgetByStatus.pending / totalBudget) * 100)}%`
        : "0%",
    ],
    [
      "TOTAL",
      stats.totalProjects || 0,
      "100%",
      formatBudget(totalBudget),
      "100%",
    ],
  ];

  // Prepare manager statistics
  const uniqueManagers = new Set();
  projects.forEach((project) => {
    if (project.project_manager && Array.isArray(project.project_manager)) {
      project.project_manager.forEach((manager) => {
        if (
          manager &&
          manager.UserRoleToUser &&
          manager.UserRoleToUser.full_name
        ) {
          uniqueManagers.add(manager.UserRoleToUser.full_name);
        }
      });
    }
  });

  const managerStatsData = [
    [
      "MANAGER STATISTICS",
      "Project Count",
      "Total Budget (ETB)",
      "Average Budget (ETB)",
    ],
    [
      "Total Unique Managers",
      uniqueManagers.size,
      formatBudget(totalBudget),
      formatBudget(avgBudget),
    ],
  ];

  return {
    summary: summaryData,
    projects: projectsData,
    projectsDetailed: projectsDetailedData,
    milestones: milestoneData,
    statistics: projectStatsData,
    managers: managerStatsData,
    raw: {
      summaryData,
      projectsData,
      projectsDetailedData,
      milestoneData,
      projectStatsData,
      managerStatsData,
    },
  };
};

// Enhanced Excel export function for admin dashboard
export const exportAdminDashboardToExcel = (
  dashboardData,
  fileName = "admin_dashboard"
) => {
  try {
    const data = prepareAdminDashboardData(dashboardData);
    const workbook = XLSX.utils.book_new();

    // Add summary sheet
    const summarySheet = XLSX.utils.aoa_to_sheet(data.summary);
    XLSX.utils.book_append_sheet(workbook, summarySheet, "Summary");

    // Add projects detailed sheet
    const projectsSheet = XLSX.utils.aoa_to_sheet(data.projectsDetailed);
    XLSX.utils.book_append_sheet(workbook, projectsSheet, "Projects");

    // Add statistics sheet
    const statsSheet = XLSX.utils.aoa_to_sheet(data.statistics);
    XLSX.utils.book_append_sheet(workbook, statsSheet, "Statistics");

    // Add manager statistics sheet
    const managersSheet = XLSX.utils.aoa_to_sheet(data.managers);
    XLSX.utils.book_append_sheet(workbook, managersSheet, "Managers");

    // Add milestones sheet if available
    if (data.milestones.length > 0) {
      const milestonesSheet = XLSX.utils.json_to_sheet(data.milestones);
      XLSX.utils.book_append_sheet(workbook, milestonesSheet, "Milestones");
    }

    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });
    const blob = new Blob([excelBuffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });

    saveAs(blob, `${fileName}_${getFormattedDate()}.xlsx`);
  } catch (error) {
    console.error("Error generating Excel:", error);
    throw error;
  }
};

// Enhanced CSV export for projects with manager and budget
export const exportAdminProjectsToCSV = (
  dashboardData,
  fileName = "admin_projects"
) => {
  try {
    const data = prepareAdminDashboardData(dashboardData);

    // Export projects data as CSV
    const csvContent = data.projectsDetailed
      .map((row) => row.join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    saveAs(blob, `${fileName}_${getFormattedDate()}.csv`);
  } catch (error) {
    console.error("Error generating CSV:", error);
    throw error;
  }
};
