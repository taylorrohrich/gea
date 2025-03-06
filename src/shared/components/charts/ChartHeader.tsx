import React, { useState } from "react";
import {
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
  useMediaQuery,
  useTheme,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import DragIndicator from "@mui/icons-material/DragIndicator";
import BarChartIcon from "@mui/icons-material/BarChart";
import TableChartIcon from "@mui/icons-material/TableChart";
import FileDownloadIcon from "@mui/icons-material/FileDownload";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import { Chart } from "../../types/chart";
import { ViewMode } from "../grid/types";
import { useGridContext } from "../grid/GridContext";

interface ChartHeaderProps {
  id: number;
  title: string;
  description: string;
  chartType: Chart;
  viewMode: ViewMode;
  onViewModeChange: (viewMode: ViewMode) => void;
}

export const ChartHeader: React.FC<ChartHeaderProps> = ({
  id,
  title,
  description,
  chartType,
  viewMode,
  onViewModeChange,
}) => {
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm"));
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editTitle, setEditTitle] = useState(title);
  const [editDescription, setEditDescription] = useState(description);

  // Get data and dispatch from context
  const { data, dispatch } = useGridContext();

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
    dispatch({
      type: "UPDATE_TILE_METADATA",
      id,
      title: editTitle,
      description: editDescription,
    });
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
    dispatch({ type: "DELETE_TILE", id });
    setDeleteDialogOpen(false);
  };

  // View mode toggle handler - this is kept locally to avoid unnecessary context updates
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
      <div className="flex items-center gap-2 p-2 border-b border-gray-200 bg-white relative z-10 h-[52px] min-h-[52px] box-border">
        {/* Drag handle */}
        <DragIndicator
          fontSize="small"
          color="action"
          className="cursor-move flex-shrink-0 hidden sm:block drag-handle"
        />

        {/* Title and description */}
        <div className="flex-grow overflow-hidden min-w-0">
          <h3 className="text-sm font-bold leading-tight truncate">
            {title || "Untitled Chart"}
          </h3>
          {description && !isSmallScreen && (
            <p className="text-xs text-gray-500 leading-tight truncate w-full">
              {description}
            </p>
          )}
        </div>

        {/* View Mode Toggle */}
        <ToggleButtonGroup
          value={viewMode}
          exclusive
          onChange={handleViewModeChange}
          size="small"
          aria-label="view mode"
          className="flex-shrink-0"
          sx={{
            borderRadius: 1,
            ".MuiToggleButton-root": {
              py: 0.5,
              px: { xs: 0.75, sm: 1 },
            },
          }}
        >
          <ToggleButton value="chart" aria-label="chart view">
            <BarChartIcon fontSize="small" />
          </ToggleButton>
          <ToggleButton value="table" aria-label="table view">
            <TableChartIcon fontSize="small" />
          </ToggleButton>
        </ToggleButtonGroup>

        {/* Action buttons - shown on larger screens */}
        <div className="hidden sm:flex items-center gap-1 flex-shrink-0">
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
        </div>

        {/* More menu icon for small screens */}
        <IconButton
          size="small"
          className="flex sm:hidden flex-shrink-0"
          onClick={(e) => {
            e.stopPropagation();
            handleOpenEditDialog();
          }}
        >
          <MoreVertIcon fontSize="small" />
        </IconButton>
      </div>

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

          {/* Show additional actions on small screens inside the dialog */}
          {isSmallScreen && (
            <div className="mt-6 pt-4 border-t border-gray-200">
              <h4 className="text-base font-medium mb-2">Additional Actions</h4>
              <Button
                startIcon={<FileDownloadIcon />}
                onClick={() => {
                  handleExportCSV();
                  handleCloseEditDialog();
                }}
                className="mr-2"
              >
                Download CSV
              </Button>
              <Button
                color="error"
                startIcon={<DeleteIcon />}
                onClick={() => {
                  handleCloseEditDialog();
                  handleOpenDeleteDialog({
                    stopPropagation: () => {},
                  } as React.MouseEvent);
                }}
              >
                Delete Chart
              </Button>
            </div>
          )}
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
