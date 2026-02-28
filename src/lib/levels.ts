/**
 * User Level System
 * Levels are based on total stitches completed while tracking
 */

export interface Level {
  level: number;
  name: string;
  emoji: string;
  minStitches: number;
  maxStitches: number;
}

export const LEVELS: Level[] = [
  {
    level: 1,
    name: "Beginner",
    emoji: "🌱",
    minStitches: 0,
    maxStitches: 1000,
  },
  {
    level: 2,
    name: "Hobbyist",
    emoji: "🎨",
    minStitches: 1001,
    maxStitches: 5000,
  },
  {
    level: 3,
    name: "Enthusiast",
    emoji: "⭐",
    minStitches: 5001,
    maxStitches: 20000,
  },
  {
    level: 4,
    name: "Expert",
    emoji: "💎",
    minStitches: 20001,
    maxStitches: 50000,
  },
  {
    level: 5,
    name: "Master",
    emoji: "👑",
    minStitches: 50001,
    maxStitches: 100000,
  },
  {
    level: 6,
    name: "Legend",
    emoji: "🏆",
    minStitches: 100001,
    maxStitches: Infinity,
  },
];

/**
 * Calculate user level based on total stitches
 */
export function getUserLevel(totalStitches: number): Level {
  for (let i = LEVELS.length - 1; i >= 0; i--) {
    if (totalStitches >= LEVELS[i].minStitches) {
      return LEVELS[i];
    }
  }
  return LEVELS[0]; // Default to level 1
}

/**
 * Get progress to next level (0-100)
 */
export function getLevelProgress(totalStitches: number): {
  current: Level;
  next: Level | null;
  progress: number; // 0-100
  stitchesUntilNext: number;
  stitchesInCurrentLevel: number;
} {
  const current = getUserLevel(totalStitches);
  const currentIndex = LEVELS.findIndex((l) => l.level === current.level);
  const next = currentIndex < LEVELS.length - 1 ? LEVELS[currentIndex + 1] : null;

  if (!next) {
    // Max level reached
    return {
      current,
      next: null,
      progress: 100,
      stitchesUntilNext: 0,
      stitchesInCurrentLevel: totalStitches - current.minStitches,
    };
  }

  const stitchesInCurrentLevel = totalStitches - current.minStitches;
  const levelRange = next.minStitches - current.minStitches;
  const progress = Math.min(100, Math.round((stitchesInCurrentLevel / levelRange) * 100));
  const stitchesUntilNext = next.minStitches - totalStitches;

  return {
    current,
    next,
    progress,
    stitchesUntilNext,
    stitchesInCurrentLevel,
  };
}

/**
 * Get level stars (visual representation)
 * Returns string like "⭐⭐⭐⭐⭐" for level 5
 */
export function getLevelStars(level: number): string {
  return "⭐".repeat(level);
}
