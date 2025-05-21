import React, { useEffect } from 'react';
import { motion, useMotionTemplate, useMotionValue, animate } from 'framer-motion';

// Array of colors to be animated in the aurora gradient
const COLORS_TOP = ['#13FFAA', '#1E67C6', '#CE84CF', '#DD335C'];

export const AuroraGradientBackground: React.FC = () => {
  // Initialize motion value with the first color
  const color = useMotionValue(COLORS_TOP[0]);

  useEffect(() => {
    // Animate the color changes in a loop
    animate(color, COLORS_TOP, {
      ease: 'easeInOut',
      duration: 10,
      repeat: Infinity,
      repeatType: 'mirror',
    });
  }, [color]);

  // Use motion template to create a dynamic background gradient
  const backgroundImage = useMotionTemplate`radial-gradient(125% 125% at 50% 0%, #020617 50%, ${color})`;

  return (
    <motion.div
      style={{ backgroundImage }}
      className="absolute inset-0 w-full h-full pointer-events-none z-0"
      aria-hidden="true"
    />
  );
};