"use client";

import { cn } from "@/lib/utils";
import { Progress } from "@/components/ui/progress";

interface AchievementBadgeProps {
  name: string;
  description: string;
  emoji: string;
  isUnlocked: boolean;
  progress?: number;
  requirement?: number;
  size?: "sm" | "md" | "lg";
  showProgress?: boolean;
  className?: string;
}

export function AchievementBadge({
  name,
  description,
  emoji,
  isUnlocked,
  progress = 0,
  requirement = 0,
  size = "md",
  showProgress = true,
  className,
}: AchievementBadgeProps) {
  const sizeClasses = {
    sm: {
      container: "p-1.5",
      emoji: "text-lg",
      name: "text-[10px]",
      description: "text-[9px]",
    },
    md: {
      container: "p-2.5",
      emoji: "text-xl",
      name: "text-xs",
      description: "text-[10px]",
    },
    lg: {
      container: "p-3",
      emoji: "text-3xl",
      name: "text-sm",
      description: "text-xs",
    },
  };

  const progressPercent = requirement > 0 ? Math.min((progress / requirement) * 100, 100) : 0;

  return (
    <div
      className={cn(
        "rounded-lg border transition-all",
        sizeClasses[size].container,
        isUnlocked
          ? "bg-gradient-to-br from-yellow-50 to-amber-50 dark:from-yellow-950/20 dark:to-amber-950/20 border-yellow-200 dark:border-yellow-800"
          : "bg-muted/50 border-muted opacity-60 grayscale",
        className
      )}
    >
      <div className="flex flex-col items-center text-center gap-1.5">
        <div className={sizeClasses[size].emoji}>{emoji}</div>
        <div>
          <div className={cn("font-semibold leading-tight", sizeClasses[size].name)}>
            {name}
          </div>
          <div className={cn("text-muted-foreground leading-tight mt-0.5", sizeClasses[size].description)}>
            {description}
          </div>
        </div>

        {showProgress && !isUnlocked && requirement > 0 && (
          <div className="w-full space-y-0.5 mt-1">
            <Progress value={progressPercent} className="h-1.5" />
            <div className="text-[10px] text-muted-foreground">
              {progress.toLocaleString()} / {requirement.toLocaleString()}
            </div>
          </div>
        )}

        {isUnlocked && (
          <div className="text-[10px] text-green-600 dark:text-green-400 font-medium mt-0.5">
            ✓ Unlocked
          </div>
        )}
      </div>
    </div>
  );
}
