import React from "react";
import { Card, CardContent, Typography, Box, useTheme } from "@mui/material";

export const ChartCard = ({
  title,
  subtitle,
  children,
  icon: Icon,
  action,
  height = 300,
}) => {
  const theme = useTheme();

  return (
    <Card
      sx={{
        height: "100%",
        borderRadius: 3,
        border: `1px solid ${theme.palette.divider}`,
        display: "flex",
        flexDirection: "column",
      }}
    >
      <CardContent
        sx={{ p: 3, flex: 1, display: "flex", flexDirection: "column" }}
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
            {Icon && (
              <Box
                sx={{
                  p: 1,
                  borderRadius: 2,
                  bgcolor: theme.palette.primary.light,
                  color: theme.palette.primary.main,
                  mr: 2,
                }}
              >
                <Icon />
              </Box>
            )}
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                {title}
              </Typography>
              {subtitle && (
                <Typography variant="body2" color="text.secondary">
                  {subtitle}
                </Typography>
              )}
            </Box>
          </Box>
          {action && <Box>{action}</Box>}
        </Box>

        <Box
          sx={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            minHeight: height,
          }}
        >
          {children}
        </Box>
      </CardContent>
    </Card>
  );
};
