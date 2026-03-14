/**
 * Application-wide constants
 */

/**
 * Achievement rarity levels
 */
export type AchievementRarity = 'bronze' | 'silver' | 'gold' | 'platinum';

export const RARITY_CONFIG = {
  bronze: {
    name: 'Bronze',
    emoji: '🥉',
    color: 'text-amber-700 dark:text-amber-600',
    bgColor: 'bg-amber-50 dark:bg-amber-950/20',
  },
  silver: {
    name: 'Silver',
    emoji: '🥈',
    color: 'text-gray-600 dark:text-gray-400',
    bgColor: 'bg-gray-50 dark:bg-gray-950/20',
  },
  gold: {
    name: 'Gold',
    emoji: '🥇',
    color: 'text-yellow-600 dark:text-yellow-500',
    bgColor: 'bg-yellow-50 dark:bg-yellow-950/20',
  },
  platinum: {
    name: 'Platinum',
    emoji: '💎',
    color: 'text-cyan-600 dark:text-cyan-400',
    bgColor: 'bg-cyan-50 dark:bg-cyan-950/20',
  },
} as const;

/**
 * Available project themes/categories
 */
export const PROJECT_THEMES = [
  'Nature',
  'Animals',
  'Abstract',
  'Seasonal',
  'Fantasy',
  'Portrait',
  'Geometric',
  'Holiday',
  'Floral',
  'Modern',
  'Traditional',
  'Other',
] as const;

export type ProjectTheme = typeof PROJECT_THEMES[number];

/**
 * Speed achievement tiers based on average stitches per day
 */
export const SPEED_TIERS = {
  TURTLE: {
    emoji: '🐢',
    name: 'Turtle',
    description: 'Slow and steady',
    minStitches: 0,
    maxStitches: 30,
  },
  WALKER: {
    emoji: '🚶',
    name: 'Walker',
    description: 'Nice pace',
    minStitches: 31,
    maxStitches: 100,
  },
  BIKE: {
    emoji: '🚴',
    name: 'Bike',
    description: 'Moving along nicely',
    minStitches: 101,
    maxStitches: 200,
  },
  CAR: {
    emoji: '🚗',
    name: 'Car',
    description: 'Cruising fast',
    minStitches: 201,
    maxStitches: 350,
  },
  PLANE: {
    emoji: '✈️',
    name: 'Plane',
    description: 'Flying through',
    minStitches: 351,
    maxStitches: 500,
  },
  ROCKET: {
    emoji: '🚀',
    name: 'Rocket',
    description: 'Lightning speed',
    minStitches: 501,
    maxStitches: Infinity,
  },
} as const;

export type SpeedTier = keyof typeof SPEED_TIERS;

/**
 * Get speed tier based on average stitches per day
 */
export function getSpeedTier(avgStitchesPerDay: number): SpeedTier {
  if (avgStitchesPerDay >= SPEED_TIERS.ROCKET.minStitches) return 'ROCKET';
  if (avgStitchesPerDay >= SPEED_TIERS.PLANE.minStitches) return 'PLANE';
  if (avgStitchesPerDay >= SPEED_TIERS.CAR.minStitches) return 'CAR';
  if (avgStitchesPerDay >= SPEED_TIERS.BIKE.minStitches) return 'BIKE';
  if (avgStitchesPerDay >= SPEED_TIERS.WALKER.minStitches) return 'WALKER';
  return 'TURTLE';
}

/**
 * Maximum number of themes allowed per project
 */
export const MAX_THEMES_PER_PROJECT = 5;

/**
 * Cache duration for overall stats (in seconds)
 */
export const STATS_CACHE_DURATION = 300; // 5 minutes

/**
 * Number of months to look back for speed calculation
 */
export const SPEED_CALCULATION_MONTHS = 6;

/**
 * Number of months to display in activity heatmap
 */
export const HEATMAP_MONTHS = 12;

/**
 * Achievement definitions
 */
export const ACHIEVEMENTS = {
  // Projects
  FIRST_PROJECT: {
    id: 'first_project',
    name: 'First Steps',
    description: 'Create your first project',
    emoji: '🎯',
    category: 'projects',
    requirement: 1,
    rarity: 'bronze' as AchievementRarity,
  },
  FIVE_PROJECTS: {
    id: 'five_projects',
    name: 'Getting Started',
    description: 'Create 5 projects',
    emoji: '📚',
    category: 'projects',
    requirement: 5,
    rarity: 'silver' as AchievementRarity,
  },
  TEN_PROJECTS: {
    id: 'ten_projects',
    name: 'Dedicated Stitcher',
    description: 'Create 10 projects',
    emoji: '🏆',
    category: 'projects',
    requirement: 10,
    rarity: 'gold' as AchievementRarity,
  },
  FIRST_COMPLETED: {
    id: 'first_completed',
    name: 'Finisher',
    description: 'Complete your first project',
    emoji: '✅',
    category: 'projects',
    requirement: 1,
    rarity: 'bronze' as AchievementRarity,
  },

  // Stitches
  TEN_K_STITCHES: {
    id: '10k_stitches',
    name: 'Getting Warmed Up',
    description: 'Stitch 10,000 stitches total',
    emoji: '🧵',
    category: 'stitches',
    requirement: 10000,
    rarity: 'bronze' as AchievementRarity,
  },
  FIFTY_K_STITCHES: {
    id: '50k_stitches',
    name: 'Needle Master',
    description: 'Stitch 50,000 stitches total',
    emoji: '🪡',
    category: 'stitches',
    requirement: 50000,
    rarity: 'silver' as AchievementRarity,
  },
  HUNDRED_K_STITCHES: {
    id: '100k_stitches',
    name: 'Century Club',
    description: 'Stitch 100,000 stitches total',
    emoji: '💯',
    category: 'stitches',
    requirement: 100000,
    rarity: 'gold' as AchievementRarity,
  },
  MILLION_STITCHES: {
    id: '1m_stitches',
    name: 'Legendary',
    description: 'Stitch 1,000,000 stitches total',
    emoji: '👑',
    category: 'stitches',
    requirement: 1000000,
    rarity: 'platinum' as AchievementRarity,
  },

  // Streaks
  WEEK_STREAK: {
    id: 'week_streak',
    name: 'Committed',
    description: '7 day streak',
    emoji: '🔥',
    category: 'streaks',
    requirement: 7,
    rarity: 'bronze' as AchievementRarity,
  },
  MONTH_STREAK: {
    id: 'month_streak',
    name: 'Dedicated',
    description: '30 day streak',
    emoji: '⚡',
    category: 'streaks',
    requirement: 30,
    rarity: 'silver' as AchievementRarity,
  },
  HUNDRED_DAY_STREAK: {
    id: '100_day_streak',
    name: 'Unstoppable',
    description: '100 day streak',
    emoji: '🌟',
    category: 'streaks',
    requirement: 100,
    rarity: 'platinum' as AchievementRarity,
  },

  // Daily logs
  FIRST_LOG: {
    id: 'first_log',
    name: 'First Entry',
    description: 'Add your first daily log',
    emoji: '📝',
    category: 'logs',
    requirement: 1,
    rarity: 'bronze' as AchievementRarity,
  },
  HUNDRED_LOGS: {
    id: '100_logs',
    name: 'Consistent Logger',
    description: 'Add 100 daily logs',
    emoji: '📖',
    category: 'logs',
    requirement: 100,
    rarity: 'silver' as AchievementRarity,
  },

  // Speed
  SPEED_DEMON: {
    id: 'speed_demon',
    name: 'Speed Demon',
    description: 'Reach 300+ stitches/day average (Rocket tier)',
    emoji: '🚀',
    category: 'speed',
    requirement: 300,
    rarity: 'platinum' as AchievementRarity,
  },

  // Social
  FIRST_PUBLIC: {
    id: 'first_public',
    name: 'Going Public',
    description: 'Make your first project public',
    emoji: '🌍',
    category: 'social',
    requirement: 1,
    rarity: 'bronze' as AchievementRarity,
  },

  // Challenges
  FIRST_CHALLENGE: {
    id: 'first_challenge',
    name: 'Challenge Accepted',
    description: 'Join your first challenge',
    emoji: '🎮',
    category: 'challenges',
    requirement: 1,
    rarity: 'bronze' as AchievementRarity,
  },
  CHALLENGE_PODIUM: {
    id: 'challenge_podium',
    name: 'Podium Finish',
    description: 'Finish in top 3 of a challenge',
    emoji: '🥉',
    category: 'challenges',
    requirement: 1,
    rarity: 'gold' as AchievementRarity,
  },
  CHALLENGE_WINNER: {
    id: 'challenge_winner',
    name: 'Champion',
    description: 'Win a challenge (1st place)',
    emoji: '🏆',
    category: 'challenges',
    requirement: 1,
    rarity: 'platinum' as AchievementRarity,
  },
} as const;

  // Stash (Запасы / Хомячья норка)
  FIRST_STASH: {
    id: 'first_stash',
    name: 'First Stash',
    description: 'Add your first project to stash',
    emoji: '🎁',
    category: 'stash',
    requirement: 1,
    rarity: 'bronze' as AchievementRarity,
  },
  COLLECTOR_BEGINNER: {
    id: 'collector_beginner',
    name: 'Beginner Collector',
    description: 'Have 3 projects in stash',
    emoji: '📦',
    category: 'stash',
    requirement: 3,
    rarity: 'bronze' as AchievementRarity,
  },
  HAMSTER_PREPARED: {
    id: 'hamster_prepared',
    name: 'Prepared Hamster',
    description: 'Have 5 projects in stash',
    emoji: '🏠',
    category: 'stash',
    requirement: 5,
    rarity: 'silver' as AchievementRarity,
  },
  SERIOUS_COLLECTOR: {
    id: 'serious_collector',
    name: 'Serious Collector',
    description: 'Have 10 projects in stash',
    emoji: '📚',
    category: 'stash',
    requirement: 10,
    rarity: 'silver' as AchievementRarity,
  },
  HAMSTER_MILLIONAIRE: {
    id: 'hamster_millionaire',
    name: 'Hamster Millionaire',
    description: 'Have 20 projects in stash',
    emoji: '💎',
    category: 'stash',
    requirement: 20,
    rarity: 'gold' as AchievementRarity,
  },
  DRAGON_HOARD: {
    id: 'dragon_hoard',
    name: 'Dragon\'s Hoard',
    description: 'Have 50+ projects in stash',
    emoji: '🐉',
    category: 'stash',
    requirement: 50,
    rarity: 'platinum' as AchievementRarity,
  },
  LETS_START: {
    id: 'lets_start',
    name: 'Let\'s Start!',
    description: 'Move first project from stash to in progress',
    emoji: '🚀',
    category: 'stash',
    requirement: 1,
    rarity: 'bronze' as AchievementRarity,
  },
  STASH_CONQUEROR: {
    id: 'stash_conqueror',
    name: 'Stash Conqueror',
    description: 'Complete a project that was in stash > 6 months',
    emoji: '🏆',
    category: 'stash',
    requirement: 1,
    rarity: 'gold' as AchievementRarity,
  },
  DESTASHER: {
    id: 'destasher',
    name: 'Destasher',
    description: 'Complete 5 projects that were in stash',
    emoji: '🎯',
    category: 'stash',
    requirement: 5,
    rarity: 'silver' as AchievementRarity,
  },
  PATIENCE_CHAMPION: {
    id: 'patience_champion',
    name: 'Patience Champion',
    description: 'Start a project that was in stash > 1 year',
    emoji: '🕰️',
    category: 'stash',
    requirement: 1,
    rarity: 'gold' as AchievementRarity,
  },
  SHOPPING_SPREE: {
    id: 'shopping_spree',
    name: 'Shopping Spree',
    description: 'Add 5+ projects to stash in one day',
    emoji: '🛍️',
    category: 'stash',
    requirement: 5,
    rarity: 'silver' as AchievementRarity,
  },
  ASCETIC: {
    id: 'ascetic',
    name: 'Ascetic',
    description: 'Empty stash completely (0 projects)',
    emoji: '🧘',
    category: 'stash',
    requirement: 1,
    rarity: 'platinum' as AchievementRarity,
  },
  STITCHER_SYNDROME: {
    id: 'stitcher_syndrome',
    name: 'Stitcher\'s Syndrome',
    description: 'Have more projects in stash than completed',
    emoji: '😅',
    category: 'stash',
    requirement: 1,
    rarity: 'bronze' as AchievementRarity,
  },
} as const;

export type AchievementId = typeof ACHIEVEMENTS[keyof typeof ACHIEVEMENTS]['id'];
export type AchievementCategory = 'projects' | 'stitches' | 'streaks' | 'logs' | 'speed' | 'social' | 'challenges' | 'stash';
