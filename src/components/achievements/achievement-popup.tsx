"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { X, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { getAchievementById } from "@/lib/achievements/config";

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  category: string;
}

interface AchievementPopupProps {
  achievementIds: string[];
  onClose: () => void;
}

export function AchievementPopup({ achievementIds, onClose }: AchievementPopupProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [achievements, setAchievements] = useState<Achievement[]>([]);

  useEffect(() => {
    // Load achievement details
    const details = achievementIds
      .map((id) => getAchievementById(id))
      .filter(Boolean) as Achievement[];
    setAchievements(details);
  }, [achievementIds]);

  useEffect(() => {
    if (achievements.length === 0) return;

    // Auto-advance to next achievement after 4 seconds
    const timer = setTimeout(() => {
      if (currentIndex < achievements.length - 1) {
        setCurrentIndex(currentIndex + 1);
      } else {
        onClose();
      }
    }, 4000);

    return () => clearTimeout(timer);
  }, [currentIndex, achievements, onClose]);

  if (achievements.length === 0) return null;

  const currentAchievement = achievements[currentIndex];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
      <AnimatePresence mode="wait">
        <motion.div
          key={currentIndex}
          initial={{ scale: 0, rotate: -180, opacity: 0 }}
          animate={{ scale: 1, rotate: 0, opacity: 1 }}
          exit={{ scale: 0, rotate: 180, opacity: 0 }}
          transition={{
            type: "spring",
            stiffness: 260,
            damping: 20,
          }}
          className="pointer-events-auto"
        >
          <Card className="relative p-8 rounded-2xl bg-gradient-to-br from-primary/10 via-background to-background border-2 border-primary/20 shadow-2xl max-w-md mx-4">
            {/* Close button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-1 rounded-full hover:bg-muted transition-colors"
            >
              <X className="h-5 w-5" />
            </button>

            {/* Content */}
            <div className="text-center space-y-4">
              {/* Icon with sparkle effect */}
              <div className="relative inline-block">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{
                    delay: 0.2,
                    type: "spring",
                    stiffness: 200,
                  }}
                  className="text-7xl"
                >
                  {currentAchievement.icon}
                </motion.div>

                {/* Sparkles */}
                {[...Array(6)].map((_, i) => (
                  <motion.div
                    key={i}
                    initial={{ scale: 0, x: 0, y: 0 }}
                    animate={{
                      scale: [0, 1, 0],
                      x: [0, (i % 2 ? 1 : -1) * (30 + i * 10)],
                      y: [0, -20 - i * 10],
                    }}
                    transition={{
                      delay: 0.3 + i * 0.1,
                      duration: 1,
                    }}
                    className="absolute top-1/2 left-1/2"
                    style={{
                      transform: `rotate(${i * 60}deg)`,
                    }}
                  >
                    <Sparkles className="h-4 w-4 text-primary fill-primary" />
                  </motion.div>
                ))}
              </div>

              {/* Title */}
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.4 }}
              >
                <h2 className="text-2xl font-bold">Achievement Unlocked!</h2>
                <h3 className="text-xl font-semibold text-primary mt-2">
                  {currentAchievement.title}
                </h3>
              </motion.div>

              {/* Description */}
              <motion.p
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="text-muted-foreground"
              >
                {currentAchievement.description}
              </motion.p>

              {/* Category badge */}
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.6 }}
              >
                <Badge variant="outline" className="rounded-full capitalize">
                  {currentAchievement.category}
                </Badge>
              </motion.div>

              {/* Progress indicator */}
              {achievements.length > 1 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.7 }}
                  className="flex gap-2 justify-center mt-4"
                >
                  {achievements.map((_, i) => (
                    <div
                      key={i}
                      className={`h-2 w-2 rounded-full transition-all ${
                        i === currentIndex
                          ? "bg-primary w-8"
                          : i < currentIndex
                          ? "bg-primary/50"
                          : "bg-muted"
                      }`}
                    />
                  ))}
                </motion.div>
              )}
            </div>
          </Card>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
