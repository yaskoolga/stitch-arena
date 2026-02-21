"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getTopBadges, type AchievementBadge } from "@/lib/achievement-badges";
import { Trophy } from "lucide-react";

interface AchievementBadgesProps {
  achievementIds: string[];
  maxDisplay?: number;
}

export function AchievementBadges({
  achievementIds,
  maxDisplay = 5,
}: AchievementBadgesProps) {
  const badges = getTopBadges(achievementIds, maxDisplay);

  if (badges.length === 0) {
    return null;
  }

  return (
    <Card className="overflow-hidden">
      <CardContent className="pt-6">
        <div className="flex items-center gap-2 mb-4">
          <Trophy className="h-5 w-5 text-amber-500" />
          <h3 className="font-semibold text-lg">Special Badges</h3>
          <Badge variant="secondary" className="ml-auto">
            {badges.length}
          </Badge>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
          {badges.map((badge) => (
            <BadgeCard key={badge.id} badge={badge} />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function BadgeCard({ badge }: { badge: AchievementBadge }) {
  return (
    <div
      className="group relative rounded-lg p-4 border-2 border-transparent hover:border-primary/50 transition-all cursor-pointer bg-gradient-to-br from-background to-muted"
      title={badge.description}
    >
      {/* Gradient overlay */}
      <div
        className={`absolute inset-0 rounded-lg bg-gradient-to-br ${badge.color} opacity-10 group-hover:opacity-20 transition-opacity`}
      />

      {/* Content */}
      <div className="relative flex flex-col items-center text-center gap-2">
        {/* Icon */}
        <div className="text-4xl group-hover:scale-110 transition-transform">
          {badge.icon}
        </div>

        {/* Name */}
        <div>
          <p className="font-semibold text-sm line-clamp-1">{badge.name}</p>
          <p className="text-xs text-muted-foreground capitalize">
            {badge.tier}
          </p>
        </div>

        {/* Tier indicator */}
        <div className="absolute -top-1 -right-1">
          <div
            className={`h-2 w-2 rounded-full bg-gradient-to-br ${badge.color}`}
          />
        </div>
      </div>

      {/* Tooltip on hover */}
      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-popover text-popover-foreground rounded-lg shadow-lg border opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10 text-xs">
        {badge.description}
        <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-t-popover" />
      </div>
    </div>
  );
}
