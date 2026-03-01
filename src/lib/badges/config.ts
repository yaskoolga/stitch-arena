// Badge definitions
// Badges are awarded for special achievements, events, or milestones

export type BadgeRarity = "common" | "rare" | "epic" | "legendary";
export type BadgeCategory = "achievement" | "event" | "special" | "challenge";

export interface BadgeDefinition {
  key: string; // Unique identifier
  category: BadgeCategory;
  name: string;
  description: string;
  icon: string; // Emoji
  rarity: BadgeRarity;
  criteria?: string; // JSON string describing how to earn
}

// Achievement badges (awarded automatically with certain achievements)
export const ACHIEVEMENT_BADGES: BadgeDefinition[] = [
  {
    key: "first_project",
    category: "achievement",
    name: "First Steps",
    description: "Completed your first project",
    icon: "🎯",
    rarity: "common",
  },
  {
    key: "challenge_winner",
    category: "achievement",
    name: "Champion",
    description: "Won a challenge",
    icon: "🥇",
    rarity: "rare",
  },
  {
    key: "100k_stitches",
    category: "achievement",
    name: "Century Club",
    description: "Reached 100,000 stitches",
    icon: "💯",
    rarity: "epic",
  },
  {
    key: "1m_stitches",
    category: "achievement",
    name: "Million Maker",
    description: "Reached 1,000,000 stitches",
    icon: "🚀",
    rarity: "legendary",
  },
  {
    key: "year_streak",
    category: "achievement",
    name: "Year Round",
    description: "365 day streak",
    icon: "📅",
    rarity: "legendary",
  },
];

// Special badges (manually awarded or for special circumstances)
export const SPECIAL_BADGES: BadgeDefinition[] = [
  {
    key: "early_adopter",
    category: "special",
    name: "Early Adopter",
    description: "Joined StitchArena in its first month",
    icon: "🌟",
    rarity: "rare",
  },
  {
    key: "beta_tester",
    category: "special",
    name: "Beta Tester",
    description: "Helped test new features",
    icon: "🧪",
    rarity: "rare",
  },
  {
    key: "contributor",
    category: "special",
    name: "Contributor",
    description: "Contributed to the project",
    icon: "🛠️",
    rarity: "epic",
  },
  {
    key: "moderator",
    category: "special",
    name: "Moderator",
    description: "Community moderator",
    icon: "🛡️",
    rarity: "epic",
  },
  {
    key: "staff",
    category: "special",
    name: "Staff",
    description: "StitchArena team member",
    icon: "⭐",
    rarity: "legendary",
  },
];

// Event badges (awarded for participating in seasonal events)
export const EVENT_BADGES: BadgeDefinition[] = [
  {
    key: "halloween_2026",
    category: "event",
    name: "Halloween 2026",
    description: "Participated in Halloween 2026 event",
    icon: "🎃",
    rarity: "rare",
  },
  {
    key: "christmas_2026",
    category: "event",
    name: "Christmas 2026",
    description: "Participated in Christmas 2026 event",
    icon: "🎄",
    rarity: "rare",
  },
  {
    key: "new_year_2027",
    category: "event",
    name: "New Year 2027",
    description: "Participated in New Year 2027 event",
    icon: "🎆",
    rarity: "rare",
  },
];

// Challenge winner badges (specific to challenge types)
export const CHALLENGE_BADGES: BadgeDefinition[] = [
  {
    key: "speed_champion",
    category: "challenge",
    name: "Speed Champion",
    description: "Won a speed challenge",
    icon: "⚡",
    rarity: "rare",
  },
  {
    key: "streak_master",
    category: "challenge",
    name: "Streak Master",
    description: "Won a streak challenge",
    icon: "🔥",
    rarity: "rare",
  },
  {
    key: "completion_king",
    category: "challenge",
    name: "Completion King",
    description: "Won a completion challenge",
    icon: "👑",
    rarity: "rare",
  },
];

// All badges combined
export const ALL_BADGES: BadgeDefinition[] = [
  ...ACHIEVEMENT_BADGES,
  ...SPECIAL_BADGES,
  ...EVENT_BADGES,
  ...CHALLENGE_BADGES,
];

// Rarity colors for UI
export const RARITY_COLORS: Record<BadgeRarity, string> = {
  common: "text-gray-600 dark:text-gray-400",
  rare: "text-blue-600 dark:text-blue-400",
  epic: "text-purple-600 dark:text-purple-400",
  legendary: "text-yellow-600 dark:text-yellow-400",
};

// Rarity gradients for special effects
export const RARITY_GRADIENTS: Record<BadgeRarity, string> = {
  common: "from-gray-400 to-gray-600",
  rare: "from-blue-400 to-blue-600",
  epic: "from-purple-400 to-purple-600",
  legendary: "from-yellow-400 via-orange-500 to-red-600",
};

// Helper functions
export function getBadgeByKey(key: string): BadgeDefinition | undefined {
  return ALL_BADGES.find((b) => b.key === key);
}

export function getBadgesByCategory(category: BadgeCategory): BadgeDefinition[] {
  return ALL_BADGES.filter((b) => b.category === category);
}

export function getBadgesByRarity(rarity: BadgeRarity): BadgeDefinition[] {
  return ALL_BADGES.filter((b) => b.rarity === rarity);
}
