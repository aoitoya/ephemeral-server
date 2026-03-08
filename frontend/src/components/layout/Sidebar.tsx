import { Link, useLocation } from "@tanstack/react-router";
import { Box, ListItemButton, Typography, useTheme } from "@mui/joy";
import HomeRoundedIcon from "@mui/icons-material/HomeRounded";
import ChatBubbleOutlineRoundedIcon from "@mui/icons-material/ChatBubbleOutlineRounded";
import PeopleOutlineRoundedIcon from "@mui/icons-material/PeopleOutlineRounded";
import { isLoggedIn } from "@/services/utils";
import { useMemo } from "react";
// import NotificationsRoundedIcon from "@mui/icons-material/NotificationsRounded";

interface NavItem {
  to: string;
  label: string;
  icon: React.ReactNode;
}

function NavLink({
  to,
  label,
  icon,
  isActive,
}: NavItem & { isActive: boolean }) {
  const theme = useTheme();

  return (
    <Link to={to} style={{ width: "100%", textDecoration: "none" }}>
      <ListItemButton
        variant={isActive ? "soft" : "plain"}
        color={isActive ? "primary" : "neutral"}
        sx={{
          borderRadius: "12px",
          py: 1.25,
          px: 2.5,
          "&:hover": {
            backgroundColor: theme.vars.palette.primary.softHoverBg,
          },
        }}
      >
        <Box component="span" sx={{ display: "inline-flex", mr: 1.5 }}>
          {icon}
        </Box>
        <Typography level="body-md" sx={{ fontWeight: isActive ? 600 : 400 }}>
          {label}
        </Typography>
      </ListItemButton>
    </Link>
  );
}

export default function Sidebar() {
  const location = useLocation();
  const currentPath = location.pathname;
  const loggedIn = useMemo(() => isLoggedIn(), []);

  const navItems: NavItem[] = loggedIn
    ? [
        { to: "/feed", label: "Feed", icon: <HomeRoundedIcon /> },
        {
          to: "/messeges",
          label: "Messages",
          icon: <ChatBubbleOutlineRoundedIcon />,
        },
        {
          to: "/connections",
          label: "Connections",
          icon: <PeopleOutlineRoundedIcon />,
        },
        // {
        //   to: "/notifications",
        //   label: "Notifications",
        //   icon: <NotificationsRoundedIcon />,
        // },
      ]
    : [{ to: "/feed", label: "Feed", icon: <HomeRoundedIcon /> }];

  return (
    <Box
      component="nav"
      sx={{
        width: 240,
        flexShrink: 0,
        p: 2,
        borderRight: "1px solid",
        borderColor: "divider",
        minHeight: "100vh",
        backgroundColor: "background.surface",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <Box
        sx={{
          px: 2,
          mb: 3,
        }}
      >
        <Typography
          level="h4"
          component="h1"
          sx={{
            fontWeight: 700,
            color: "primary.plainColor",
            letterSpacing: "-0.5px",
          }}
        >
          Ephemeral
        </Typography>
      </Box>

      <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}>
        {navItems.map((item) => (
          <NavLink key={item.to} {...item} isActive={currentPath === item.to} />
        ))}
      </Box>
    </Box>
  );
}
