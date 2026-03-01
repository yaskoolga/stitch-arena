"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { Award } from "lucide-react";
import { RARITY_COLORS, BadgeRarity } from "@/lib/badges/config";

interface BadgeData {
  key: string;
  name: string;
  description: string;
  icon: string;
  rarity: BadgeRarity;
  category: string;
  earnedAt: Date;
  isFeatured: boolean;
}

interface BadgeShowcaseProps {
  userId: string;
}

export function BadgeShowcase({ userId }: BadgeShowcaseProps) {
  const [featuredBadges, setFeaturedBadges] = useState<BadgeData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFeaturedBadges();
  }, [userId]);

  const fetchFeaturedBadges = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/users/${userId}/badges?featured=true`);
      const data = await res.json();
      setFeaturedBadges(data.badges || []);
    } catch (error) {
      console.error("Failed to fetch featured badges:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card className="p-6 rounded-2xl">
        <div className="flex items-center gap-2 mb-4">
          <Award className="h-5 w-5" />
          <h3 className="font-semibold">Featured Badges</h3>
        </div>
        <div className="text-center py-4 text-muted-foreground text-sm">
          Loading...
        </div>
      </Card>
    );
  }

  if (featuredBadges.length === 0) {
    return null;
  }

  return (
    <Card className="p-6 rounded-2xl">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Award className="h-5 w-5" />
          <h3 className="font-semibold">Featured Badges</h3>
        </div>
        <Link
          href="/badges"
          className="text-sm text-primary hover:underline"
        >
          View All
        </Link>
      </div>

      <div className="grid grid-cols-3 md:grid-cols-5 gap-3">
        {featuredBadges.map((badge) => (
          <div
            key={badge.key}
            className="group relative"
            title={`${badge.name} - ${badge.description}`}
          >
            <Card className="p-3 rounded-2xl text-center hover:scale-110 transition-transform cursor-pointer bg-gradient-to-br from-background to-muted/20">
              <div className="text-3xl mb-1">{badge.icon}</div>
              <div className="text-xs font-medium truncate">{badge.name}</div>
              <Badge
                variant="outline"
                className={`rounded-full text-xs mt-1 ${
                  RARITY_COLORS[badge.rarity]
                }`}
              >
                {badge.rarity}
              </Badge>
            </Card>

            {/* Tooltip on hover */}
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block z-10">
              <Card className="p-2 rounded-xl text-xs whitespace-nowrap shadow-lg">
                <div className="font-semibold">{badge.name}</div>
                <div className="text-muted-foreground">{badge.description}</div>
              </Card>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
