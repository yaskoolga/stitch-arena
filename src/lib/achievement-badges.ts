/**
 * Special achievement badges configuration
 * These are highlighted badges shown in user profiles
 */

export interface AchievementBadge {
  id: string;
  name: string;
  description: string;
  icon: string; // Emoji or icon name
  color: string; // Tailwind color class
  tier: "bronze" | "silver" | "gold" | "platinum" | "legendary";
}

export const ACHIEVEMENT_BADGES: Record<string, AchievementBadge> = {
  // Legendary tier
  "1m_stitches": {
    id: "1m_stitches",
    name: "Legendary",
    description: "Stitch 1,000,000 stitches total",
    icon: "👑",
    color: "from-purple-500 to-pink-500",
    tier: "legendary",
  },
  "100_day_streak": {
    id: "100_day_streak",
    name: "Unstoppable",
    description: "100 day streak",
    icon: "🔥",
    color: "from-orange-500 to-red-500",
    tier: "legendary",
  },

  // Gold tier
  "100k_stitches": {
    id: "100k_stitches",
    name: "Century Club",
    description: "Stitch 100,000 stitches total",
    icon: "💯",
    color: "from-yellow-400 to-yellow-600",
    tier: "gold",
  },
  "speed_demon": {
    id: "speed_demon",
    name: "Speed Demon",
    description: "Reach 300+ stitches/day average (Rocket tier)",
    icon: "🚀",
    color: "from-blue-400 to-blue-600",
    tier: "gold",
  },
  "month_streak": {
    id: "month_streak",
    name: "Dedicated",
    description: "30 day streak",
    icon: "⭐",
    color: "from-yellow-400 to-orange-500",
    tier: "gold",
  },

  // Silver tier
  "50k_stitches": {
    id: "50k_stitches",
    name: "Needle Master",
    description: "Stitch 50,000 stitches total",
    icon: "🎯",
    color: "from-gray-300 to-gray-500",
    tier: "silver",
  },
  "ten_projects": {
    id: "ten_projects",
    name: "Dedicated Stitcher",
    description: "Create 10 projects",
    icon: "📚",
    color: "from-gray-300 to-gray-500",
    tier: "silver",
  },
  "100_logs": {
    id: "100_logs",
    name: "Consistent Logger",
    description: "Add 100 daily logs",
    icon: "📊",
    color: "from-gray-300 to-gray-500",
    tier: "silver",
  },

  // Bronze tier
  "10k_stitches": {
    id: "10k_stitches",
    name: "Getting Warmed Up",
    description: "Stitch 10,000 stitches total",
    icon: "🌟",
    color: "from-orange-300 to-orange-500",
    tier: "bronze",
  },
  "week_streak": {
    id: "week_streak",
    name: "Committed",
    description: "7 day streak",
    icon: "💪",
    color: "from-orange-300 to-orange-500",
    tier: "bronze",
  },
  "first_completed": {
    id: "first_completed",
    name: "Finisher",
    description: "Complete your first project",
    icon: "🎉",
    color: "from-orange-300 to-orange-500",
    tier: "bronze",
  },
  "first_public": {
    id: "first_public",
    name: "Going Public",
    description: "Make your first project public",
    icon: "🌍",
    color: "from-orange-300 to-orange-500",
    tier: "bronze",
  },
};

/**
 * Get badge by achievement ID
 */
export function getBadge(achievementId: string): AchievementBadge | null {
  return ACHIEVEMENT_BADGES[achievementId] || null;
}

/**
 * Get user's special badges (sorted by tier)
 */
export function getUserBadges(achievementIds: string[]): AchievementBadge[] {
  const tierOrder = { legendary: 0, platinum: 1, gold: 2, silver: 3, bronze: 4 };

  return achievementIds
    .map((id) => getBadge(id))
    .filter((badge): badge is AchievementBadge => badge !== null)
    .sort((a, b) => tierOrder[a.tier] - tierOrder[b.tier]);
}

/**
 * Get top N badges for display
 */
export function getTopBadges(
  achievementIds: string[],
  limit: number = 5
): AchievementBadge[] {
  return getUserBadges(achievementIds).slice(0, limit);
}
