import { Box, Typography, Container, Grid, Card, CardContent } from "@mui/joy";
import {
  Send as SendIcon,
  TrendingUp as TrendingIcon,
  Timer as TimerIcon,
  Archive as ArchiveIcon,
} from "@mui/icons-material";

export function HowItWorks() {
  const steps = [
    {
      icon: <SendIcon sx={{ fontSize: 40, color: "#667eea" }} />,
      title: "Create Content",
      description:
        "Share your thoughts, moments, or feelings with optional emotional tags.",
      number: "1",
    },
    {
      icon: <TrendingIcon sx={{ fontSize: 40, color: "#764ba2" }} />,
      title: "Engage Naturally",
      description:
        "Content gains engagement and starts to sparkle with interactive effects.",
      number: "2",
    },
    {
      icon: <TimerIcon sx={{ fontSize: 40, color: "#667eea" }} />,
      title: "Watch it Bloom & Fade",
      description:
        "Content pops with sprinkle effects and vanishes naturally when engagement declines.",
      number: "3",
    },
    {
      icon: <ArchiveIcon sx={{ fontSize: 40, color: "#764ba2" }} />,
      title: "Personal Reflection",
      description:
        "Your content stays in your private archive for personal growth and reflection.",
      number: "4",
    },
  ];

  return (
    <Box sx={{ py: { xs: 8, md: 12 }, bgcolor: "white" }}>
      <Container maxWidth="lg">
        <Box sx={{ textAlign: "center", mb: 8 }}>
          <Typography
            level="h2"
            sx={{
              fontSize: { xs: "2.5rem", md: "3rem" },
              mb: 2,
              color: "#333",
            }}
          >
            How Ephemeral Works
          </Typography>
          <Typography
            sx={{
              fontSize: "1.2rem",
              color: "text.secondary",
              maxWidth: "600px",
              mx: "auto",
            }}
          >
            A natural cycle of creation, connection, and graceful disappearance
          </Typography>
        </Box>

        <Grid container spacing={4} sx={{ mb: 8 }}>
          {steps.map((step, index) => (
            <Grid xs={12} sm={6} md={3} key={index}>
              <Card
                className="step-card"
                sx={{
                  height: "100%",
                  p: 3,
                  textAlign: "center",
                  position: "relative",
                  border: "1px solid rgba(0,0,0,0.08)",
                  borderRadius: "lg",
                  transition:
                    "all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)",
                  background:
                    "linear-gradient(135deg, rgba(102, 126, 234, 0.02) 0%, rgba(118, 75, 162, 0.02) 100%)",
                  backdropFilter: "blur(10px)",
                }}
              >
                <Box
                  sx={{
                    position: "absolute",
                    top: -15,
                    left: "50%",
                    transform: "translateX(-50%)",
                    width: 35,
                    height: 35,
                    background:
                      "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "white",
                    fontWeight: "bold",
                    fontSize: "1rem",
                    boxShadow: "0 8px 25px rgba(102, 126, 234, 0.3)",
                  }}
                >
                  {step.number}
                </Box>

                <CardContent sx={{ pt: 2 }}>
                  <Box
                    sx={{ mb: 2, display: "flex", justifyContent: "center" }}
                  >
                    <Box
                      sx={{
                        p: 2,
                        height: "100%",
                        aspectRatio: 1,
                        borderRadius: "50%",
                        background: "rgba(255,255,255,0.8)",
                        backdropFilter: "blur(10px)",
                        border: "1px solid rgba(102, 126, 234, 0.2)",
                        transition: "all 0.3s ease",
                      }}
                    >
                      {step.icon}
                    </Box>
                  </Box>
                  <Typography level="h3" sx={{ mb: 1, fontSize: "1.2rem" }}>
                    {step.title}
                  </Typography>
                  <Typography
                    sx={{
                      color: "text.secondary",
                      lineHeight: 1.6,
                      fontSize: "0.9rem",
                    }}
                  >
                    {step.description}
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
