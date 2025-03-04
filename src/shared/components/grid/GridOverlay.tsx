import React from "react";
import { Box, Typography, Paper } from "@mui/material";
import MouseIcon from "@mui/icons-material/Mouse";

interface GridOverlayProps {
  visible: boolean;
  hasCharts: boolean;
}

export const GridOverlay: React.FC<GridOverlayProps> = ({
  visible,
  hasCharts,
}) => {
  if (!visible) return null;

  return (
    <Box
      sx={{
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        pointerEvents: "none", // Allow clicking through the overlay
        opacity: hasCharts ? 0.3 : 0.9,
        transition: "opacity 0.3s ease-in-out",
      }}
    >
      <Paper
        elevation={0}
        sx={{
          padding: 3,
          borderRadius: 2,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          backgroundColor: "rgba(255, 255, 255, 0.8)",
          backdropFilter: "blur(4px)",
          border: "1px dashed #ccc",
          maxWidth: 400,
        }}
      >
        <MouseIcon
          color="primary"
          fontSize="large"
          sx={{
            mb: 1,
            animation: "pulse 1.5s infinite",
            "@keyframes pulse": {
              "0%": { transform: "scale(1)" },
              "50%": { transform: "scale(1.1)" },
              "100%": { transform: "scale(1)" },
            },
          }}
        />
        <Typography variant="h6" gutterBottom align="center">
          Right-click anywhere to add a chart
        </Typography>
        <Typography variant="body2" color="text.secondary" align="center">
          {hasCharts
            ? "Drag charts to reposition them, or use the handles to resize"
            : "Create your first chart to begin visualizing the data"}
        </Typography>
      </Paper>
    </Box>
  );
};
