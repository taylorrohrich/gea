import React, { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
} from "@mui/material";
import { useGridContext, GridActionType } from "../grid/GridContext";

interface EditTileDialogProps {
  id: number;
  title: string;
  description: string;
  isOpen: boolean;
  onClose: () => void;
}

export function EditTileDialog({
  id,
  title,
  description,
  isOpen,
  onClose,
}: EditTileDialogProps) {
  const [editTitle, setEditTitle] = useState(title);
  const [editDescription, setEditDescription] = useState(description);
  const { dispatch } = useGridContext();

  const handleSave = () => {
    dispatch({
      type: GridActionType.UPDATE_TILE_METADATA,
      id,
      title: editTitle,
      description: editDescription,
    });
    onClose();
  };

  return (
    <Dialog open={isOpen} onClose={onClose} fullWidth maxWidth="sm">
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
        <Button onClick={onClose} color="primary">
          Cancel
        </Button>
        <Button onClick={handleSave} color="primary" variant="contained">
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
}
