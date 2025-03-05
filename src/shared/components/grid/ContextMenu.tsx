import React, { useState } from "react";
import {
  Paper,
  MenuList,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Typography,
  Divider,
  Box,
} from "@mui/material";
import TimelineIcon from "@mui/icons-material/Timeline";
import BarChartIcon from "@mui/icons-material/BarChart";
import PieChartIcon from "@mui/icons-material/PieChart";
import AreaChartIcon from "@mui/icons-material/StackedLineChart";
import ScatterPlotIcon from "@mui/icons-material/BubbleChart";
import AddBoxIcon from "@mui/icons-material/AddBox";
import PublicIcon from "@mui/icons-material/Public";
import { Chart } from "../../types/chart";
import { useIsomorphicLayoutEffect } from "../../hooks/useIsomorphicLayoutEffect";

interface ContextMenuProps {
  position: { x: number; y: number };
  onSelectChart: (chartType: Chart) => void;
  onClose: () => void;
}

// Map of chart types to their icons
const chartIcons = {
  [Chart.Line]: <TimelineIcon />,
  [Chart.Bar]: <BarChartIcon />,
  [Chart.Pie]: <PieChartIcon />,
  [Chart.Area]: <AreaChartIcon />,
  [Chart.Scatter]: <ScatterPlotIcon />,
  [Chart.Map]: <PublicIcon />,
};

const chartTypes = [
  { label: "Line Chart", type: Chart.Line, icon: <TimelineIcon /> },
  { label: "Bar Chart", type: Chart.Bar, icon: <BarChartIcon /> },
  { label: "Pie Chart", type: Chart.Pie, icon: <PieChartIcon /> },
  { label: "Area Chart", type: Chart.Area, icon: <AreaChartIcon /> },
  { label: "Scatter Chart", type: Chart.Scatter, icon: <ScatterPlotIcon /> },
  { label: "Map Chart", type: Chart.Map, icon: <PublicIcon /> }, // Add Map option
];

export const ContextMenu: React.FC<ContextMenuProps> = ({
  position,
  onSelectChart,
  onClose,
}) => {
  // State to track adjusted position
  const [menuPosition, setMenuPosition] = useState(position);
  const menuWidth = 200;
  const menuHeight = 250; // Approximate height of the menu

  // Adjust menu position when it would go off-screen - use layout effect for smoother positioning
  useIsomorphicLayoutEffect(() => {
    if (typeof window === "undefined") return;

    // Get viewport dimensions
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    // Calculate adjusted position - all in one synchronous operation
    // to avoid any flickering or visual jumps
    let adjustedX = position.x;
    let adjustedY = position.y;

    // Adjust X if needed
    if (position.x + menuWidth > viewportWidth) {
      adjustedX = viewportWidth - menuWidth - 10; // 10px padding
    }

    // Adjust Y if needed
    if (position.y + menuHeight > viewportHeight) {
      adjustedY = position.y - menuHeight; // Show above the cursor

      // If that would put it above the viewport, cap at top of viewport
      if (adjustedY < 0) {
        adjustedY = 10; // 10px from top
      }
    }

    setMenuPosition({ x: adjustedX, y: adjustedY });
  }, [position]);

  // Handle chart selection
  const handleSelectChart = (chart: Chart) => {
    onSelectChart(chart);
  };

  return (
    <Box
      sx={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 1300,
      }}
      onClick={onClose}
    >
      <Paper
        sx={{
          position: "absolute",
          top: menuPosition.y,
          left: menuPosition.x,
          borderRadius: 1,
          boxShadow: 3,
          zIndex: 1400,
          width: menuWidth,
          overflow: "hidden",
          transform: "translateZ(0)", // Hardware acceleration
          willChange: "transform", // Optimize for animation
        }}
      >
        {/* Menu header */}
        <Box p={1} bgcolor="primary.main" color="white">
          <Typography variant="subtitle2">
            <AddBoxIcon
              fontSize="small"
              sx={{ verticalAlign: "middle", mr: 1 }}
            />
            Add Chart
          </Typography>
        </Box>
        <Divider />

        {/* Menu items */}
        <MenuList dense>
          {chartTypes.map((chart) => (
            <MenuItem
              key={chart.type}
              onClick={(e) => {
                e.stopPropagation();
                handleSelectChart(chart.type);
              }}
            >
              <ListItemIcon>{chart.icon}</ListItemIcon>
              <ListItemText>{chart.label}</ListItemText>
            </MenuItem>
          ))}
        </MenuList>
      </Paper>
    </Box>
  );
};
