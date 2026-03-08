import { Box, Typography, Container } from "@mui/joy";

export function Footer() {
  return (
    <Box
      component="footer"
      sx={{
        py: 6,
        bgcolor: "#1a1a1a",
        color: "white",
      }}
    >
      <Container maxWidth="lg">
        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "column", md: "row" },
            justifyContent: "space-between",
            alignItems: { xs: "center", md: "flex-start" },
            gap: 4,
          }}
        >
          <Box sx={{ maxWidth: { xs: "100%", md: "400px" } }}>
            <Typography
              level="h3"
              sx={{
                mb: 2,
                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              Ephemeral
            </Typography>
            <Typography sx={{ opacity: 0.8, lineHeight: 1.6 }}>
              Privacy-first social platform for authentic human connection
              through temporary content and emotional compatibility.
            </Typography>
          </Box>

          <Box
            sx={{
              display: "flex",
              gap: 6,
              flexWrap: "wrap",
            }}
          >
            <Box>
              <Typography level="h4" sx={{ mb: 2, fontSize: "1rem" }}>
                Product
              </Typography>
              <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                <Typography
                  sx={{
                    opacity: 0.7,
                    cursor: "pointer",
                    "&:hover": { opacity: 1 },
                  }}
                >
                  Features
                </Typography>
                <Typography
                  sx={{
                    opacity: 0.7,
                    cursor: "pointer",
                    "&:hover": { opacity: 1 },
                  }}
                >
                  How it Works
                </Typography>
                <Typography
                  sx={{
                    opacity: 0.7,
                    cursor: "pointer",
                    "&:hover": { opacity: 1 },
                  }}
                >
                  Privacy
                </Typography>
              </Box>
            </Box>

            <Box>
              <Typography level="h4" sx={{ mb: 2, fontSize: "1rem" }}>
                Company
              </Typography>
              <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                <Typography
                  sx={{
                    opacity: 0.7,
                    cursor: "pointer",
                    "&:hover": { opacity: 1 },
                  }}
                >
                  About
                </Typography>
                <Typography
                  sx={{
                    opacity: 0.7,
                    cursor: "pointer",
                    "&:hover": { opacity: 1 },
                  }}
                >
                  Blog
                </Typography>
                <Typography
                  sx={{
                    opacity: 0.7,
                    cursor: "pointer",
                    "&:hover": { opacity: 1 },
                  }}
                >
                  Contact
                </Typography>
              </Box>
            </Box>

            <Box>
              <Typography level="h4" sx={{ mb: 2, fontSize: "1rem" }}>
                Legal
              </Typography>
              <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                <Typography
                  sx={{
                    opacity: 0.7,
                    cursor: "pointer",
                    "&:hover": { opacity: 1 },
                  }}
                >
                  Privacy Policy
                </Typography>
                <Typography
                  sx={{
                    opacity: 0.7,
                    cursor: "pointer",
                    "&:hover": { opacity: 1 },
                  }}
                >
                  Terms of Service
                </Typography>
                <Typography
                  sx={{
                    opacity: 0.7,
                    cursor: "pointer",
                    "&:hover": { opacity: 1 },
                  }}
                >
                  Cookie Policy
                </Typography>
              </Box>
            </Box>
          </Box>
        </Box>

        <Box
          sx={{
            mt: 6,
            pt: 4,
            borderTop: "1px solid rgba(255,255,255,0.1)",
            textAlign: "center",
            opacity: 0.6,
          }}
        >
          <Typography sx={{ fontSize: "0.9rem" }}>
            © 2025 Ephemeral. All rights reserved.
          </Typography>
        </Box>
      </Container>
    </Box>
  );
}
