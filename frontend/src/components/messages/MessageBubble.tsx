import { Box, Typography } from "@mui/joy";
import type { Message } from "./types";
import { format } from "date-fns";

interface MessageBubbleProps {
  message: Message;
  isOwnMessage: boolean;
}

export default function MessageBubble({
  message,
  isOwnMessage,
}: MessageBubbleProps) {
  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: isOwnMessage ? "flex-end" : "flex-start",
        width: "100%",
        px: 1.5,
      }}
    >
      <Box
        sx={{
          maxWidth: "80%",
          display: "flex",
          flexDirection: "column",
          alignItems: isOwnMessage ? "flex-end" : "flex-start",
        }}
      >
        <Box
          sx={{
            px: 2,
            py: 1.5,
            borderRadius: 3,
            borderBottomRightRadius: isOwnMessage ? 4 : 16,
            borderBottomLeftRadius: isOwnMessage ? 16 : 4,
            bgcolor: isOwnMessage ? "#4f46e5" : "#374151",
            boxShadow: "0 1px 2px rgba(0,0,0,0.1)",
          }}
        >
          <Typography
            level="body-sm"
            sx={{
              color: "#ffffff",
              whiteSpace: "pre-wrap",
              wordBreak: "break-word",
              lineHeight: 1.5,
            }}
          >
            {message.content}
          </Typography>
        </Box>
        <Typography
          level="body-xs"
          sx={{
            mt: 0.5,
            px: 0.5,
            color: "text.tertiary",
            fontSize: "0.65rem",
          }}
        >
          {format(new Date(message.createdAt), "h:mm a")}
        </Typography>
      </Box>
    </Box>
  );
}
