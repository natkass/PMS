import React from "react";
import { Card, CardContent, Typography, Box, alpha } from "@mui/material";
import { styled } from "@mui/material/styles";

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

export const DashboardStatCard = ({
  title,
  value,
  icon: Icon,
  color,
  trendText,
  trendIcon: TrendIcon,
  theme,
}) => {
  return (
    <StatCard>
      <CardContent sx={{ p: 3 }}>
        <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
          <Box
            sx={{
              p: 1.5,
              borderRadius: 2,
              backgroundColor: alpha(color, 0.1),
              color: color,
              mr: 2,
            }}
          >
            <Icon />
          </Box>
          <Box>
            <Typography variant="body2" color="text.secondary">
              {title}
            </Typography>
            <Typography variant="h4" sx={{ fontWeight: 700 }}>
              {value}
            </Typography>
          </Box>
        </Box>
        {trendText && (
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            {TrendIcon && (
              <TrendIcon
                sx={{
                  color: TrendIcon ? "success.main" : "text.secondary",
                  fontSize: 16,
                }}
              />
            )}
            <Typography
              variant="caption"
              color={TrendIcon ? "success.main" : "text.secondary"}
            >
              {trendText}
            </Typography>
          </Box>
        )}
      </CardContent>
    </StatCard>
  );
};

DashboardStatCard.defaultProps = {
  theme: null,
  trendIcon: null,
};
