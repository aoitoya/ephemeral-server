import { useState, useEffect, useRef, useCallback } from "react";
import { Box, Typography } from "@mui/joy";
import { useCurrentUser } from "@/hooks/useAuth";
import UserList from "./UserList";
import ChatView from "./ChatView";
import type { Message } from "./types";
import { useSocket, useSocketEvent } from "@/hooks/useSocket";
import type { User } from "@/services/api/user.api";

export default function Messages() {
  const { socket, isConnected } = useSocket();
  const { data: currentUser } = useCurrentUser();
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 900);
  const [showSidebar, setShowSidebar] = useState(true);
  const [sendingMessage, setSendingMessage] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  useEffect(() => {
    const handleResize = () => {
      const isMobileView = window.innerWidth < 900;
      setIsMobile(isMobileView);
      if (!isMobileView) {
        setShowSidebar(true);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useSocketEvent("chat:message", (payload: Message) => {
    setMessages((prev) => [...prev, payload]);
  });

  useSocketEvent("chat:messages", (payload: Message[]) => {
    setMessages((prev) => [...payload, ...prev]);
  });

  useSocketEvent("chat:error", (error: { message: string }) => {
    console.error("Chat error:", error.message);
    setSendingMessage(false);
  });

  if (!currentUser) {
    return null;
  }

  const sendMessage = () => {
    if (
      !socket ||
      !isConnected ||
      !selectedUser ||
      !message.trim() ||
      sendingMessage
    ) {
      return;
    }

    setSendingMessage(true);

    socket.emit(
      "chat:message",
      {
        content: message,
        room: { type: "single", id: selectedUser.id },
      },
      (response: { success?: boolean; error?: string }) => {
        if (response?.success) {
          setMessage("");
        } else {
          console.error("Failed to send message:", response?.error);
        }
        setSendingMessage(false);
      },
    );
  };

  const joinChat = (userId: string) => {
    if (!socket || !isConnected) return;
    socket.emit("chat:join", { type: "single", id: userId });
  };

  const handleSelectUser = (user: User) => {
    setSelectedUser(user);
    joinChat(user.id);
    setMessages([]);
    if (isMobile) {
      setShowSidebar(false);
    }
  };

  const handleBackToUsers = () => {
    setShowSidebar(true);
    setSelectedUser(null);
  };

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: { xs: "column", md: "row" },
        height: "100vh",
        bgcolor: "background.body",
      }}
    >
      <Box
        sx={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          order: { xs: 2, md: 1 },
          height: { xs: selectedUser ? "100%" : "auto", md: "100%" },
        }}
      >
        {selectedUser ? (
          <ChatView
            user={selectedUser}
            messages={messages}
            currentUserId={currentUser.id}
            message={message}
            onMessageChange={setMessage}
            onSendMessage={sendMessage}
            onBack={isMobile ? handleBackToUsers : undefined}
            isMobile={isMobile}
            isConnected={isConnected}
            isSending={sendingMessage}
            messagesEndRef={messagesEndRef}
          />
        ) : (
          <Box
            sx={{
              flex: 1,
              display: { xs: selectedUser ? "none" : "flex", md: "flex" },
              alignItems: "center",
              justifyContent: "center",
              bgcolor: "background.level1",
              p: 3,
            }}
          >
            <Typography level="body-md" color="neutral">
              Select a conversation to start chatting
            </Typography>
          </Box>
        )}
      </Box>

      <Box
        sx={{
          width: { xs: "100%", md: 320 },
          borderTop: { xs: "1px solid", md: "none" },
          borderColor: "divider",
          bgcolor: "background.surface",
          order: { xs: 1, md: 2 },
          display: {
            xs: showSidebar ? "block" : "none",
            md: "block",
          },
          borderLeft: "1px solid",
          borderLeftColor: "divider",
          height: { xs: showSidebar ? "auto" : 0, md: "100%" },
          overflow: "hidden",
        }}
      >
        <UserList
          selectedUserId={selectedUser?.id}
          onSelectUser={handleSelectUser}
        />
      </Box>
    </Box>
  );
}
