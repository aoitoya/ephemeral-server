import React from "react";
import { createFileRoute, redirect } from "@tanstack/react-router";
import { Box, Typography, Tabs, TabList, Tab, TabPanel } from "@mui/joy";
import { LoginForm } from "../components/auth/LoginForm";
import { SignupForm } from "../components/auth/SignupForm";
import { userAPI } from "@/services/api/user.api";
import { isLoggedIn } from "@/services/utils";

export const Route = createFileRoute("/_index")({
  beforeLoad: async () => {
    try {
      if (!isLoggedIn()) return;
      await userAPI.getMe();
      throw redirect({ to: "/feed" });
    } catch (error) {
      const err = error as { response?: { status?: number } };
      if (err.response?.status === 401) return;
      throw error;
    }
  },
  component: HomePage,
});

function HomePage() {
  const [selectedTab, setSelectedTab] = React.useState(0);

  return (
    <Box
      sx={{
        display: "flex",
        minHeight: "100vh",
        alignItems: "center",
        justifyContent: "center",
        gap: { xs: 4, md: 8 },
        flexDirection: { xs: "column", md: "row" },
        p: { xs: 2, md: 4 },
        bgcolor: "background.body",
      }}
    >
      {/* Left side - Hero Text */}
      <Box
        sx={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          textAlign: { xs: "center", md: "left" },
          maxWidth: { md: "450px" },
          p: 4,
        }}
      >
        <Typography
          level="h1"
          sx={{
            color: "text.primary",
            fontWeight: 700,
            fontSize: { xs: "2.25rem", md: "3rem" },
            lineHeight: 1.2,
          }}
        >
          a little uncomplicated social platform
        </Typography>
      </Box>

      {/* Right side - Login/Signup Form */}
      <Box
        sx={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          maxWidth: { xs: "100%", sm: "400px" },
          p: 4,
          borderRadius: "xl",
          bgcolor: "background.surface",
          border: "1px solid",
          borderColor: "neutral.outlinedBorder",
          boxShadow: "sm",
        }}
      >
        <Tabs
          value={selectedTab}
          onChange={(_, newValue) => setSelectedTab(newValue as number)}
          aria-label="Auth tabs"
          sx={{
            width: "100%",
            borderRadius: "lg",
            bgcolor: "background.level1",
            p: 1,
          }}
        >
          <TabList
            variant="plain"
            sx={{
              "--List-gap": "0px",
              "--List-padding": "0px",
              "--ListItem-minHeight": "40px",
              borderRadius: "lg",
            }}
          >
            <Tab
              disableIndicator
              sx={{
                flex: 1,
                borderRadius: "md",
                "&.Mui-selected": {
                  bgcolor: "background.surface",
                  boxShadow: "xs",
                },
                "&:not(.Mui-selected)": {
                  color: "text.secondary",
                },
              }}
            >
              Login
            </Tab>
            <Tab
              disableIndicator
              sx={{
                flex: 1,
                borderRadius: "md",
                "&.Mui-selected": {
                  bgcolor: "background.surface",
                  boxShadow: "xs",
                },
                "&:not(.Mui-selected)": {
                  color: "text.secondary",
                },
              }}
            >
              Sign Up
            </Tab>
          </TabList>
          <TabPanel value={0} sx={{ p: 3 }}>
            <LoginForm />
          </TabPanel>
          <TabPanel value={1} sx={{ p: 3 }}>
            <SignupForm />
          </TabPanel>
        </Tabs>
      </Box>
    </Box>
  );
}
