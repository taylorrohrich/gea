import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
} from "@mui/material";
import { useGridContext, GridActionType } from "../grid/GridContext";

interface Props {
  id: number;
  title: string;
  isOpen: boolean;
  onClose: () => void;
}

export function DeleteTileDialog({ id, title, isOpen, onClose }: Props) {
  const { dispatch } = useGridContext();

  const handleConfirmDelete = () => {
    dispatch({ type: GridActionType.DELETE_TILE, id });
    onClose();
  };

  return (
    <Dialog
      open={isOpen}
      onClose={onClose}
      aria-labelledby="delete-dialog-title"
      aria-describedby="delete-dialog-description"
    >
      <DialogTitle id="delete-dialog-title">
        Delete {title || "Chart"}
      </DialogTitle>
      <DialogContent>
        <DialogContentText id="delete-dialog-description">
          Are you sure you want to delete &quot;{title || "this chart"}&quot;?
          This action cannot be undone.
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="primary">
          Cancel
        </Button>
        <Button onClick={handleConfirmDelete} color="error" variant="contained">
          Delete
        </Button>
      </DialogActions>
    </Dialog>
  );
}
