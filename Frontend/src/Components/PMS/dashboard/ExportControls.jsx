import React from "react";
import {
  Box,
  Button,
  ButtonGroup,
  Menu,
  MenuItem,
  IconButton,
  Tooltip,
  useTheme,
  Chip,
  CircularProgress,
  Snackbar,
  Alert,
} from "@mui/material";
import {
  Download,
  PictureAsPdf,
  TableChart,
  Timeline,
  PieChart,
  GridOn,
  MoreVert,
  InsertChart,
  Dashboard as DashboardIcon,
  Assessment,
} from "@mui/icons-material";

import {
  exportToPDF,
  exportToExcel,
  exportToCSV,
  exportAdminDashboardToExcel,
  exportAdminProjectsToCSV,
} from "../../utils/exportUtils";

const ExportControls = ({
  // Section specific props
  sectionName = "Dashboard",
  sectionRef,
  sectionData,
  sectionType = "general", // 'general', 'admin', 'projects', 'tasks', 'milestones', 'statistics'

  // Dashboard wide props
  dashboardRefs = {},
  fullDashboardData = {},
  showFullExport = false,

  // Callbacks
  onExportStart,
  onExportComplete,
  onExportError,

  // Styling
  variant = "group", // 'group', 'menu', 'chip', 'icon'
  size = "medium",

  // Loading state
  loading: externalLoading = false,
}) => {
  const theme = useTheme();
  const [anchorEl, setAnchorEl] = React.useState(null);
  const [loading, setLoading] = React.useState(false);
  const [snackbar, setSnackbar] = React.useState({
    open: false,
    message: "",
    severity: "success",
  });

  const open = Boolean(anchorEl);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const showMessage = (message, severity = "success") => {
    setSnackbar({ open: true, message, severity });
  };

  const getFormattedDate = () => {
    return new Date().toISOString().split("T")[0];
  };

  const handleExport = async (format, scope = "section") => {
    try {
      setLoading(true);
      onExportStart?.(format, scope);

      const timestamp = getFormattedDate();
      const baseFileName = `${sectionName.replace(/\s+/g, "_")}_${timestamp}`;

      switch (format) {
        case "pdf":
          if (scope === "dashboard" && dashboardRefs) {
            await exportToPDF(
              sectionRef || dashboardRefs["dashboard"],
              `${sectionName}_Dashboard_Report`
            );
            showMessage(
              `${sectionName} Dashboard exported as PDF successfully!`
            );
          } else if (sectionRef) {
            await exportToPDF(sectionRef, `${sectionName}_${sectionType}`);
            showMessage(`${sectionName} exported as PDF successfully!`);
          }
          break;

        case "excel":
          if (scope === "dashboard" && fullDashboardData) {
            // Special handling for admin dashboard
            if (sectionType === "admin") {
              await exportAdminDashboardToExcel(
                fullDashboardData,
                `${sectionName}_Dashboard`
              );
              showMessage(
                `${sectionName} Dashboard exported as Excel with detailed sheets!`
              );
            } else {
              exportToExcel(
                sectionData || fullDashboardData,
                `${sectionName}_Dashboard`,
                sectionName
              );
              showMessage(
                `${sectionName} Dashboard exported as Excel successfully!`
              );
            }
          } else if (sectionData) {
            exportToExcel(
              sectionData,
              `${sectionName}_${sectionType}`,
              sectionName
            );
            showMessage(`${sectionName} exported as Excel successfully!`);
          }
          break;

        case "csv":
          if (scope === "dashboard" && fullDashboardData) {
            // Special handling for admin projects
            if (sectionType === "admin") {
              await exportAdminProjectsToCSV(
                fullDashboardData,
                `${sectionName}_Projects`
              );
              showMessage(
                `${sectionName} Projects exported as CSV with detailed data!`
              );
            } else {
              exportToCSV(
                sectionData || fullDashboardData,
                `${sectionName}_Data`
              );
              showMessage(
                `${sectionName} Dashboard exported as CSV successfully!`
              );
            }
          } else if (sectionData) {
            exportToCSV(sectionData, `${sectionName}_${sectionType}`);
            showMessage(`${sectionName} exported as CSV successfully!`);
          }
          break;

        default:
          break;
      }

      onExportComplete?.(format, scope);
    } catch (error) {
      console.error(`Error exporting ${format}:`, error);
      showMessage(`Error exporting ${format}: ${error.message}`, "error");
      onExportError?.(error, format, scope);
    } finally {
      setLoading(false);
      handleClose();
    }
  };

  const isLoading = loading || externalLoading;

  // Render based on variant
  const renderExportButtons = () => {
    if (variant === "chip") {
      return (
        <Chip
          icon={isLoading ? <CircularProgress size={16} /> : <Download />}
          label={isLoading ? "Exporting..." : "Export"}
          onClick={handleClick}
          variant="outlined"
          sx={{
            cursor: "pointer",
            "&:hover": {
              backgroundColor: theme.palette.action.hover,
            },
          }}
        />
      );
    }

    if (variant === "icon") {
      return (
        <IconButton
          onClick={handleClick}
          disabled={isLoading}
          sx={{
            border: `1px solid ${theme.palette.divider}`,
            borderRadius: 1,
          }}
        >
          {isLoading ? <CircularProgress size={20} /> : <Download />}
        </IconButton>
      );
    }

    if (variant === "menu") {
      return (
        <>
          <Button
            onClick={handleClick}
            startIcon={
              isLoading ? <CircularProgress size={20} /> : <Download />
            }
            disabled={isLoading}
            variant="contained"
            size={size}
          >
            {isLoading ? "Exporting..." : "Export"}
          </Button>
        </>
      );
    }

    // Default: group variant
    return (
      <ButtonGroup
        variant="contained"
        size={size}
        disabled={isLoading}
        sx={{
          "& .MuiButtonGroup-grouped": {
            borderColor: `${theme.palette.primary.main}30`,
          },
        }}
      >
        <Tooltip title="Export as PDF">
          <Button
            onClick={() => handleExport("pdf")}
            disabled={isLoading}
            startIcon={
              isLoading ? <CircularProgress size={16} /> : <PictureAsPdf />
            }
            sx={{
              bgcolor: theme.palette.error.main,
              "&:hover": {
                bgcolor: theme.palette.error.dark,
              },
              "&:disabled": {
                bgcolor: theme.palette.error.light,
              },
            }}
          >
            {isLoading ? "" : "PDF"}
          </Button>
        </Tooltip>

        <Tooltip title="Export as Excel">
          <Button
            onClick={() => handleExport("excel")}
            disabled={isLoading}
            startIcon={
              isLoading ? <CircularProgress size={16} /> : <TableChart />
            }
            sx={{
              bgcolor: theme.palette.success.main,
              "&:hover": {
                bgcolor: theme.palette.success.dark,
              },
              "&:disabled": {
                bgcolor: theme.palette.success.light,
              },
            }}
          >
            {isLoading ? "" : "Excel"}
          </Button>
        </Tooltip>

        <Tooltip title="Export as CSV">
          <Button
            onClick={() => handleExport("csv")}
            disabled={isLoading}
            startIcon={isLoading ? <CircularProgress size={16} /> : <GridOn />}
            sx={{
              bgcolor: theme.palette.info.main,
              "&:hover": {
                bgcolor: theme.palette.info.dark,
              },
              "&:disabled": {
                bgcolor: theme.palette.info.light,
              },
            }}
          >
            {isLoading ? "" : "CSV"}
          </Button>
        </Tooltip>
      </ButtonGroup>
    );
  };

  const getSectionIcon = () => {
    switch (sectionType) {
      case "admin":
        return <Assessment fontSize="small" />;
      case "projects":
        return <DashboardIcon fontSize="small" />;
      case "tasks":
        return <InsertChart fontSize="small" />;
      case "milestones":
        return <Timeline fontSize="small" />;
      case "statistics":
        return <PieChart fontSize="small" />;
      default:
        return <DashboardIcon fontSize="small" />;
    }
  };

  return (
    <>
      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
        {(variant === "chip" || variant === "icon" || variant === "menu") && (
          <Tooltip title="More export options">
            <IconButton
              onClick={handleClick}
              disabled={isLoading}
              sx={{
                border: `1px solid ${theme.palette.divider}`,
                borderRadius: 1,
              }}
            >
              <MoreVert />
            </IconButton>
          </Tooltip>
        )}
      </Box>

      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        PaperProps={{
          sx: {
            maxHeight: 400,
            width: 300,
          },
        }}
      >
        {/* Section specific exports */}
        <MenuItem onClick={() => handleExport("pdf")} disabled={isLoading}>
          <PictureAsPdf sx={{ mr: 1, color: theme.palette.error.main }} />
          Export {sectionName} as PDF
        </MenuItem>
        <MenuItem onClick={() => handleExport("excel")} disabled={isLoading}>
          <TableChart sx={{ mr: 1, color: theme.palette.success.main }} />
          Export {sectionName} as Excel
        </MenuItem>
        <MenuItem onClick={() => handleExport("csv")} disabled={isLoading}>
          <GridOn sx={{ mr: 1, color: theme.palette.info.main }} />
          Export {sectionName} as CSV
        </MenuItem>

        {/* Dashboard wide exports */}
        {showFullExport && (
          <>
            <MenuItem divider />
            <MenuItem
              onClick={() => handleExport("pdf", "dashboard")}
              disabled={isLoading}
            >
              <DashboardIcon
                sx={{ mr: 1, color: theme.palette.primary.main }}
              />
              Export Full Dashboard as PDF
            </MenuItem>
            <MenuItem
              onClick={() => handleExport("excel", "dashboard")}
              disabled={isLoading}
            >
              <InsertChart sx={{ mr: 1, color: theme.palette.warning.main }} />
              Export Full Dashboard as Excel
            </MenuItem>

            {/* Special admin dashboard exports */}
            {sectionType === "admin" && (
              <>
                <MenuItem divider />
                <MenuItem
                  onClick={() => handleExport("csv", "dashboard")}
                  disabled={isLoading}
                >
                  <Assessment sx={{ mr: 1, color: theme.palette.info.main }} />
                  Export Projects with Manager & Budget
                </MenuItem>
                <MenuItem
                  onClick={() => {
                    handleExport("excel", "dashboard");
                    handleClose();
                  }}
                  disabled={isLoading}
                >
                  <Assessment
                    sx={{ mr: 1, color: theme.palette.success.main }}
                  />
                  Export Detailed Admin Report
                </MenuItem>
              </>
            )}
          </>
        )}
      </Menu>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
};

ExportControls.defaultProps = {
  sectionType: "general",
  variant: "group",
  size: "medium",
  showFullExport: false,
  loading: false,
};

export default ExportControls;
