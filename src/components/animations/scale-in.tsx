"use client";

import { motion, HTMLMotionProps } from "framer-motion";

interface ScaleInProps extends HTMLMotionProps<"div"> {
  delay?: number;
  duration?: number;
  children: React.ReactNode;
}

export function ScaleIn({
  delay = 0,
  duration = 0.2,
  children,
  ...props
}: ScaleInProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration, delay }}
      {...props}
    >
      {children}
    </motion.div>
  );
}
