import { useEffect, useRef } from "react";
import { Box, Typography, Button, IconButton, Avatar, Input } from "@mui/joy";
import SendIcon from "@mui/icons-material/Send";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import MessageBubble from "./MessageBubble";
import type { Message } from "./types";
import type { User } from "@/services/api/user.api";

interface ChatViewProps {
  user: User;
  messages: Message[];
  currentUserId: string;
  message: string;
  onMessageChange: (_value: string) => void;
  onSendMessage: () => void;
  onBack?: () => void;
  isMobile?: boolean;
  isConnected?: boolean;
  isSending?: boolean;
  messagesEndRef?: React.RefObject<HTMLDivElement>;
}

export default function ChatView({
  user,
  messages,
  currentUserId,
  message,
  onMessageChange,
  onSendMessage,
  onBack,
  isMobile = false,
  isConnected = true,
  isSending = false,
  messagesEndRef,
}: ChatViewProps) {
  const localRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ref = messagesEndRef || localRef;
    ref.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, messagesEndRef]);

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        flex: 1,
        height: "100%",
        bgcolor: "background.body",
      }}
    >
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1.5,
          px: 2,
          py: 1.4,
          borderBottom: "1px solid",
          borderColor: "divider",
          bgcolor: "background.surface",
        }}
      >
        {isMobile && onBack && (
          <IconButton variant="plain" onClick={onBack} size="sm">
            <ArrowBackIcon />
          </IconButton>
        )}
        <Avatar size="md" sx={{ bgcolor: "primary.solidBg" }}>
          {user.username.charAt(0).toUpperCase()}
        </Avatar>
        <Box sx={{ flex: 1 }}>
          <Typography level="title-sm" sx={{ fontWeight: 600 }}>
            {user.username}
          </Typography>
          <Typography level="body-xs" color="neutral">
            {isConnected ? "Online" : "Offline"}
          </Typography>
        </Box>
      </Box>

      <Box
        sx={{
          flex: 1,
          px: 2,
          py: 2,
          overflowY: "auto",
          display: "flex",
          flexDirection: "column",
          gap: 1,
          bgcolor: "transparent",
        }}
      >
        {messages.length === 0 ? (
          <Box
            sx={{
              flex: 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Typography level="body-sm" color="neutral">
              No messages yet. Say hello!
            </Typography>
          </Box>
        ) : (
          messages.map((msg, idx) => (
            <MessageBubble
              key={idx}
              message={msg}
              isOwnMessage={msg.from.id === currentUserId}
            />
          ))
        )}
        <div ref={localRef} />
      </Box>

      <Box
        component="form"
        onSubmit={(e) => {
          e.preventDefault();
          onSendMessage();
        }}
        sx={{
          px: 2,
          py: 1.5,
          pb: 4,
          borderTop: "1px solid",
          borderColor: "divider",
          bgcolor: "background.surface",
        }}
      >
        <Box sx={{ display: "flex", gap: 1, alignItems: "flex-end" }}>
          <Input
            placeholder={isConnected ? "Message..." : "Connecting..."}
            value={message}
            onChange={(e) => onMessageChange(e.target.value)}
            disabled={!isConnected || isSending}
            sx={{
              flex: 1,
              "--Input-radius": "20px",
              "--Input-paddingInline": "16px",
              bgcolor: "action.hover",
            }}
          />
          <Button
            type="submit"
            variant="solid"
            color="primary"
            disabled={!message.trim() || !isConnected || isSending}
            sx={{
              borderRadius: "50%",
              width: 40,
              height: 40,
              minWidth: 40,
              p: 0,
            }}
          >
            <SendIcon fontSize="small" />
          </Button>
        </Box>
      </Box>
    </Box>
  );
}
