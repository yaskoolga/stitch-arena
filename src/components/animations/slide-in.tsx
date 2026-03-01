"use client";

import { motion, HTMLMotionProps } from "framer-motion";

interface SlideInProps extends HTMLMotionProps<"div"> {
  direction?: "up" | "down" | "left" | "right";
  delay?: number;
  duration?: number;
  children: React.ReactNode;
}

export function SlideIn({
  direction = "up",
  delay = 0,
  duration = 0.3,
  children,
  ...props
}: SlideInProps) {
  const directions = {
    up: { y: 20 },
    down: { y: -20 },
    left: { x: 20 },
    right: { x: -20 },
  };

  return (
    <motion.div
      initial={{ opacity: 0, ...directions[direction] }}
      animate={{ opacity: 1, x: 0, y: 0 }}
      exit={{ opacity: 0, ...directions[direction] }}
      transition={{ duration, delay }}
      {...props}
    >
      {children}
    </motion.div>
  );
}
