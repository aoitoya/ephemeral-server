import {
  Avatar,
  Box,
  Button,
  ListItem,
  Typography,
  CircularProgress,
} from "@mui/joy";
import type { Connection } from "@/services/api/connection.api";

interface ConnectionRequestItemProps {
  request: Connection;
  onAccept: (_requestId: string) => void;
  onReject: (_requestId: string) => void;
  isAccepting?: boolean;
  isRejecting?: boolean;
}

export default function ConnectionRequestItem({
  request,
  onAccept,
  onReject,
  isAccepting = false,
  isRejecting = false,
}: ConnectionRequestItemProps) {
  return (
    <ListItem>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          width: "100%",
          py: 1,
        }}
      >
        <Avatar
          alt={request.user.username}
          sx={{
            mr: 2,
            width: 48,
            height: 48,
            fontSize: "lg",
          }}
        >
          {request.user.username.charAt(0).toUpperCase()}
        </Avatar>

        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography
            level="title-md"
            sx={{
              fontWeight: "md",
              mb: 0.5,
            }}
          >
            {request.user.username}
          </Typography>
          <Typography
            level="body-sm"
            color="neutral"
            sx={{ display: { xs: "none", sm: "block" } }}
          >
            Wants to connect with you
          </Typography>
        </Box>

        <Box
          sx={{
            display: "flex",
            gap: 1,
            ml: 2,
          }}
        >
          <Button
            size="sm"
            variant="solid"
            color="primary"
            onClick={() => onAccept(request.id)}
            disabled={isAccepting || isRejecting}
            startDecorator={isAccepting ? <CircularProgress size="sm" /> : null}
            sx={{ minWidth: 80 }}
          >
            {isAccepting ? "Accepting" : "Accept"}
          </Button>
          <Button
            size="sm"
            variant="outlined"
            color="neutral"
            onClick={() => onReject(request.id)}
            disabled={isAccepting || isRejecting}
            startDecorator={isRejecting ? <CircularProgress size="sm" /> : null}
            sx={{ minWidth: 80 }}
          >
            {isRejecting ? "Rejecting" : "Reject"}
          </Button>
        </Box>
      </Box>
    </ListItem>
  );
}
