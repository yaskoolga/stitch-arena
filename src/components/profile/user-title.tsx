"use client";

import { useTranslations } from "next-intl";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { ACHIEVEMENTS, RARITY_CONFIG } from "@/lib/constants";
import { cn } from "@/lib/utils";

interface UserTitleProps {
  achievementId: string | null | undefined;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function UserTitle({ achievementId, size = "md", className }: UserTitleProps) {
  const t = useTranslations("achievements");

  if (!achievementId) return null;

  const achievement = Object.values(ACHIEVEMENTS).find((a) => a.id === achievementId);
  if (!achievement) return null;

  const rarityConfig = RARITY_CONFIG[achievement.rarity];

  const sizeClasses = {
    sm: {
      emoji: "text-xs",
      text: "text-[9px]",
      padding: "px-1.5 py-0.5",
    },
    md: {
      emoji: "text-sm",
      text: "text-[10px]",
      padding: "px-2 py-0.5",
    },
    lg: {
      emoji: "text-base",
      text: "text-xs",
      padding: "px-2.5 py-1",
    },
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div
            className={cn(
              "inline-flex items-center gap-1 rounded-md font-medium whitespace-nowrap",
              rarityConfig.bgColor,
              rarityConfig.color,
              sizeClasses[size].padding,
              className
            )}
          >
            <span className={sizeClasses[size].emoji}>{achievement.emoji}</span>
            <span className={sizeClasses[size].text}>
              {t(`list.${achievement.id}.name`)}
            </span>
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <div className="space-y-0.5">
            <p className="text-xs font-semibold">
              {t(`list.${achievement.id}.name`)}
            </p>
            <p className="text-[10px] text-muted-foreground">
              {t(`list.${achievement.id}.description`)}
            </p>
            <div className="flex items-center gap-1 pt-1">
              <span className="text-[10px]">{rarityConfig.emoji}</span>
              <span className={`text-[10px] font-medium ${rarityConfig.color}`}>
                {rarityConfig.name}
              </span>
            </div>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
