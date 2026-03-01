"use client";

import { useEffect, useState } from "react";
import confetti from "canvas-confetti";
import { useTranslations } from "next-intl";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Level } from "@/lib/levels";
import { Sparkles } from "lucide-react";

interface LevelUpCelebrationProps {
  newLevel: Level;
  onClose: () => void;
}

export function LevelUpCelebration({ newLevel, onClose }: LevelUpCelebrationProps) {
  const t = useTranslations("levelUp");
  const [open, setOpen] = useState(true);

  useEffect(() => {
    // Trigger confetti animation - very slow for maximum visibility
    const duration = 36000; // 36 seconds - very long celebration
    const animationEnd = Date.now() + duration;
    const defaults = {
      startVelocity: 20, // Slower initial velocity
      spread: 360,
      ticks: 200, // Very slow fall
      zIndex: 9999,
      scalar: 1.4, // Bigger particles
      gravity: 0.6 // Much slower gravity
    };

    function randomInRange(min: number, max: number) {
      return Math.random() * (max - min) + min;
    }

    // Initial big burst
    confetti({
      ...defaults,
      particleCount: 250,
      origin: { x: 0.5, y: 0.5 },
    });

    const interval = setInterval(function () {
      const timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        return clearInterval(interval);
      }

      const particleCount = 100 * (timeLeft / duration);

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
    }, 800); // Very slow interval

    return () => clearInterval(interval);
  }, []);

  const handleClose = () => {
    setOpen(false);
    setTimeout(onClose, 300);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md rounded-2xl z-[10000]">
        <DialogHeader className="text-center space-y-8">
          <div className="mx-auto w-40 h-40 rounded-full bg-gradient-to-br from-primary/20 to-success/20 flex items-center justify-center shadow-2xl">
            <span className="text-8xl">{newLevel.emoji}</span>
          </div>
          <DialogTitle className="text-5xl font-bold bg-gradient-to-r from-primary via-success to-primary bg-clip-text text-transparent leading-tight">
            {t("congratulations")}
          </DialogTitle>
          <DialogDescription className="text-2xl space-y-4">
            <p className="text-foreground font-bold text-3xl leading-relaxed">
              {t("leveledUp", { level: newLevel.level, name: newLevel.name })}
            </p>
            <p className="text-muted-foreground text-xl leading-relaxed">
              {t("keepStitching")}
            </p>
          </DialogDescription>
        </DialogHeader>
        <div className="flex justify-center mt-8">
          <Button
            onClick={handleClose}
            size="lg"
            className="rounded-full gap-2 text-xl px-10 py-7 shadow-lg hover:shadow-xl transition-all"
          >
            <Sparkles className="size-6" />
            {t("continue")}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
