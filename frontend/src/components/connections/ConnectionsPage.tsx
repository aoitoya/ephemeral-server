import { useState } from "react";
import { Tabs, Tab, Box, Typography, TabList, TabPanel } from "@mui/joy";
import ConnectionsList from "./ConnectionsList";
import ConnectionRequests from "./ConnectionRequests";

type TabValue = "all" | "requests";

export default function ConnectionsPage() {
  const [activeTab, setActiveTab] = useState<TabValue>("all");

  return (
    <Box sx={{ p: 3, maxWidth: 1200, mx: "auto" }}>
      <Typography level="h2" component="h1" sx={{ mb: 3 }}>
        Connections
      </Typography>
      <Tabs
        value={activeTab}
        onChange={(_, value) => setActiveTab(value as TabValue)}
        sx={{ mb: 3 }}
      >
        <TabList>
          <Tab value="all">All Connections</Tab>
          <Tab value="requests">Connection Requests</Tab>
        </TabList>

        <TabPanel value="all">
          <ConnectionsList />
        </TabPanel>
        <TabPanel value="requests">
          <ConnectionRequests />
        </TabPanel>
      </Tabs>
    </Box>
  );
}
