import { Box, Typography, Container, Grid, Card, CardContent } from "@mui/joy";
import {
  Timer as TimerIcon,
  AutoDelete as DeleteIcon,
  Archive as ArchiveIcon,
} from "@mui/icons-material";

export function FeaturesSection() {
  const features = [
    {
      icon: <TimerIcon sx={{ fontSize: 40, color: "#667eea" }} />,
      title: "Temporary Content",
      description:
        "Content automatically expires when engagement peaks and starts declining, creating natural content lifecycle.",
    },
    {
      icon: <DeleteIcon sx={{ fontSize: 40, color: "#764ba2" }} />,
      title: "Dynamic Lifespans",
      description:
        "Posts have different lifespans based on content type and initial engagement velocity. Popular content fades faster.",
    },
    {
      icon: <ArchiveIcon sx={{ fontSize: 40, color: "#764ba2" }} />,
      title: "Personal Archive",
      description:
        "Archive system for personal reflection, visible only to you for your own journey.",
    },
  ];

  return (
    <Box sx={{ py: { xs: 8, md: 12 }, bgcolor: "#f8f9fa" }}>
      <Container maxWidth="lg">
        <Box sx={{ textAlign: "center", mb: 8 }}>
          <Typography
            level="h2"
            sx={{
              fontSize: { xs: "2.5rem", md: "3rem" },
              mb: 2,
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            Features That Matter
          </Typography>
          <Typography
            sx={{
              fontSize: "1.2rem",
              color: "text.secondary",
              maxWidth: "600px",
              mx: "auto",
            }}
          >
            Built with privacy and authentic connections at the core
          </Typography>
        </Box>

        <Grid container spacing={4}>
          {features.map((feature, index) => (
            <Grid xs={12} md={6} lg={4} key={index}>
              <Card
                sx={{
                  height: "100%",
                  p: 3,
                  border: "1px solid rgba(0,0,0,0.08)",
                  borderRadius: "lg",
                  transition: "all 0.3s ease",
                  position: "relative",
                  overflow: "hidden",
                  "&::before": {
                    content: '""',
                    position: "absolute",
                    top: 0,
                    left: 0,
                    right: 0,
                    height: "4px",
                    background: "linear-gradient(90deg, #667eea, #764ba2)",
                    transform: "translateY(-100%)",
                    transition: "transform 0.3s ease",
                  },
                  "&:hover": {
                    transform: "translateY(-8px)",
                    boxShadow: "0 20px 40px rgba(102, 126, 234, 0.15)",
                    borderColor: "#667eea",
                    "&::before": {
                      transform: "translateY(0)",
                    },
                  },
                }}
              >
                <CardContent sx={{ textAlign: "center" }}>
                  <Box
                    sx={{ mb: 2, display: "flex", justifyContent: "center" }}
                  >
                    {feature.icon}
                  </Box>
                  <Typography level="h3" sx={{ mb: 1, fontSize: "1.3rem" }}>
                    {feature.title}
                  </Typography>
                  <Typography sx={{ color: "text.secondary", lineHeight: 1.6 }}>
                    {feature.description}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
}