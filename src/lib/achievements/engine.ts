import { prisma } from "@/lib/prisma";
import {
  ALL_ACHIEVEMENTS,
  AchievementDefinition,
  getAchievementsByCategory,
} from "./config";

/**
 * Check and award achievements for a user
 * Call this after significant events (daily log, project completion, etc.)
 */
export async function checkAndAwardAchievements(userId: string): Promise<string[]> {
  const newlyUnlocked: string[] = [];

  // Get user stats
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      totalStitches: true,
      projectsCount: true,
      currentStreak: true,
      _count: {
        select: {
          likes: true,
          comments: true,
          followers: true,
          challengeParticipants: true,
        },
      },
    },
  });

  if (!user) return [];

  // Get completed projects count
  const completedProjects = await prisma.project.count({
    where: { userId, status: "completed" },
  });

  // Get comments received on user's projects
  const commentsReceived = await prisma.comment.count({
    where: {
      project: { userId },
    },
  });

  // Get comments made by user
  const commentsMade = user._count.comments;

  // Get challenge stats
  const challengeStats = await getChallengeStats(userId);

  // Get existing achievements
  const existingAchievements = await prisma.userAchievement.findMany({
    where: { userId },
    select: { achievementId: true },
  });
  const existingIds = new Set(existingAchievements.map((a) => a.achievementId));

  // Check each achievement
  for (const achievement of ALL_ACHIEVEMENTS) {
    // Skip if already unlocked
    if (existingIds.has(achievement.id)) continue;

    let shouldUnlock = false;

    switch (achievement.category) {
      case "milestone":
        shouldUnlock = user.totalStitches >= achievement.threshold;
        break;

      case "collection":
        shouldUnlock = completedProjects >= achievement.threshold;
        break;

      case "social":
        if (achievement.id.includes("comments")) {
          shouldUnlock = commentsReceived >= achievement.threshold;
        } else if (achievement.id.includes("likes")) {
          shouldUnlock = user._count.likes >= achievement.threshold;
        } else if (achievement.id.includes("followers")) {
          shouldUnlock = user._count.followers >= achievement.threshold;
        } else if (achievement.id.includes("helper")) {
          shouldUnlock = commentsMade >= achievement.threshold;
        }
        break;

      case "streak":
        shouldUnlock = user.currentStreak >= achievement.threshold;
        break;

      case "challenge":
        if (achievement.id.includes("join")) {
          shouldUnlock = challengeStats.joined >= achievement.threshold;
        } else if (achievement.id.includes("top10")) {
          shouldUnlock = challengeStats.top10 >= achievement.threshold;
        } else if (achievement.id.includes("win")) {
          shouldUnlock = challengeStats.wins >= achievement.threshold;
        }
        break;
    }

    if (shouldUnlock) {
      await unlockAchievement(userId, achievement);
      newlyUnlocked.push(achievement.id);

      // Award associated badge if exists
      if (achievement.badgeKey) {
        await awardBadge(userId, achievement.badgeKey);
      }
    }
  }

  return newlyUnlocked;
}

/**
 * Unlock a specific achievement for a user
 */
async function unlockAchievement(
  userId: string,
  achievement: AchievementDefinition
): Promise<void> {
  await prisma.userAchievement.create({
    data: {
      userId,
      achievementId: achievement.id,
      progress: achievement.threshold,
    },
  });

  // Create notification
  await prisma.notification.create({
    data: {
      userId,
      type: "achievement",
      content: `You unlocked "${achievement.title}"!`,
      resourceId: achievement.id,
    },
  });
}

/**
 * Award a badge to a user
 */
async function awardBadge(userId: string, badgeKey: string): Promise<void> {
  // Check if badge exists
  const badge = await prisma.badge.findUnique({
    where: { key: badgeKey },
  });

  if (!badge) return;

  // Check if user already has badge
  const existing = await prisma.userBadge.findUnique({
    where: {
      userId_badgeKey: { userId, badgeKey },
    },
  });

  if (existing) return;

  // Award badge
  await prisma.userBadge.create({
    data: {
      userId,
      badgeKey,
    },
  });
}

/**
 * Get challenge statistics for a user
 */
async function getChallengeStats(
  userId: string
): Promise<{ joined: number; top10: number; wins: number }> {
  const participations = await prisma.challengeParticipant.findMany({
    where: { userId },
    include: {
      challenge: {
        include: {
          leaderboard: {
            where: { userId },
            select: { rank: true },
          },
        },
      },
    },
  });

  const joined = participations.length;
  const top10 = participations.filter(
    (p) => p.challenge.leaderboard[0]?.rank && p.challenge.leaderboard[0].rank <= 10
  ).length;
  const wins = participations.filter(
    (p) => p.challenge.leaderboard[0]?.rank === 1
  ).length;

  return { joined, top10, wins };
}

/**
 * Update user cached stats (call after daily log)
 */
export async function updateUserStats(userId: string): Promise<void> {
  // Calculate total stitches from projects
  const projects = await prisma.project.findMany({
    where: { userId },
    include: {
      logs: {
        orderBy: { date: "desc" },
        take: 1,
        select: { totalStitches: true },
      },
    },
  });

  const totalStitches = projects.reduce((sum, project) => {
    const latestTotal = project.logs[0]?.totalStitches || 0;
    return sum + latestTotal;
  }, 0);

  // Count completed projects
  const projectsCount = await prisma.project.count({
    where: { userId, status: "completed" },
  });

  // Calculate streak
  const streak = await calculateStreak(userId);

  // Update user
  await prisma.user.update({
    where: { id: userId },
    data: {
      totalStitches,
      projectsCount,
      currentStreak: streak.current,
      longestStreak: Math.max(streak.current, streak.longest),
      lastActivityDate: streak.lastDate,
    },
  });
}

/**
 * Calculate user's streak (consecutive days with activity)
 */
async function calculateStreak(
  userId: string
): Promise<{ current: number; longest: number; lastDate: Date | null }> {
  const logs = await prisma.dailyLog.findMany({
    where: {
      project: { userId },
    },
    orderBy: { date: "desc" },
    select: { date: true },
  });

  if (logs.length === 0) {
    return { current: 0, longest: 0, lastDate: null };
  }

  // Get unique dates
  const uniqueDates = Array.from(
    new Set(logs.map((log) => log.date.toISOString().split("T")[0]))
  ).map((dateStr) => new Date(dateStr));

  uniqueDates.sort((a, b) => b.getTime() - a.getTime());

  let currentStreak = 1;
  let longestStreak = 1;
  let tempStreak = 1;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const mostRecent = uniqueDates[0];
  mostRecent.setHours(0, 0, 0, 0);

  // Check if streak is broken (no activity yesterday or today)
  const oneDayMs = 24 * 60 * 60 * 1000;
  const daysSinceActivity = Math.floor(
    (today.getTime() - mostRecent.getTime()) / oneDayMs
  );

  if (daysSinceActivity > 1) {
    currentStreak = 0;
  } else {
    // Calculate current streak
    for (let i = 0; i < uniqueDates.length - 1; i++) {
      const current = uniqueDates[i];
      const next = uniqueDates[i + 1];
      const diffDays = Math.floor(
        (current.getTime() - next.getTime()) / oneDayMs
      );

      if (diffDays === 1) {
        currentStreak++;
        tempStreak++;
        longestStreak = Math.max(longestStreak, tempStreak);
      } else {
        break;
      }
    }
  }

  // Calculate longest streak in history
  tempStreak = 1;
  for (let i = 0; i < uniqueDates.length - 1; i++) {
    const current = uniqueDates[i];
    const next = uniqueDates[i + 1];
    const diffDays = Math.floor(
      (current.getTime() - next.getTime()) / oneDayMs
    );

    if (diffDays === 1) {
      tempStreak++;
      longestStreak = Math.max(longestStreak, tempStreak);
    } else {
      tempStreak = 1;
    }
  }

  return {
    current: currentStreak,
    longest: longestStreak,
    lastDate: mostRecent,
  };
}

/**
 * Get user's achievement progress for a specific category
 */
export async function getAchievementProgress(
  userId: string,
  category: string
): Promise<
  Array<{
    achievement: AchievementDefinition;
    unlocked: boolean;
    progress: number;
    progressPercent: number;
  }>
> {
  const achievements = getAchievementsByCategory(category as any);
  const unlocked = await prisma.userAchievement.findMany({
    where: { userId },
    select: { achievementId: true },
  });

  const unlockedIds = new Set(unlocked.map((a) => a.achievementId));

  // Get current user stats to show progress
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      totalStitches: true,
      projectsCount: true,
      currentStreak: true,
    },
  });

  if (!user) return [];

  return achievements.map((achievement) => {
    let currentValue = 0;

    switch (achievement.category) {
      case "milestone":
        currentValue = user.totalStitches;
        break;
      case "collection":
        currentValue = user.projectsCount;
        break;
      case "streak":
        currentValue = user.currentStreak;
        break;
      // For social and challenge, would need additional queries
      default:
        currentValue = 0;
    }

    return {
      achievement,
      unlocked: unlockedIds.has(achievement.id),
      progress: Math.min(currentValue, achievement.threshold),
      progressPercent: Math.min(
        (currentValue / achievement.threshold) * 100,
        100
      ),
    };
  });
}
