/**
 * Achievement checking and unlocking logic
 */

import { prisma } from "./prisma";
import { ACHIEVEMENTS } from "./constants";

export interface AchievementCheck {
  achievementId: string;
  isUnlocked: boolean;
  progress: number;
  requirement: number;
}

/**
 * Check which achievements a user has unlocked
 */
export async function checkAchievements(userId: string): Promise<AchievementCheck[]> {
  // Get user's projects and logs
  const projects = await prisma.project.findMany({
    where: { userId },
    include: {
      logs: true,
    },
  });

  const allLogs = projects.flatMap(p => p.logs);
  const totalStitches = allLogs.reduce((sum, log) => sum + log.dailyStitches, 0);
  const completedProjects = projects.filter(p => p.status === "completed").length;
  const publicProjects = projects.filter(p => p.isPublic).length;

  // Calculate streaks
  const { calculateStreak } = await import("./stats");
  const { currentStreak, bestStreak } = calculateStreak(allLogs);

  // Calculate average speed for speed achievements
  const { calculate6MonthAverage } = await import("./stats");
  const avgSpeed = calculate6MonthAverage(allLogs);

  // Get already unlocked achievements
  const unlocked = await prisma.userAchievement.findMany({
    where: { userId },
    select: { achievementId: true },
  });
  const unlockedIds = new Set(unlocked.map(a => a.achievementId));

  // Check each achievement
  const checks: AchievementCheck[] = [];

  // Projects
  checks.push({
    achievementId: ACHIEVEMENTS.FIRST_PROJECT.id,
    isUnlocked: unlockedIds.has(ACHIEVEMENTS.FIRST_PROJECT.id) || projects.length >= 1,
    progress: projects.length,
    requirement: ACHIEVEMENTS.FIRST_PROJECT.requirement,
  });

  checks.push({
    achievementId: ACHIEVEMENTS.FIVE_PROJECTS.id,
    isUnlocked: unlockedIds.has(ACHIEVEMENTS.FIVE_PROJECTS.id) || projects.length >= 5,
    progress: projects.length,
    requirement: ACHIEVEMENTS.FIVE_PROJECTS.requirement,
  });

  checks.push({
    achievementId: ACHIEVEMENTS.TEN_PROJECTS.id,
    isUnlocked: unlockedIds.has(ACHIEVEMENTS.TEN_PROJECTS.id) || projects.length >= 10,
    progress: projects.length,
    requirement: ACHIEVEMENTS.TEN_PROJECTS.requirement,
  });

  checks.push({
    achievementId: ACHIEVEMENTS.FIRST_COMPLETED.id,
    isUnlocked: unlockedIds.has(ACHIEVEMENTS.FIRST_COMPLETED.id) || completedProjects >= 1,
    progress: completedProjects,
    requirement: ACHIEVEMENTS.FIRST_COMPLETED.requirement,
  });

  // Stitches
  checks.push({
    achievementId: ACHIEVEMENTS.TEN_K_STITCHES.id,
    isUnlocked: unlockedIds.has(ACHIEVEMENTS.TEN_K_STITCHES.id) || totalStitches >= 10000,
    progress: totalStitches,
    requirement: ACHIEVEMENTS.TEN_K_STITCHES.requirement,
  });

  checks.push({
    achievementId: ACHIEVEMENTS.FIFTY_K_STITCHES.id,
    isUnlocked: unlockedIds.has(ACHIEVEMENTS.FIFTY_K_STITCHES.id) || totalStitches >= 50000,
    progress: totalStitches,
    requirement: ACHIEVEMENTS.FIFTY_K_STITCHES.requirement,
  });

  checks.push({
    achievementId: ACHIEVEMENTS.HUNDRED_K_STITCHES.id,
    isUnlocked: unlockedIds.has(ACHIEVEMENTS.HUNDRED_K_STITCHES.id) || totalStitches >= 100000,
    progress: totalStitches,
    requirement: ACHIEVEMENTS.HUNDRED_K_STITCHES.requirement,
  });

  checks.push({
    achievementId: ACHIEVEMENTS.MILLION_STITCHES.id,
    isUnlocked: unlockedIds.has(ACHIEVEMENTS.MILLION_STITCHES.id) || totalStitches >= 1000000,
    progress: totalStitches,
    requirement: ACHIEVEMENTS.MILLION_STITCHES.requirement,
  });

  // Streaks
  checks.push({
    achievementId: ACHIEVEMENTS.WEEK_STREAK.id,
    isUnlocked: unlockedIds.has(ACHIEVEMENTS.WEEK_STREAK.id) || bestStreak >= 7,
    progress: bestStreak,
    requirement: ACHIEVEMENTS.WEEK_STREAK.requirement,
  });

  checks.push({
    achievementId: ACHIEVEMENTS.MONTH_STREAK.id,
    isUnlocked: unlockedIds.has(ACHIEVEMENTS.MONTH_STREAK.id) || bestStreak >= 30,
    progress: bestStreak,
    requirement: ACHIEVEMENTS.MONTH_STREAK.requirement,
  });

  checks.push({
    achievementId: ACHIEVEMENTS.HUNDRED_DAY_STREAK.id,
    isUnlocked: unlockedIds.has(ACHIEVEMENTS.HUNDRED_DAY_STREAK.id) || bestStreak >= 100,
    progress: bestStreak,
    requirement: ACHIEVEMENTS.HUNDRED_DAY_STREAK.requirement,
  });

  // Logs
  checks.push({
    achievementId: ACHIEVEMENTS.FIRST_LOG.id,
    isUnlocked: unlockedIds.has(ACHIEVEMENTS.FIRST_LOG.id) || allLogs.length >= 1,
    progress: allLogs.length,
    requirement: ACHIEVEMENTS.FIRST_LOG.requirement,
  });

  checks.push({
    achievementId: ACHIEVEMENTS.HUNDRED_LOGS.id,
    isUnlocked: unlockedIds.has(ACHIEVEMENTS.HUNDRED_LOGS.id) || allLogs.length >= 100,
    progress: allLogs.length,
    requirement: ACHIEVEMENTS.HUNDRED_LOGS.requirement,
  });

  // Speed
  checks.push({
    achievementId: ACHIEVEMENTS.SPEED_DEMON.id,
    isUnlocked: unlockedIds.has(ACHIEVEMENTS.SPEED_DEMON.id) || avgSpeed >= 300,
    progress: Math.round(avgSpeed),
    requirement: ACHIEVEMENTS.SPEED_DEMON.requirement,
  });

  // Social
  checks.push({
    achievementId: ACHIEVEMENTS.FIRST_PUBLIC.id,
    isUnlocked: unlockedIds.has(ACHIEVEMENTS.FIRST_PUBLIC.id) || publicProjects >= 1,
    progress: publicProjects,
    requirement: ACHIEVEMENTS.FIRST_PUBLIC.requirement,
  });

  return checks;
}

/**
 * Unlock achievements for a user (save new ones to database)
 * Returns array of newly unlocked achievement IDs
 */
export async function unlockAchievements(userId: string): Promise<string[]> {
  const checks = await checkAchievements(userId);
  const newlyUnlocked: string[] = [];

  for (const check of checks) {
    if (check.isUnlocked) {
      // Try to create achievement record (will fail silently if already exists due to unique constraint)
      try {
        await prisma.userAchievement.create({
          data: {
            userId,
            achievementId: check.achievementId,
            progress: check.progress,
          },
        });
        newlyUnlocked.push(check.achievementId);
      } catch (error) {
        // Achievement already exists, skip
      }
    }
  }

  return newlyUnlocked;
}

/**
 * Get user's unlocked achievements with full details
 */
export async function getUserAchievements(userId: string) {
  const unlocked = await prisma.userAchievement.findMany({
    where: { userId },
    orderBy: { unlockedAt: "desc" },
  });

  return unlocked.map(ua => {
    const achievement = Object.values(ACHIEVEMENTS).find(a => a.id === ua.achievementId);
    return {
      ...ua,
      ...achievement,
    };
  });
}
