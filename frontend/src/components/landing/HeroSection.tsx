import { Box, Typography, Container } from "@mui/joy";
import { ArrowForward as ArrowForwardIcon } from "@mui/icons-material";
import { gsap } from "gsap";

// Common button styles
const buttonStyles = {
  background: "white",
  color: "#667eea",
  padding: "16px 32px",
  fontSize: "1.1rem",
  fontWeight: 600,
  border: "none",
  borderRadius: "50px",
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
  gap: "8px",
  transition: "all 0.3s ease",
  boxShadow: "0 10px 30px rgba(0,0,0,0.2)",
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

interface HeroSectionProps {
  onGetStarted: () => void;
}

export function HeroSection({ onGetStarted }: HeroSectionProps) {
  return (
    <Box
      sx={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        display: "flex",
        alignItems: "center",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Background decorative elements */}
      <Box
        sx={{
          position: "absolute",
          top: "20%",
          right: "15%",
          width: 100,
          height: 100,
          background: "rgba(255,255,255,0.03)",
          borderRadius: "50%",
          border: "1px solid rgba(255,255,255,0.1)",
        }}
      />
      <Box
        sx={{
          position: "absolute",
          bottom: "15%",
          left: "8%",
          width: 150,
          height: 150,
          background: "rgba(255,255,255,0.02)",
          borderRadius: "50%",
          border: "1px solid rgba(255,255,255,0.08)",
        }}
      />

      <Container maxWidth="lg">
        <Box
          sx={{
            textAlign: "center",
            color: "white",
            zIndex: 1,
            position: "relative",
          }}
        >
          <Typography
            level="h1"
            sx={{
              fontSize: { xs: "3rem", md: "5rem" },
              fontWeight: "bold",
              mb: 2,
              textShadow: "0 4px 20px rgba(0,0,0,0.1)",
              letterSpacing: "-0.02em",
            }}
          >
            Ephemeral
          </Typography>

          <Typography
            level="h2"
            sx={{
              fontSize: { xs: "1.3rem", md: "1.8rem" },
              mb: 3,
              opacity: 0.9,
              fontWeight: 300,
              letterSpacing: "0.02em",
            }}
          >
            Privacy-First Social Connections
          </Typography>

          <Typography
            sx={{
              fontSize: { xs: "1.1rem", md: "1.3rem" },
              mb: 5,
              maxWidth: "700px",
              mx: "auto",
              opacity: 0.95,
              lineHeight: 1.7,
              letterSpacing: "0.01em",
              color: "white",
              textShadow: "0 2px 4px rgba(0,0,0,0.3)",
            }}
          >
            Experience authentic human connection through temporary content,
            anonymous interactions, and emotional compatibility matching. Remove
            social media pressures and focus on genuine emotional resonance.
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
              Get Started
              <ArrowForwardIcon />
            </button>
          </Box>
        </Box>
      </Container>
    </Box>
  );
}
