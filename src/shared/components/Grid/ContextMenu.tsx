import React, { useState } from "react";
import {
  Paper,
  MenuList,
  MenuItem,
  ListItemIcon,
  ListItemText,
} from "@mui/material";
import TimelineIcon from "@mui/icons-material/Timeline";
import BarChartIcon from "@mui/icons-material/BarChart";
import PieChartIcon from "@mui/icons-material/PieChart";
import PublicIcon from "@mui/icons-material/Public";
import { Chart } from "../../types/chart";
import { useIsomorphicLayoutEffect } from "../../hooks/useIsomorphicLayoutEffect";

interface Props {
  position: { x: number; y: number };
  onSelectChart: (chartType: Chart) => void;
  onClose: () => void;
}

const chartTypes = [
  { label: "Line Chart", type: Chart.Line, icon: <TimelineIcon /> },
  { label: "Bar Chart", type: Chart.Bar, icon: <BarChartIcon /> },
  { label: "Pie Chart", type: Chart.Pie, icon: <PieChartIcon /> },
  { label: "Map Chart", type: Chart.Map, icon: <PublicIcon /> },
];

const menuWidth = 200;
const menuHeight = 150;

export function ContextMenu({ position, onSelectChart, onClose }: Props) {
  // State to track adjusted position
  const [menuPosition, setMenuPosition] = useState(position);

  // Adjust menu position when it would go off-screen - use layout effect for smoother positioning
  useIsomorphicLayoutEffect(() => {
    if (typeof window === "undefined") return;

    // Get viewport dimensions
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    // Calculate adjusted position
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

  return (
    <div className="fixed top-0 left-0 right-0 bottom-0 z-50" onClick={onClose}>
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
          transform: "translateZ(0)",
          willChange: "transform",
        }}
      >
        <MenuList dense>
          {chartTypes.map((chart) => (
            <MenuItem
              key={chart.type}
              onClick={(e) => {
                e.stopPropagation();
                onSelectChart(chart.type);
              }}
            >
              <ListItemIcon>{chart.icon}</ListItemIcon>
              <ListItemText>{chart.label}</ListItemText>
            </MenuItem>
          ))}
        </MenuList>
      </Paper>
    </div>
  );
}
