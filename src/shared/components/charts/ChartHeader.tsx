import React, { useState } from "react";
import {
  Box,
  Typography,
  IconButton,
  TextField,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
  ToggleButtonGroup,
  ToggleButton,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import DragIndicatorIcon from "@mui/icons-material/DragIndicator";
import BarChartIcon from "@mui/icons-material/BarChart";
import TableChartIcon from "@mui/icons-material/TableChart";
import FileDownloadIcon from "@mui/icons-material/FileDownload";
import { Chart } from "../../types/chart";
import { ViewMode } from "../grid/types";
import { Data } from "@/shared/types/data";

// Remove the redundant type definition
// export type ViewMode = "chart" | "table";

interface ChartHeaderProps {
  id: number;
  title: string;
  description: string;
  chartType: Chart;
  data: Data[];
  viewMode: ViewMode;
  onUpdate: (id: number, title: string, description: string) => void;
  onDelete: (id: number) => void;
  onViewModeChange: (viewMode: ViewMode) => void;
}

export const ChartHeader: React.FC<ChartHeaderProps> = ({
  id,
  title,
  description,
  chartType,
  data,
  viewMode,
  onUpdate,
  onDelete,
  onViewModeChange,
}) => {
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editTitle, setEditTitle] = useState(title);
  const [editDescription, setEditDescription] = useState(description);

  // Edit dialog handlers
  const handleOpenEditDialog = () => {
    setEditTitle(title);
    setEditDescription(description);
    setEditDialogOpen(true);
  };

  const handleCloseEditDialog = () => {
    setEditDialogOpen(false);
  };

  const handleSaveChanges = () => {
    onUpdate(id, editTitle, editDescription);
    setEditDialogOpen(false);
  };

  // Delete dialog handlers
  const handleOpenDeleteDialog = (e: React.MouseEvent) => {
    e.stopPropagation();
    setDeleteDialogOpen(true);
  };

  const handleCloseDeleteDialog = () => {
    setDeleteDialogOpen(false);
  };

  const handleConfirmDelete = () => {
    onDelete(id);
    setDeleteDialogOpen(false);
  };

  // View mode toggle handler
  const handleViewModeChange = (
    _: React.MouseEvent<HTMLElement>,
    newMode: ViewMode
  ) => {
    if (newMode !== null) {
      onViewModeChange(newMode);
    }
  };

  // Export data as CSV
  const handleExportCSV = () => {
    // Generate CSV content
    let csvContent = "data:text/csv;charset=utf-8,";

    // Add headers - first column is x value (typically year)
    const headers = ["Year"];
    data.forEach((series) => {
      headers.push(series.label);
    });
    csvContent += headers.join(",") + "\n";

    // Create a map of all x values to their corresponding series data
    const rowsMap = new Map();

    data.forEach((series) => {
      series.values.forEach((point) => {
        if (!rowsMap.has(point.x)) {
          rowsMap.set(point.x, { x: point.x });
        }
        // Add this series' value to the row data
        rowsMap.get(point.x)[series.label] = point.y;
      });
    });

    // Sort rows by x value and convert to CSV
    const sortedRows = Array.from(rowsMap.values()).sort((a, b) =>
      a.x.localeCompare(b.x)
    );

    sortedRows.forEach((row) => {
      const line = [row.x];
      data.forEach((series) => {
        line.push(row[series.label] !== undefined ? row[series.label] : "");
      });
      csvContent += line.join(",") + "\n";
    });

    // Create download link
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `${title || "chart-data"}.csv`);
    document.body.appendChild(link);

    // Trigger download and clean up
    link.click();
    document.body.removeChild(link);
  };

  return (
    <>
      {/* Chart Header */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          mb: 1,
          p: 1,
          borderBottom: "1px solid #e0e0e0",
          backgroundColor: "background.paper", // Ensure it's not transparent
          position: "relative", // Set position to enable z-index
          zIndex: 10, // Higher than the table
          height: "52px", // Set fixed height
          minHeight: "52px", // Ensure it doesn't collapse
          boxSizing: "border-box", // Include padding in height calculation
        }}
      >
        {/* Left section - Drag handle and title */}
        <Box display="flex" alignItems="center" gap={0.5}>
          <DragIndicatorIcon
            fontSize="small"
            color="action"
            sx={{ cursor: "move" }}
            className="drag-handle"
          />
          <Box>
            {title ? (
              <>
                <Typography variant="subtitle2" fontWeight="bold" noWrap>
                  {title}
                </Typography>
                {description && (
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    noWrap
                    sx={{
                      display: "block",
                      maxWidth: "220px",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                  >
                    {description}
                  </Typography>
                )}
              </>
            ) : (
              <Typography variant="subtitle2" color="text.secondary">
                Untitled Chart
              </Typography>
            )}
          </Box>
        </Box>

        {/* Center section - View mode toggle */}
        <Box flexGrow={1} display="flex" justifyContent="center">
          <ToggleButtonGroup
            value={viewMode}
            exclusive
            onChange={handleViewModeChange}
            size="small"
            aria-label="view mode"
          >
            <ToggleButton value="chart" aria-label="chart view">
              <Tooltip title="Chart View">
                <BarChartIcon fontSize="small" />
              </Tooltip>
            </ToggleButton>
            <ToggleButton value="table" aria-label="table view">
              <Tooltip title="Table View">
                <TableChartIcon fontSize="small" />
              </Tooltip>
            </ToggleButton>
          </ToggleButtonGroup>
        </Box>

        {/* Right section - Action buttons */}
        <Box display="flex" alignItems="center" gap={0.5}>
          <Tooltip title="Download CSV">
            <IconButton size="small" onClick={handleExportCSV}>
              <FileDownloadIcon fontSize="small" />
            </IconButton>
          </Tooltip>

          <Tooltip title="Edit chart info">
            <IconButton
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                handleOpenEditDialog();
              }}
            >
              <EditIcon fontSize="small" />
            </IconButton>
          </Tooltip>

          <Tooltip title="Delete chart">
            <IconButton
              size="small"
              onClick={handleOpenDeleteDialog}
              color="error"
            >
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      {/* Edit Dialog */}
      <Dialog
        open={editDialogOpen}
        onClose={handleCloseEditDialog}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>Edit Chart Information</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Chart Title"
            fullWidth
            variant="outlined"
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            label="Description"
            fullWidth
            multiline
            rows={3}
            variant="outlined"
            value={editDescription}
            onChange={(e) => setEditDescription(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseEditDialog} color="primary">
            Cancel
          </Button>
          <Button
            onClick={handleSaveChanges}
            color="primary"
            variant="contained"
          >
            Save
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={handleCloseDeleteDialog}
        aria-labelledby="delete-dialog-title"
        aria-describedby="delete-dialog-description"
      >
        <DialogTitle id="delete-dialog-title">
          Delete {title || "Chart"}
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="delete-dialog-description">
            Are you sure you want to delete "{title || "this chart"}"? This
            action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeleteDialog} color="primary">
            Cancel
          </Button>
          <Button
            onClick={handleConfirmDelete}
            color="error"
            variant="contained"
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};
