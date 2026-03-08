import { Box, Typography, Container } from "@mui/joy";
import { ArrowForward as ArrowForwardIcon } from "@mui/icons-material";
import { gsap } from "gsap";

// Common button styles (shared with HeroSection)
const buttonStyles = {
  background: "white",
  color: "#667eea",
  padding: "18px 36px",
  fontSize: "1.2rem",
  fontWeight: 600,
  border: "none",
  borderRadius: "50px",
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
  gap: "10px",
  transition: "all 0.3s ease",
  boxShadow: "0 15px 35px rgba(0,0,0,0.2)",
  position: "relative" as const,
  overflow: "hidden",
};

const handleButtonHover = (e: React.MouseEvent, scale: number) => {
  gsap.to(e.currentTarget, {
    scale,
    duration: 0.3,
    ease: "power2.out",
  });
};

interface CTASectionProps {
  onGetStarted: () => void;
}

export function CTASection({ onGetStarted }: CTASectionProps) {
  return (
    <Box
      sx={{
        py: { xs: 8, md: 12 },
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <Container maxWidth="md">
        <Box
          sx={{
            textAlign: "center",
            color: "white",
            position: "relative",
            zIndex: 1,
          }}
        >
          <Typography
            level="h2"
            sx={{
              fontSize: { xs: "2.5rem", md: "3.5rem" },
              mb: 3,
              fontWeight: "bold",
              letterSpacing: "-0.02em",
            }}
          >
            Ready to Experience Serendipties?
          </Typography>

          <Typography
            sx={{
              fontSize: { xs: "1.1rem", md: "1.3rem" },
              mb: 4,
              opacity: 0.95,
              lineHeight: 1.7,
              maxWidth: "700px",
              mx: "auto",
              color: "white",
              textShadow: "0 2px 4px rgba(0,0,0,0.3)",
            }}
          >
            Join a community that values privacy, emotional authenticity, and
            meaningful interactions. No pressure, no permanent records, just
            genuine human connection.
          </Typography>

          <Box
            sx={{
              display: "flex",
              gap: 3,
              justifyContent: "center",
              flexWrap: "wrap",
            }}
          >
            <button
              onClick={onGetStarted}
              style={buttonStyles}
              onMouseEnter={(e) => handleButtonHover(e, 1.05)}
              onMouseLeave={(e) => handleButtonHover(e, 1)}
            >
              Start Your Journey
              <ArrowForwardIcon />
            </button>
          </Box>
        </Box>
      </Container>
    </Box>
  );
}
