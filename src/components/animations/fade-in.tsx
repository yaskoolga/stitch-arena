"use client";

import { motion, HTMLMotionProps } from "framer-motion";

interface FadeInProps extends HTMLMotionProps<"div"> {
  delay?: number;
  duration?: number;
  children: React.ReactNode;
}

export function FadeIn({
  delay = 0,
  duration = 0.3,
  children,
  ...props
}: FadeInProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration, delay }}
      {...props}
    >
      {children}
    </motion.div>
  );
}
