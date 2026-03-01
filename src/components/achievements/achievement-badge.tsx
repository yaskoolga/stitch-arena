"use client";

import { cn } from "@/lib/utils";
import { Progress } from "@/components/ui/progress";
import { RARITY_CONFIG, type AchievementRarity } from "@/lib/constants";

interface AchievementBadgeProps {
  name: string;
  description: string;
  emoji: string;
  isUnlocked: boolean;
  rarity?: AchievementRarity;
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
  rarity = "bronze",
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
      rarityBadge: "text-[9px]",
    },
    md: {
      container: "p-2.5",
      emoji: "text-xl",
      name: "text-xs",
      description: "text-[10px]",
      rarityBadge: "text-[10px]",
    },
    lg: {
      container: "p-3",
      emoji: "text-3xl",
      name: "text-sm",
      description: "text-xs",
      rarityBadge: "text-xs",
    },
  };

  const rarityConfig = RARITY_CONFIG[rarity];
  const progressPercent = requirement > 0 ? Math.min((progress / requirement) * 100, 100) : 0;

  return (
    <div
      className={cn(
        "rounded-lg border transition-all",
        sizeClasses[size].container,
        isUnlocked
          ? `${rarityConfig.bgColor} border-${rarity === "bronze" ? "amber" : rarity === "silver" ? "gray" : rarity === "gold" ? "yellow" : "cyan"}-200 dark:border-${rarity === "bronze" ? "amber" : rarity === "silver" ? "gray" : rarity === "gold" ? "yellow" : "cyan"}-800`
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

        {/* Rarity badge */}
        <div className={cn("flex items-center gap-1", sizeClasses[size].rarityBadge)}>
          <span>{rarityConfig.emoji}</span>
          <span className={cn("font-medium", isUnlocked ? rarityConfig.color : "text-muted-foreground opacity-50")}>
            {rarityConfig.name}
          </span>
        </div>

        {showProgress && !isUnlocked && requirement > 0 && (
          <div className="w-full space-y-0.5 mt-1">
            <Progress value={progressPercent} className="h-1.5 rounded-full" />
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
