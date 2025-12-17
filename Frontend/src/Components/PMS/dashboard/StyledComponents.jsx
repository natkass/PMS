import React from "react";
import {
  TableCell,
  TableRow,
  styled,
  tableCellClasses,
  Typography,
} from "@mui/material";

// Styled Table Cell
export const StyledTableCell = styled(TableCell)(({ theme }) => ({
  [`&.${tableCellClasses.head}`]: {
    backgroundColor: theme.palette.primary.main,
    color: theme.palette.common.white,
    fontSize: 14,
    fontWeight: 600,
    padding: theme.spacing(1.5),
  },
  [`&.${tableCellClasses.body}`]: {
    fontSize: 14,
    padding: theme.spacing(1.5),
  },
}));

// Styled Table Row
export const StyledTableRow = styled(TableRow)(({ theme }) => ({
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

// Progress Bar Component
export const ProgressBar = styled("div", {
  shouldForwardProp: (prop) => prop !== "progress" && prop !== "color",
})(({ theme, progress, color }) => ({
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

// Additional styled components you might need

// Stat Card Container
export const StatCardContainer = styled("div")(({ theme }) => ({
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
  gap: theme.spacing(3),
  marginBottom: theme.spacing(4),
}));

// Dashboard Section
export const DashboardSection = styled("section")(({ theme }) => ({
  marginBottom: theme.spacing(6),
  padding: theme.spacing(3),
  backgroundColor: theme.palette.background.paper,
  borderRadius: theme.spacing(2),
  boxShadow: theme.shadows[1],
}));

// Section Header
export const SectionHeader = styled("div")(({ theme }) => ({
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  marginBottom: theme.spacing(3),
  paddingBottom: theme.spacing(2),
  borderBottom: `1px solid ${theme.palette.divider}`,
}));

// Status Badge
export const StatusBadge = styled("span", {
  shouldForwardProp: (prop) => prop !== "status" && prop !== "color",
})(({ theme, status, color }) => ({
  display: "inline-flex",
  alignItems: "center",
  padding: `${theme.spacing(0.5)} ${theme.spacing(1.5)}`,
  borderRadius: theme.spacing(1),
  backgroundColor: color ? `${color}15` : theme.palette.grey[100],
  color: color || theme.palette.text.primary,
  fontSize: "0.75rem",
  fontWeight: 600,
  "&::before": {
    content: '""',
    display: "inline-block",
    width: 8,
    height: 8,
    borderRadius: "50%",
    backgroundColor: color || theme.palette.grey[500],
    marginRight: theme.spacing(0.5),
  },
}));

// Metric Value
export const MetricValue = styled(Typography)(({ theme }) => ({
  fontSize: "2rem",
  fontWeight: 700,
  color: theme.palette.primary.main,
  margin: 0,
}));

// Metric Label
export const MetricLabel = styled(Typography)(({ theme }) => ({
  fontSize: "0.875rem",
  color: theme.palette.text.secondary,
  margin: 0,
}));

// Icon Wrapper
export const IconWrapper = styled("div", {
  shouldForwardProp: (prop) => prop !== "color",
})(({ theme, color }) => ({
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  width: 48,
  height: 48,
  borderRadius: theme.spacing(1.5),
  backgroundColor: color ? `${color}15` : theme.palette.primary.light,
  color: color || theme.palette.primary.main,
  marginRight: theme.spacing(2),
}));

// Filter Container
export const FilterContainer = styled("div")(({ theme }) => ({
  display: "flex",
  gap: theme.spacing(2),
  marginBottom: theme.spacing(3),
  padding: theme.spacing(2),
  backgroundColor: theme.palette.background.default,
  borderRadius: theme.spacing(1),
}));
