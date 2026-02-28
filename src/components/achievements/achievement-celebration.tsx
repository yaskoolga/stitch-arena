"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Trophy } from "lucide-react";
import { ACHIEVEMENTS, RARITY_CONFIG } from "@/lib/constants";
import confetti from "canvas-confetti";

interface AchievementCelebrationProps {
  achievementIds: string[];
  onClose: () => void;
}

export function AchievementCelebration({
  achievementIds,
  onClose,
}: AchievementCelebrationProps) {
  const t = useTranslations("achievements");
  const tCommon = useTranslations("common");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [open, setOpen] = useState(true);

  const currentAchievementId = achievementIds[currentIndex];
  const achievement = Object.values(ACHIEVEMENTS).find(
    (a) => a.id === currentAchievementId
  );

  const hasMore = currentIndex < achievementIds.length - 1;

  useEffect(() => {
    if (open && achievement) {
      // Trigger confetti animation
      const duration = 3000;
      const animationEnd = Date.now() + duration;
      const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 9999 };

      function randomInRange(min: number, max: number) {
        return Math.random() * (max - min) + min;
      }

      const interval = setInterval(function () {
        const timeLeft = animationEnd - Date.now();

        if (timeLeft <= 0) {
          return clearInterval(interval);
        }

        const particleCount = 50 * (timeLeft / duration);

        // Confetti from different angles
        confetti({
          ...defaults,
          particleCount,
          origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
        });
        confetti({
          ...defaults,
          particleCount,
          origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
        });
      }, 250);

      return () => clearInterval(interval);
    }
  }, [open, achievement, currentIndex]);

  if (!achievement) return null;

  const rarityConfig = RARITY_CONFIG[achievement.rarity];

  const handleNext = () => {
    if (hasMore) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      handleClose();
    }
  };

  const handleClose = () => {
    setOpen(false);
    setTimeout(onClose, 300); // Wait for dialog close animation
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center text-2xl font-bold flex items-center justify-center gap-2">
            <Trophy className="h-6 w-6 text-yellow-500" />
            {t("unlocked")}
            <Trophy className="h-6 w-6 text-yellow-500" />
          </DialogTitle>
          <DialogDescription className="text-center text-xs text-muted-foreground">
            {achievementIds.length > 1 && (
              <span>
                {currentIndex + 1} / {achievementIds.length}
              </span>
            )}
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col items-center gap-4 py-6">
          {/* Achievement Icon with animation */}
          <div className="relative">
            <div
              className={`flex h-24 w-24 items-center justify-center rounded-full ${rarityConfig.bgColor} ring-4 ring-offset-4 ${rarityConfig.color.replace("text-", "ring-")} animate-pulse`}
            >
              <span className="text-6xl animate-bounce">{achievement.emoji}</span>
            </div>
            <div className="absolute -top-2 -right-2">
              <Sparkles className="h-6 w-6 text-yellow-400 animate-spin" />
            </div>
          </div>

          {/* Achievement Details */}
          <div className="text-center space-y-2">
            <h3 className="text-xl font-bold">
              {t(`list.${achievement.id}.name`)}
            </h3>
            <p className="text-sm text-muted-foreground">
              {t(`list.${achievement.id}.description`)}
            </p>
            <div className="flex items-center justify-center gap-2 pt-2">
              <Badge
                variant="outline"
                className={`${rarityConfig.bgColor} ${rarityConfig.color} border-0`}
              >
                <span className="mr-1">{rarityConfig.emoji}</span>
                {rarityConfig.name}
              </Badge>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          {hasMore ? (
            <>
              <Button variant="outline" onClick={handleClose} className="flex-1">
                {tCommon("close")}
              </Button>
              <Button onClick={handleNext} className="flex-1">
                {tCommon("next")} →
              </Button>
            </>
          ) : (
            <Button onClick={handleClose} className="w-full">
              {tCommon("close")}
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
