import React, { useState } from "react";
import {
  IconButton,
  Tooltip,
  ToggleButtonGroup,
  ToggleButton,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import ClearIcon from "@mui/icons-material/Clear";
import DragIndicator from "@mui/icons-material/DragIndicator";
import BarChartIcon from "@mui/icons-material/BarChart";
import TableChartIcon from "@mui/icons-material/TableChart";
import FileDownloadIcon from "@mui/icons-material/FileDownload";
import { Tile, ViewMode } from "../Grid/types";
import { useGridContext, GridActionType } from "../Grid/GridContext";
import { exportDataToCsv } from "@/shared/helpers/csv";
import { EditTileDialog } from "./EditTileDialog";
import { DeleteTileDialog } from "./DeleteTileDialog";

interface Props {
  tile: Tile;
}

export function TileHeader({ tile }: Props) {
  const {
    id,
    metadata: { title, description },
    viewMode,
  } = tile;

  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  // Get data and dispatch from context
  const { data, dispatch } = useGridContext();

  // View mode toggle handler
  const handleViewModeChange = (
    _: React.MouseEvent<HTMLElement>,
    newMode: ViewMode
  ) => {
    if (newMode !== null) {
      dispatch({
        type: GridActionType.UPDATE_TILE_VIEW_MODE,
        id,
        viewMode: newMode,
      });
    }
  };

  return (
    <>
      <div className="flex items-center gap-2 p-2 border-b border-gray-200 bg-white relative z-10 h-[52px]">
        <DragIndicator
          fontSize="small"
          color="action"
          className="cursor-move flex-shrink-0 hidden sm:block drag-handle"
        />
        <div className="flex-grow overflow-hidden min-w-0">
          <h3 className="text-sm font-bold leading-tight truncate">
            {title || "Untitled Chart"}
          </h3>
          {description && (
            <p className="text-xs text-gray-500 leading-tight truncate">
              {description}
            </p>
          )}
        </div>
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
          <ToggleButton value={ViewMode.Chart} aria-label="chart view">
            <BarChartIcon fontSize="small" />
          </ToggleButton>
          <ToggleButton value={ViewMode.Table} aria-label="table view">
            <TableChartIcon fontSize="small" />
          </ToggleButton>
        </ToggleButtonGroup>
        <Tooltip title="Download CSV">
          <IconButton
            size="small"
            onClick={() => exportDataToCsv(data, title || "chart-data")}
          >
            <FileDownloadIcon fontSize="small" />
          </IconButton>
        </Tooltip>
        <Tooltip title="Edit chart info">
          <IconButton size="small" onClick={() => setEditDialogOpen((o) => !o)}>
            <EditIcon fontSize="small" />
          </IconButton>
        </Tooltip>
        <Tooltip title="Delete chart">
          <IconButton
            size="small"
            onClick={() => setDeleteDialogOpen((o) => !o)}
          >
            <ClearIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </div>
      <EditTileDialog
        id={id}
        title={title}
        description={description}
        isOpen={editDialogOpen}
        onClose={() => setEditDialogOpen(false)}
      />
      <DeleteTileDialog
        id={id}
        title={title}
        isOpen={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      />
    </>
  );
}
