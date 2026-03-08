import { useState, useEffect } from "react";
import {
  Box,
  Typography,
  IconButton,
  Button,
  List,
  ListItem,
  ListItemDecorator,
  ListItemContent,
  Tab,
  TabList,
  Tabs,
  Sheet,
} from "@mui/joy";
import {
  Person as PersonIcon,
  Favorite as HeartIcon,
  Message as MessageIcon,
  TrendingUp as TrendingIcon,
  Notifications as NotificationsIcon,
  CheckCircle as CheckIcon,
  Delete as DeleteIcon,
  DoneAll as DoneAllIcon,
} from "@mui/icons-material";
import { useSocketEvent } from "@/hooks/useSocket";

interface Notification {
  id: string;
  type: "connection_request" | "like" | "comment" | "trending" | "system";
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  user?: {
    username: string;
    avatar?: string;
  };
}

export function NotificationCenter() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [filter, setFilter] = useState<
    "all" | "unread" | "connection_requests" | "likes" | "comments"
  >("all");

  useEffect(() => {
    const mockNotifications: Notification[] = [
      {
        id: "1",
        type: "connection_request",
        title: "New Connection Request",
        message: "alex wants to connect with you",
        timestamp: new Date(Date.now() - 5 * 60 * 1000),
        read: false,
        user: { username: "alex" },
      },
      {
        id: "2",
        type: "like",
        title: "Your post is getting attention",
        message: "15 people liked your recent ephemeral post",
        timestamp: new Date(Date.now() - 15 * 60 * 1000),
        read: false,
      },
      {
        id: "3",
        type: "comment",
        title: "New comment on your post",
        message: 'sarah: "This really resonates with me!"',
        timestamp: new Date(Date.now() - 30 * 60 * 1000),
        read: true,
        user: { username: "sarah" },
      },
      {
        id: "4",
        type: "trending",
        title: "Your content is trending",
        message:
          "Your emotional compatibility post is trending in the community",
        timestamp: new Date(Date.now() - 60 * 60 * 1000),
        read: true,
      },
      {
        id: "5",
        type: "connection_request",
        title: "New Connection Request",
        message: "mike_j wants to connect with you",
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
        read: true,
        user: { username: "mike_j" },
      },
    ];
    setNotifications(mockNotifications);
  }, []);

  useSocketEvent("notification:new", (notification: Notification) => {
    setNotifications((prev) => [notification, ...prev]);
  });

  const markAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((notif) => (notif.id === id ? { ...notif, read: true } : notif))
    );
  };

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((notif) => ({ ...notif, read: true })));
  };

  const clearNotification = (id: string) => {
    setNotifications((prev) => prev.filter((notif) => notif.id !== id));
  };

  const formatTimestamp = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m`;
    if (diffHours < 24) return `${diffHours}h`;
    return `${diffDays}d`;
  };

  const filteredNotifications = notifications.filter((notification) => {
    switch (filter) {
      case "unread":
        return !notification.read;
      case "connection_requests":
        return notification.type === "connection_request";
      case "likes":
        return notification.type === "like";
      case "comments":
        return notification.type === "comment";
      default:
        return true;
    }
  });

  const unreadCount = notifications.filter((n) => !n.read).length;

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "connection_request":
        return <PersonIcon />;
      case "like":
        return <HeartIcon />;
      case "comment":
        return <MessageIcon />;
      case "trending":
        return <TrendingIcon />;
      default:
        return <NotificationsIcon />;
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case "connection_request":
        return "var(--icon-primary, #667eea)";
      case "like":
        return "var(--icon-danger, #f44336)";
      case "comment":
        return "var(--icon-neutral, #757575)";
      case "trending":
        return "var(--icon-success, #4caf50)";
      default:
        return "var(--icon-warning, #ff9800)";
    }
  };

  return (
    <Box
      sx={{
        maxWidth: 600,
        mx: "auto",
        p: { xs: 2, sm: 3 },
        height: "100%",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 2,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Typography level="h3">Notifications</Typography>
          {unreadCount > 0 && (
            <Typography
              level="body-sm"
              sx={{
                bgcolor: "primary.solidBg",
                color: "white",
                px: 1,
                borderRadius: "16px",
                fontSize: "0.75rem",
                fontWeight: "bold",
              }}
            >
              {unreadCount}
            </Typography>
          )}
        </Box>
        <Button
          variant="plain"
          size="sm"
          color="neutral"
          onClick={markAllAsRead}
          disabled={unreadCount === 0}
          startDecorator={<DoneAllIcon />}
          sx={{ textDecoration: "underline", fontSize: "0.8rem" }}
        >
          Mark all read
        </Button>
      </Box>

      <Tabs
        value={filter}
        onChange={(_, value) => setFilter(value as typeof filter)}
        sx={{ mb: 2 }}
      >
        <TabList
          variant="soft"
          sx={{
            "--TabList-gap": "4px",
            "--Tab-radius": "8px",
            fontSize: "0.8rem",
          }}
        >
          <Tab value="all">All</Tab>
          <Tab value="unread">
            Unread {unreadCount > 0 && `(${unreadCount})`}
          </Tab>
          <Tab value="connection_requests">Connections</Tab>
          <Tab value="likes">Likes</Tab>
          <Tab value="comments">Comments</Tab>
        </TabList>
      </Tabs>

      {filteredNotifications.length === 0 ? (
        <Sheet
          sx={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            color: "text.tertiary",
            py: 8,
            borderRadius: "lg",
          }}
        >
          <NotificationsIcon sx={{ fontSize: 48, opacity: 0.4, mb: 2 }} />
          <Typography level="body-md" fontWeight="500">
            {filter === "all"
              ? "No notifications yet"
              : `No ${filter.replace("_", " ")}`}
          </Typography>
          <Typography level="body-sm" sx={{ mt: 0.5, opacity: 0.7 }}>
            {filter === "all"
              ? "Notifications will appear here"
              : "Try another filter"}
          </Typography>
        </Sheet>
      ) : (
        <List
          sx={{
            flex: 1,
            overflow: "auto",
            p: 0,
          }}
        >
          {filteredNotifications.map((notification) => (
            <ListItem
              key={notification.id}
              sx={{
                py: 1.5,
                px: 2,
                borderRadius: "8px",
                mb: 0.5,
                backgroundColor: notification.read
                  ? "transparent"
                  : "action.hover",
                transition: "background-color 0.2s",
                "&:hover": {
                  backgroundColor: notification.read
                    ? "action.selected"
                    : "action.selected",
                },
              }}
              endAction={
                <Box sx={{ display: "flex", gap: 0.5 }}>
                  {!notification.read && (
                    <IconButton
                      size="sm"
                      variant="plain"
                      color="primary"
                      onClick={() => markAsRead(notification.id)}
                      sx={{ opacity: 0.6, "&:hover": { opacity: 1 } }}
                    >
                      <CheckIcon fontSize="small" />
                    </IconButton>
                  )}
                  <IconButton
                    size="sm"
                    variant="plain"
                    color="neutral"
                    onClick={() => clearNotification(notification.id)}
                    sx={{ opacity: 0.4, "&:hover": { opacity: 1, color: "danger.500" } }}
                  >
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </Box>
              }
            >
              <ListItemDecorator sx={{ color: getNotificationColor(notification.type) }}>
                {getNotificationIcon(notification.type)}
              </ListItemDecorator>
              <ListItemContent>
                <Typography
                  level="body-sm"
                  fontWeight={notification.read ? "400" : "600"}
                  sx={{
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                    maxWidth: "100%",
                  }}
                >
                  {notification.title}
                </Typography>
                <Typography
                  level="body-xs"
                  sx={{
                    color: "text.secondary",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                    maxWidth: "100%",
                    mt: 0.25,
                  }}
                >
                  {notification.message}
                </Typography>
                <Typography
                  level="body-xs"
                  sx={{ color: "text.tertiary", mt: 0.25, fontSize: "0.7rem" }}
                >
                  {formatTimestamp(notification.timestamp)}
                </Typography>
              </ListItemContent>
            </ListItem>
          ))}
        </List>
      )}
    </Box>
  );
}

export default NotificationCenter;
