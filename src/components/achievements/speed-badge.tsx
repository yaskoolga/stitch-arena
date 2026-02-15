"use client";

import { SPEED_TIERS, getSpeedTier } from "@/lib/constants";
import { cn } from "@/lib/utils";

interface SpeedBadgeProps {
  avgStitchesPerDay: number;
  size?: "sm" | "md" | "lg";
  showLabel?: boolean;
  className?: string;
}

export function SpeedBadge({
  avgStitchesPerDay,
  size = "md",
  showLabel = false,
  className,
}: SpeedBadgeProps) {
  const tierKey = getSpeedTier(avgStitchesPerDay);
  const tier = SPEED_TIERS[tierKey];

  const sizeClasses = {
    sm: "text-lg",
    md: "text-2xl",
    lg: "text-4xl",
  };

  return (
    <div
      className={cn("flex items-center gap-2", className)}
      title={`${tier.name}: ${tier.description} (${avgStitchesPerDay.toFixed(1)} stitches/day)`}
    >
      <span className={sizeClasses[size]} role="img" aria-label={tier.name}>
        {tier.emoji}
      </span>
      {showLabel && (
        <div className="flex flex-col">
          <span className="text-sm font-medium">{tier.name}</span>
          <span className="text-xs text-muted-foreground">
            {avgStitchesPerDay.toFixed(1)} st/day
          </span>
        </div>
      )}
    </div>
  );
}
