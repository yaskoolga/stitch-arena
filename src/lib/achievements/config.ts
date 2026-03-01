// Achievement configuration
// Defines all possible achievements and their unlock criteria

export type AchievementCategory =
  | "milestone" // Stitch count milestones
  | "speed" // Speed badges (already implemented, kept for compatibility)
  | "collection" // Project completion achievements
  | "social" // Social interaction achievements
  | "streak" // Consecutive days streak
  | "challenge"; // Challenge participation/winning

export interface AchievementDefinition {
  id: string; // Unique identifier (e.g., "milestone_1k", "collection_5")
  category: AchievementCategory;
  level: number; // Progressive level (1, 2, 3, etc.)
  threshold: number; // Required value to unlock
  title: string;
  description: string;
  icon: string; // Emoji
  badgeKey?: string; // Optional associated badge
}

// Milestone achievements (total stitches)
export const MILESTONE_ACHIEVEMENTS: AchievementDefinition[] = [
  { id: "milestone_100", category: "milestone", level: 1, threshold: 100, title: "First Steps", description: "Stitch your first 100 stitches", icon: "🌱" },
  { id: "milestone_500", category: "milestone", level: 2, threshold: 500, title: "Getting Started", description: "Reach 500 total stitches", icon: "🌿" },
  { id: "milestone_1k", category: "milestone", level: 3, threshold: 1000, title: "Thousand Club", description: "Reach 1,000 total stitches", icon: "✨" },
  { id: "milestone_5k", category: "milestone", level: 4, threshold: 5000, title: "Dedicated Stitcher", description: "Reach 5,000 total stitches", icon: "🎯" },
  { id: "milestone_10k", category: "milestone", level: 5, threshold: 10000, title: "Ten Thousand", description: "Reach 10,000 total stitches", icon: "⭐" },
  { id: "milestone_25k", category: "milestone", level: 6, threshold: 25000, title: "Quarter Century", description: "Reach 25,000 total stitches", icon: "🏆" },
  { id: "milestone_50k", category: "milestone", level: 7, threshold: 50000, title: "Half Century", description: "Reach 50,000 total stitches", icon: "💎" },
  { id: "milestone_100k", category: "milestone", level: 8, threshold: 100000, title: "Legendary", description: "Reach 100,000 total stitches", icon: "👑" },
  { id: "milestone_250k", category: "milestone", level: 9, threshold: 250000, title: "Master Artisan", description: "Reach 250,000 total stitches", icon: "🌟" },
  { id: "milestone_500k", category: "milestone", level: 10, threshold: 500000, title: "Elite Stitcher", description: "Reach 500,000 total stitches", icon: "💫" },
  { id: "milestone_1m", category: "milestone", level: 11, threshold: 1000000, title: "Million Maker", description: "Reach 1,000,000 total stitches", icon: "🚀" },
];

// Collection achievements (completed projects)
export const COLLECTION_ACHIEVEMENTS: AchievementDefinition[] = [
  { id: "collection_1", category: "collection", level: 1, threshold: 1, title: "First Timer", description: "Complete your first project", icon: "🎯", badgeKey: "first_project" },
  { id: "collection_3", category: "collection", level: 2, threshold: 3, title: "Tri-Achiever", description: "Complete 3 projects", icon: "🎨" },
  { id: "collection_5", category: "collection", level: 3, threshold: 5, title: "Serial Creator", description: "Complete 5 projects", icon: "🖼️" },
  { id: "collection_10", category: "collection", level: 4, threshold: 10, title: "Prolific", description: "Complete 10 projects", icon: "🎪" },
  { id: "collection_25", category: "collection", level: 5, threshold: 25, title: "Master Crafter", description: "Complete 25 projects", icon: "👑" },
  { id: "collection_50", category: "collection", level: 6, threshold: 50, title: "Craftsman", description: "Complete 50 projects", icon: "⚡" },
  { id: "collection_100", category: "collection", level: 7, threshold: 100, title: "Legend", description: "Complete 100 projects", icon: "⭐" },
];

// Social achievements
export const SOCIAL_ACHIEVEMENTS: AchievementDefinition[] = [
  { id: "social_comments_10", category: "social", level: 1, threshold: 10, title: "Socialite", description: "Receive 10 comments", icon: "💬" },
  { id: "social_comments_50", category: "social", level: 2, threshold: 50, title: "Conversationalist", description: "Receive 50 comments", icon: "🗨️" },
  { id: "social_comments_100", category: "social", level: 3, threshold: 100, title: "Community Favorite", description: "Receive 100 comments", icon: "💭" },
  { id: "social_likes_10", category: "social", level: 1, threshold: 10, title: "Appreciated", description: "Receive 10 likes", icon: "❤️" },
  { id: "social_likes_50", category: "social", level: 2, threshold: 50, title: "Popular", description: "Receive 50 likes", icon: "💖" },
  { id: "social_likes_100", category: "social", level: 3, threshold: 100, title: "Crowd Pleaser", description: "Receive 100 likes", icon: "💝" },
  { id: "social_likes_250", category: "social", level: 4, threshold: 250, title: "Beloved", description: "Receive 250 likes", icon: "💗" },
  { id: "social_followers_10", category: "social", level: 1, threshold: 10, title: "Rising Star", description: "Get 10 followers", icon: "🌟" },
  { id: "social_followers_50", category: "social", level: 2, threshold: 50, title: "Influencer", description: "Get 50 followers", icon: "✨" },
  { id: "social_followers_100", category: "social", level: 3, threshold: 100, title: "Celebrity", description: "Get 100 followers", icon: "⭐" },
  { id: "social_helper_25", category: "social", level: 1, threshold: 25, title: "Helpful", description: "Leave 25 comments", icon: "🤝" },
  { id: "social_helper_100", category: "social", level: 2, threshold: 100, title: "Mentor", description: "Leave 100 comments", icon: "🎓" },
];

// Streak achievements
export const STREAK_ACHIEVEMENTS: AchievementDefinition[] = [
  { id: "streak_3", category: "streak", level: 1, threshold: 3, title: "Getting into Habit", description: "Log activity for 3 days in a row", icon: "🔥" },
  { id: "streak_7", category: "streak", level: 2, threshold: 7, title: "On Fire", description: "Log activity for 7 days in a row", icon: "🔥🔥" },
  { id: "streak_14", category: "streak", level: 3, threshold: 14, title: "Two Weeks Strong", description: "Log activity for 14 days in a row", icon: "💪" },
  { id: "streak_30", category: "streak", level: 4, threshold: 30, title: "Dedicated", description: "Log activity for 30 days in a row", icon: "🎯" },
  { id: "streak_60", category: "streak", level: 5, threshold: 60, title: "Committed", description: "Log activity for 60 days in a row", icon: "⚡" },
  { id: "streak_100", category: "streak", level: 6, threshold: 100, title: "Unstoppable", description: "Log activity for 100 days in a row", icon: "👑" },
  { id: "streak_365", category: "streak", level: 7, threshold: 365, title: "Year Round", description: "Log activity for 365 days in a row", icon: "🌟" },
];

// Challenge achievements
export const CHALLENGE_ACHIEVEMENTS: AchievementDefinition[] = [
  { id: "challenge_join_1", category: "challenge", level: 1, threshold: 1, title: "Challenger", description: "Join your first challenge", icon: "⚔️" },
  { id: "challenge_join_5", category: "challenge", level: 2, threshold: 5, title: "Competitor", description: "Join 5 challenges", icon: "🏃" },
  { id: "challenge_join_10", category: "challenge", level: 3, threshold: 10, title: "Veteran", description: "Join 10 challenges", icon: "🎖️" },
  { id: "challenge_top10_1", category: "challenge", level: 1, threshold: 1, title: "Top Performer", description: "Finish in top 10 of a challenge", icon: "🥉" },
  { id: "challenge_top10_5", category: "challenge", level: 2, threshold: 5, title: "Consistent Performer", description: "Finish in top 10 of 5 challenges", icon: "🥈" },
  { id: "challenge_win_1", category: "challenge", level: 1, threshold: 1, title: "Champion", description: "Win a challenge", icon: "🥇", badgeKey: "challenge_winner" },
  { id: "challenge_win_3", category: "challenge", level: 2, threshold: 3, title: "Triple Champion", description: "Win 3 challenges", icon: "👑" },
  { id: "challenge_win_10", category: "challenge", level: 3, threshold: 10, title: "Dominator", description: "Win 10 challenges", icon: "⭐" },
];

// All achievements combined
export const ALL_ACHIEVEMENTS: AchievementDefinition[] = [
  ...MILESTONE_ACHIEVEMENTS,
  ...COLLECTION_ACHIEVEMENTS,
  ...SOCIAL_ACHIEVEMENTS,
  ...STREAK_ACHIEVEMENTS,
  ...CHALLENGE_ACHIEVEMENTS,
];

// Helper to get achievement by ID
export function getAchievementById(id: string): AchievementDefinition | undefined {
  return ALL_ACHIEVEMENTS.find((a) => a.id === id);
}

// Helper to get achievements by category
export function getAchievementsByCategory(category: AchievementCategory): AchievementDefinition[] {
  return ALL_ACHIEVEMENTS.filter((a) => a.category === category);
}

// Helper to get next achievement in a category
export function getNextAchievement(
  category: AchievementCategory,
  currentLevel: number
): AchievementDefinition | undefined {
  const categoryAchievements = getAchievementsByCategory(category);
  return categoryAchievements.find((a) => a.level === currentLevel + 1);
}
