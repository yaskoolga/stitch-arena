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
  const stashProjects = projects.filter(p => p.status === "stash");
  const stashCount = stashProjects.length;

  // Count projects moved from stash to in_progress
  const movedFromStash = projects.filter(p =>
    p.status !== "stash" && p.startedAt !== null
  ).length;

  // Count completed projects that were in stash > 6 months
  const now = new Date();
  const completedFromOldStash = projects.filter(p => {
    if (p.status !== "completed" || !p.startedAt || !p.createdAt) return false;
    const monthsInStash = (p.startedAt.getTime() - p.createdAt.getTime()) / (1000 * 60 * 60 * 24 * 30);
    return monthsInStash >= 6;
  }).length;

  // Count completed projects that were ever in stash
  const completedFromStash = projects.filter(p =>
    p.status === "completed" && p.startedAt !== null
  ).length;

  // Check if started a project that was in stash > 1 year
  const startedOldProject = projects.some(p => {
    if (!p.startedAt || !p.createdAt) return false;
    const yearsInStash = (p.startedAt.getTime() - p.createdAt.getTime()) / (1000 * 60 * 60 * 24 * 365);
    return yearsInStash >= 1;
  });

  // Check if added 5+ projects to stash in one day
  const projectsByDay = new Map<string, number>();
  for (const project of projects) {
    const day = project.createdAt.toISOString().split('T')[0];
    projectsByDay.set(day, (projectsByDay.get(day) || 0) + 1);
  }
  const hasShoppingSpree = Array.from(projectsByDay.values()).some(count => count >= 5);

  // Check Stitcher's Syndrome (more in stash than completed)
  const hasStitcherSyndrome = stashCount > completedProjects && stashCount > 0;

  // Get user's challenge participations
  const challengeParticipations = await prisma.challengeParticipant.findMany({
    where: { userId },
    include: {
      challenge: true,
    },
  });

  // Get challenge leaderboard entries for finished challenges
  const finishedChallengeIds = challengeParticipations
    .filter(p => p.challenge.endDate < new Date())
    .map(p => p.challengeId);

  const leaderboardEntries = await prisma.challengeLeaderboard.findMany({
    where: {
      challengeId: { in: finishedChallengeIds },
      userId,
    },
  });

  const hasWonChallenge = leaderboardEntries.some(entry => entry.rank === 1);
  const hasPodiumFinish = leaderboardEntries.some(entry => entry.rank <= 3);

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

  // Challenges
  checks.push({
    achievementId: ACHIEVEMENTS.FIRST_CHALLENGE.id,
    isUnlocked: unlockedIds.has(ACHIEVEMENTS.FIRST_CHALLENGE.id) || challengeParticipations.length >= 1,
    progress: challengeParticipations.length,
    requirement: ACHIEVEMENTS.FIRST_CHALLENGE.requirement,
  });

  checks.push({
    achievementId: ACHIEVEMENTS.CHALLENGE_PODIUM.id,
    isUnlocked: unlockedIds.has(ACHIEVEMENTS.CHALLENGE_PODIUM.id) || hasPodiumFinish,
    progress: hasPodiumFinish ? 1 : 0,
    requirement: ACHIEVEMENTS.CHALLENGE_PODIUM.requirement,
  });

  checks.push({
    achievementId: ACHIEVEMENTS.CHALLENGE_WINNER.id,
    isUnlocked: unlockedIds.has(ACHIEVEMENTS.CHALLENGE_WINNER.id) || hasWonChallenge,
    progress: hasWonChallenge ? 1 : 0,
    requirement: ACHIEVEMENTS.CHALLENGE_WINNER.requirement,
  });

  // Stash achievements
  checks.push({
    achievementId: ACHIEVEMENTS.FIRST_STASH.id,
    isUnlocked: unlockedIds.has(ACHIEVEMENTS.FIRST_STASH.id) || stashCount >= 1,
    progress: stashCount,
    requirement: ACHIEVEMENTS.FIRST_STASH.requirement,
  });

  checks.push({
    achievementId: ACHIEVEMENTS.COLLECTOR_BEGINNER.id,
    isUnlocked: unlockedIds.has(ACHIEVEMENTS.COLLECTOR_BEGINNER.id) || stashCount >= 3,
    progress: stashCount,
    requirement: ACHIEVEMENTS.COLLECTOR_BEGINNER.requirement,
  });

  checks.push({
    achievementId: ACHIEVEMENTS.HAMSTER_PREPARED.id,
    isUnlocked: unlockedIds.has(ACHIEVEMENTS.HAMSTER_PREPARED.id) || stashCount >= 5,
    progress: stashCount,
    requirement: ACHIEVEMENTS.HAMSTER_PREPARED.requirement,
  });

  checks.push({
    achievementId: ACHIEVEMENTS.SERIOUS_COLLECTOR.id,
    isUnlocked: unlockedIds.has(ACHIEVEMENTS.SERIOUS_COLLECTOR.id) || stashCount >= 10,
    progress: stashCount,
    requirement: ACHIEVEMENTS.SERIOUS_COLLECTOR.requirement,
  });

  checks.push({
    achievementId: ACHIEVEMENTS.HAMSTER_MILLIONAIRE.id,
    isUnlocked: unlockedIds.has(ACHIEVEMENTS.HAMSTER_MILLIONAIRE.id) || stashCount >= 20,
    progress: stashCount,
    requirement: ACHIEVEMENTS.HAMSTER_MILLIONAIRE.requirement,
  });

  checks.push({
    achievementId: ACHIEVEMENTS.DRAGON_HOARD.id,
    isUnlocked: unlockedIds.has(ACHIEVEMENTS.DRAGON_HOARD.id) || stashCount >= 50,
    progress: stashCount,
    requirement: ACHIEVEMENTS.DRAGON_HOARD.requirement,
  });

  checks.push({
    achievementId: ACHIEVEMENTS.LETS_START.id,
    isUnlocked: unlockedIds.has(ACHIEVEMENTS.LETS_START.id) || movedFromStash >= 1,
    progress: movedFromStash,
    requirement: ACHIEVEMENTS.LETS_START.requirement,
  });

  checks.push({
    achievementId: ACHIEVEMENTS.STASH_CONQUEROR.id,
    isUnlocked: unlockedIds.has(ACHIEVEMENTS.STASH_CONQUEROR.id) || completedFromOldStash >= 1,
    progress: completedFromOldStash,
    requirement: ACHIEVEMENTS.STASH_CONQUEROR.requirement,
  });

  checks.push({
    achievementId: ACHIEVEMENTS.DESTASHER.id,
    isUnlocked: unlockedIds.has(ACHIEVEMENTS.DESTASHER.id) || completedFromStash >= 5,
    progress: completedFromStash,
    requirement: ACHIEVEMENTS.DESTASHER.requirement,
  });

  checks.push({
    achievementId: ACHIEVEMENTS.PATIENCE_CHAMPION.id,
    isUnlocked: unlockedIds.has(ACHIEVEMENTS.PATIENCE_CHAMPION.id) || startedOldProject,
    progress: startedOldProject ? 1 : 0,
    requirement: ACHIEVEMENTS.PATIENCE_CHAMPION.requirement,
  });

  checks.push({
    achievementId: ACHIEVEMENTS.SHOPPING_SPREE.id,
    isUnlocked: unlockedIds.has(ACHIEVEMENTS.SHOPPING_SPREE.id) || hasShoppingSpree,
    progress: hasShoppingSpree ? 5 : Math.max(...Array.from(projectsByDay.values()), 0),
    requirement: ACHIEVEMENTS.SHOPPING_SPREE.requirement,
  });

  checks.push({
    achievementId: ACHIEVEMENTS.ASCETIC.id,
    isUnlocked: unlockedIds.has(ACHIEVEMENTS.ASCETIC.id) || (stashCount === 0 && projects.length > 0),
    progress: stashCount === 0 && projects.length > 0 ? 1 : 0,
    requirement: ACHIEVEMENTS.ASCETIC.requirement,
  });

  checks.push({
    achievementId: ACHIEVEMENTS.STITCHER_SYNDROME.id,
    isUnlocked: unlockedIds.has(ACHIEVEMENTS.STITCHER_SYNDROME.id) || hasStitcherSyndrome,
    progress: hasStitcherSyndrome ? 1 : 0,
    requirement: ACHIEVEMENTS.STITCHER_SYNDROME.requirement,
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
