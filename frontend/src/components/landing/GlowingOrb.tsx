import { useEffect, useRef } from "react";
import { gsap } from "gsap";

export const GlowingOrb = () => {
  const orbRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!orbRef.current) return;

    const orb = orbRef.current;

    // Pulsing glow effect
    gsap.to(orb, {
      scale: 1.2,
      opacity: 0.8,
      duration: 2,
      repeat: -1,
      yoyo: true,
      ease: "power1.inOut",
    });

    // Rotation
    gsap.to(orb, {
      rotation: 360,
      duration: 20,
      repeat: -1,
      ease: "none",
    });

    // Random floating movement
    const randomMovement = () => {
      gsap.to(orb, {
        x: Math.random() * 40 - 20,
        y: Math.random() * 40 - 20,
        duration: 3 + Math.random() * 2,
        ease: "power1.inOut",
        onComplete: randomMovement,
      });
    };

    randomMovement();

    return () => {
      gsap.killTweensOf(orb);
    };
  }, []);

  return (
    <div
      ref={orbRef}
      style={{
        width: "200px",
        height: "200px",
        background:
          "radial-gradient(circle, rgba(202,126,234,0.8) 0%, rgba(118,75,162,0.4) 50%, transparent 70%)",
        borderRadius: "50%",
        filter: "blur(40px)",
        position: "absolute",
        left: Math.random() * 100 + "%",
        top: Math.random() * 100 + "%",
        transform: "translate(-50%, -50%)",
      }}
    />
  );
};