import { useState } from "react";
import {
  Modal,
  ModalDialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
} from "@mui/joy";

interface ConnectionRequestDialogProps {
  open: boolean;
  onClose: () => void;
  recipientUsername: string;
  onSubmit: () => Promise<void>;
}

export function ConnectionRequestDialog({
  open,
  onClose,
  recipientUsername,
  onSubmit,
}: ConnectionRequestDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);
      await onSubmit();
      onClose();
    } catch (error) {
      console.error("Failed to send connection request:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose}>
      <ModalDialog size="md">
        <DialogTitle>Connect with {recipientUsername}</DialogTitle>
        <DialogContent>
          <Typography level="body-sm" sx={{ mb: 2 }}>
            Send a connection request to <strong>{recipientUsername}</strong> to
            connect and message each other.
          </Typography>
          <Typography level="body-xs" color="neutral" sx={{ mb: 2 }}>
            You will be able to see each other’s posts and message if they
            accept your request.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button
            variant="soft"
            color="neutral"
            onClick={onClose}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            variant="soft"
            onClick={handleSubmit}
            loading={isSubmitting}
            disabled={isSubmitting}
          >
            {isSubmitting ? "Sending..." : "Send Connection Request"}
          </Button>
        </DialogActions>
      </ModalDialog>
    </Modal>
  );
}
