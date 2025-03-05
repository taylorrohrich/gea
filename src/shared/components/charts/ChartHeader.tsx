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
  useMediaQuery,
  useTheme,
  Stack,
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
import { Data } from "@/shared/types/data";

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
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm"));
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editTitle, setEditTitle] = useState(title);
  const [editDescription, setEditDescription] = useState(description);
  const [moreMenuAnchorEl, setMoreMenuAnchorEl] = useState<null | HTMLElement>(
    null
  );

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
          gap: 1,
          p: 1,
          px: 1.5,
          borderBottom: "1px solid #e0e0e0",
          backgroundColor: "background.paper",
          position: "relative",
          zIndex: 10,
          height: { xs: "52px", sm: "52px" },
          minHeight: "52px",
          boxSizing: "border-box",
        }}
      >
        {/* Drag handle */}
        <DragIndicator
          fontSize="small"
          color="action"
          sx={{
            cursor: "move",
            flexShrink: 0,
            display: { xs: "none", sm: "block" },
          }}
          className="drag-handle"
        />

        {/* Title and description */}
        <Box
          sx={{
            flexGrow: 1,
            overflow: "hidden",
            minWidth: 0, // Important for text truncation to work
          }}
        >
          <Typography
            variant="subtitle2"
            fontWeight="bold"
            noWrap
            sx={{ lineHeight: 1.2 }}
          >
            {title || "Untitled Chart"}
          </Typography>
          {description && !isSmallScreen && (
            <Typography
              variant="caption"
              color="text.secondary"
              noWrap
              sx={{
                display: "block",
                width: "100%", // Allow to use parent width
                overflow: "hidden",
                textOverflow: "ellipsis",
                lineHeight: 1.2,
              }}
            >
              {description}
            </Typography>
          )}
        </Box>

        {/* View Mode Toggle - Now right aligned */}
        <ToggleButtonGroup
          value={viewMode}
          exclusive
          onChange={handleViewModeChange}
          size="small"
          aria-label="view mode"
          sx={{
            flexShrink: 0,
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
        <Stack
          direction="row"
          spacing={0.5}
          sx={{
            display: { xs: "none", sm: "flex" },
            alignItems: "center",
            flexShrink: 0,
          }}
        >
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
        </Stack>

        {/* More menu icon for small screens */}
        <IconButton
          size="small"
          sx={{ display: { xs: "flex", sm: "none" }, flexShrink: 0 }}
          onClick={(e) => {
            e.stopPropagation();
            handleOpenEditDialog(); // On small screens, clicking "more" directly opens the edit dialog
          }}
        >
          <MoreVertIcon fontSize="small" />
        </IconButton>
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

          {/* Show additional actions on small screens inside the dialog */}
          {isSmallScreen && (
            <Box sx={{ mt: 3, pt: 2, borderTop: "1px solid #eee" }}>
              <Typography variant="subtitle2" gutterBottom>
                Additional Actions
              </Typography>
              <Button
                startIcon={<FileDownloadIcon />}
                onClick={() => {
                  handleExportCSV();
                  handleCloseEditDialog();
                }}
                sx={{ mr: 1 }}
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
            </Box>
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
