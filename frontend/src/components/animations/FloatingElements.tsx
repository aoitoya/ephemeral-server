import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';

interface FloatingElementProps {
  children: React.ReactNode;
  duration?: number;
  delay?: number;
  yDistance?: number;
  rotation?: number;
}

export function FloatingElement({ 
  children, 
  duration = 3, 
  delay = 0, 
  yDistance = 15,
  rotation = 0 
}: FloatingElementProps) {
  const elementRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (elementRef.current) {
      gsap.to(elementRef.current, {
        y: -yDistance,
        rotation: rotation,
        duration: duration,
        repeat: -1,
        yoyo: true,
        ease: 'power1.inOut',
        delay: delay
      });
    }
  }, [duration, delay, yDistance, rotation]);

  return (
    <div ref={elementRef} style={{ display: 'inline-block' }}>
      {children}
    </div>
  );
}

interface MagneticButtonProps {
  children: React.ReactNode;
  strength?: number;
}

export function MagneticButton({ children, strength = 0.3 }: MagneticButtonProps) {
  const buttonRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const button = buttonRef.current;
    if (!button) return;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = button.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;
      
      gsap.to(button, {
        x: x * strength,
        y: y * strength,
        duration: 0.3,
        ease: 'power2.out'
      });
    };

    const handleMouseLeave = () => {
      gsap.to(button, {
        x: 0,
        y: 0,
        duration: 0.3,
        ease: 'power2.out'
      });
    };

    button.addEventListener('mousemove', handleMouseMove);
    button.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      button.removeEventListener('mousemove', handleMouseMove);
      button.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [strength]);

  return (
    <div ref={buttonRef} style={{ display: 'inline-block' }}>
      {children}
    </div>
  );
}