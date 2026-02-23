/**
 * Application-wide constants
 */

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
    maxStitches: 50,
  },
  BIKE: {
    emoji: '🚴',
    name: 'Bike',
    description: 'Moving along nicely',
    minStitches: 51,
    maxStitches: 150,
  },
  CAR: {
    emoji: '🚗',
    name: 'Car',
    description: 'Cruising fast',
    minStitches: 151,
    maxStitches: 300,
  },
  ROCKET: {
    emoji: '🚀',
    name: 'Rocket',
    description: 'Lightning speed',
    minStitches: 301,
    maxStitches: Infinity,
  },
} as const;

export type SpeedTier = keyof typeof SPEED_TIERS;

/**
 * Get speed tier based on average stitches per day
 */
export function getSpeedTier(avgStitchesPerDay: number): SpeedTier {
  if (avgStitchesPerDay >= SPEED_TIERS.ROCKET.minStitches) return 'ROCKET';
  if (avgStitchesPerDay >= SPEED_TIERS.CAR.minStitches) return 'CAR';
  if (avgStitchesPerDay >= SPEED_TIERS.BIKE.minStitches) return 'BIKE';
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
  },
  FIVE_PROJECTS: {
    id: 'five_projects',
    name: 'Getting Started',
    description: 'Create 5 projects',
    emoji: '📚',
    category: 'projects',
    requirement: 5,
  },
  TEN_PROJECTS: {
    id: 'ten_projects',
    name: 'Dedicated Stitcher',
    description: 'Create 10 projects',
    emoji: '🏆',
    category: 'projects',
    requirement: 10,
  },
  FIRST_COMPLETED: {
    id: 'first_completed',
    name: 'Finisher',
    description: 'Complete your first project',
    emoji: '✅',
    category: 'projects',
    requirement: 1,
  },

  // Stitches
  TEN_K_STITCHES: {
    id: '10k_stitches',
    name: 'Getting Warmed Up',
    description: 'Stitch 10,000 stitches total',
    emoji: '🧵',
    category: 'stitches',
    requirement: 10000,
  },
  FIFTY_K_STITCHES: {
    id: '50k_stitches',
    name: 'Needle Master',
    description: 'Stitch 50,000 stitches total',
    emoji: '🪡',
    category: 'stitches',
    requirement: 50000,
  },
  HUNDRED_K_STITCHES: {
    id: '100k_stitches',
    name: 'Century Club',
    description: 'Stitch 100,000 stitches total',
    emoji: '💯',
    category: 'stitches',
    requirement: 100000,
  },
  MILLION_STITCHES: {
    id: '1m_stitches',
    name: 'Legendary',
    description: 'Stitch 1,000,000 stitches total',
    emoji: '👑',
    category: 'stitches',
    requirement: 1000000,
  },

  // Streaks
  WEEK_STREAK: {
    id: 'week_streak',
    name: 'Committed',
    description: '7 day streak',
    emoji: '🔥',
    category: 'streaks',
    requirement: 7,
  },
  MONTH_STREAK: {
    id: 'month_streak',
    name: 'Dedicated',
    description: '30 day streak',
    emoji: '⚡',
    category: 'streaks',
    requirement: 30,
  },
  HUNDRED_DAY_STREAK: {
    id: '100_day_streak',
    name: 'Unstoppable',
    description: '100 day streak',
    emoji: '🌟',
    category: 'streaks',
    requirement: 100,
  },

  // Daily logs
  FIRST_LOG: {
    id: 'first_log',
    name: 'First Entry',
    description: 'Add your first daily log',
    emoji: '📝',
    category: 'logs',
    requirement: 1,
  },
  HUNDRED_LOGS: {
    id: '100_logs',
    name: 'Consistent Logger',
    description: 'Add 100 daily logs',
    emoji: '📖',
    category: 'logs',
    requirement: 100,
  },

  // Speed
  SPEED_DEMON: {
    id: 'speed_demon',
    name: 'Speed Demon',
    description: 'Reach 300+ stitches/day average (Rocket tier)',
    emoji: '🚀',
    category: 'speed',
    requirement: 300,
  },

  // Social
  FIRST_PUBLIC: {
    id: 'first_public',
    name: 'Going Public',
    description: 'Make your first project public',
    emoji: '🌍',
    category: 'social',
    requirement: 1,
  },

  // Challenges
  FIRST_CHALLENGE: {
    id: 'first_challenge',
    name: 'Challenge Accepted',
    description: 'Join your first challenge',
    emoji: '🎮',
    category: 'challenges',
    requirement: 1,
  },
  CHALLENGE_PODIUM: {
    id: 'challenge_podium',
    name: 'Podium Finish',
    description: 'Finish in top 3 of a challenge',
    emoji: '🥉',
    category: 'challenges',
    requirement: 1,
  },
  CHALLENGE_WINNER: {
    id: 'challenge_winner',
    name: 'Champion',
    description: 'Win a challenge (1st place)',
    emoji: '🏆',
    category: 'challenges',
    requirement: 1,
  },
} as const;

export type AchievementId = typeof ACHIEVEMENTS[keyof typeof ACHIEVEMENTS]['id'];
export type AchievementCategory = 'projects' | 'stitches' | 'streaks' | 'logs' | 'speed' | 'social' | 'challenges';
