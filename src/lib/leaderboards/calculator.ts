import { prisma } from "@/lib/prisma";

export type LeaderboardType = "alltime" | "monthly" | "weekly" | "projects" | "streak";

/**
 * Update all leaderboards
 * Call this periodically (e.g., every 10 minutes via cron)
 */
export async function updateAllLeaderboards(): Promise<void> {
  await Promise.all([
    updateAlltimeLeaderboard(),
    updateMonthlyLeaderboard(),
    updateWeeklyLeaderboard(),
    updateProjectsLeaderboard(),
    updateStreakLeaderboard(),
  ]);
}

/**
 * Update all-time stitches leaderboard
 */
export async function updateAlltimeLeaderboard(): Promise<void> {
  const users = await prisma.user.findMany({
    where: {
      totalStitches: { gt: 0 },
    },
    select: {
      id: true,
      totalStitches: true,
    },
    orderBy: { totalStitches: "desc" },
    take: 100, // Top 100
  });

  // Delete old entries
  await prisma.leaderboard.deleteMany({
    where: {
      type: "alltime",
      period: null,
    },
  });

  // Create new entries
  const entries = users.map((user, index) => ({
    type: "alltime",
    period: null,
    rank: index + 1,
    userId: user.id,
    score: user.totalStitches,
  }));

  if (entries.length > 0) {
    await prisma.leaderboard.createMany({
      data: entries,
    });
  }
}

/**
 * Update monthly stitches leaderboard
 */
export async function updateMonthlyLeaderboard(): Promise<void> {
  const now = new Date();
  const period = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;

  const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const lastDayOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

  // Get monthly stitches for each user
  const logs = await prisma.dailyLog.findMany({
    where: {
      date: {
        gte: firstDayOfMonth,
        lte: lastDayOfMonth,
      },
    },
    select: {
      dailyStitches: true,
      project: {
        select: {
          userId: true,
        },
      },
    },
  });

  // Aggregate by user
  const userScores = new Map<string, number>();
  for (const log of logs) {
    const current = userScores.get(log.project.userId) || 0;
    userScores.set(log.project.userId, current + log.dailyStitches);
  }

  // Sort by score
  const sorted = Array.from(userScores.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 100);

  // Delete old entries for this period
  await prisma.leaderboard.deleteMany({
    where: {
      type: "monthly",
      period,
    },
  });

  // Create new entries
  const entries = sorted.map(([userId, score], index) => ({
    type: "monthly",
    period,
    rank: index + 1,
    userId,
    score,
  }));

  if (entries.length > 0) {
    await prisma.leaderboard.createMany({
      data: entries,
    });
  }
}

/**
 * Update weekly stitches leaderboard
 */
export async function updateWeeklyLeaderboard(): Promise<void> {
  const now = new Date();

  // Get ISO week number
  const getWeek = (date: Date): string => {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() + 4 - (d.getDay() || 7));
    const yearStart = new Date(d.getFullYear(), 0, 1);
    const weekNo = Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
    return `${d.getFullYear()}-W${String(weekNo).padStart(2, "0")}`;
  };

  const period = getWeek(now);

  // Get start of week (Monday)
  const dayOfWeek = now.getDay() || 7; // Sunday = 7
  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - dayOfWeek + 1);
  startOfWeek.setHours(0, 0, 0, 0);

  // Get end of week (Sunday)
  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 6);
  endOfWeek.setHours(23, 59, 59, 999);

  // Get weekly stitches for each user
  const logs = await prisma.dailyLog.findMany({
    where: {
      date: {
        gte: startOfWeek,
        lte: endOfWeek,
      },
    },
    select: {
      dailyStitches: true,
      project: {
        select: {
          userId: true,
        },
      },
    },
  });

  // Aggregate by user
  const userScores = new Map<string, number>();
  for (const log of logs) {
    const current = userScores.get(log.project.userId) || 0;
    userScores.set(log.project.userId, current + log.dailyStitches);
  }

  // Sort by score
  const sorted = Array.from(userScores.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 100);

  // Delete old entries for this period
  await prisma.leaderboard.deleteMany({
    where: {
      type: "weekly",
      period,
    },
  });

  // Create new entries
  const entries = sorted.map(([userId, score], index) => ({
    type: "weekly",
    period,
    rank: index + 1,
    userId,
    score,
  }));

  if (entries.length > 0) {
    await prisma.leaderboard.createMany({
      data: entries,
    });
  }
}

/**
 * Update projects completed leaderboard
 */
export async function updateProjectsLeaderboard(): Promise<void> {
  const users = await prisma.user.findMany({
    where: {
      projectsCount: { gt: 0 },
    },
    select: {
      id: true,
      projectsCount: true,
    },
    orderBy: { projectsCount: "desc" },
    take: 100,
  });

  // Delete old entries
  await prisma.leaderboard.deleteMany({
    where: {
      type: "projects",
      period: null,
    },
  });

  // Create new entries
  const entries = users.map((user, index) => ({
    type: "projects",
    period: null,
    rank: index + 1,
    userId: user.id,
    score: user.projectsCount,
  }));

  if (entries.length > 0) {
    await prisma.leaderboard.createMany({
      data: entries,
    });
  }
}

/**
 * Update current streak leaderboard
 */
export async function updateStreakLeaderboard(): Promise<void> {
  const users = await prisma.user.findMany({
    where: {
      currentStreak: { gt: 0 },
    },
    select: {
      id: true,
      currentStreak: true,
    },
    orderBy: { currentStreak: "desc" },
    take: 100,
  });

  // Delete old entries
  await prisma.leaderboard.deleteMany({
    where: {
      type: "streak",
      period: null,
    },
  });

  // Create new entries
  const entries = users.map((user, index) => ({
    type: "streak",
    period: null,
    rank: index + 1,
    userId: user.id,
    score: user.currentStreak,
  }));

  if (entries.length > 0) {
    await prisma.leaderboard.createMany({
      data: entries,
    });
  }
}

/**
 * Get leaderboard for a specific type
 */
export async function getLeaderboard(
  type: LeaderboardType,
  period?: string,
  limit: number = 100
) {
  return await prisma.leaderboard.findMany({
    where: {
      type,
      period: period || null,
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          avatar: true,
        },
      },
    },
    orderBy: { rank: "asc" },
    take: limit,
  });
}

/**
 * Get user's rank in a leaderboard
 */
export async function getUserRank(
  userId: string,
  type: LeaderboardType,
  period?: string
): Promise<number | null> {
  const entry = await prisma.leaderboard.findFirst({
    where: {
      type,
      userId,
      period: period || null,
    },
    select: { rank: true },
  });

  return entry?.rank || null;
}

/**
 * Get user's rank with context (show some users above and below)
 */
export async function getUserRankWithContext(
  userId: string,
  type: LeaderboardType,
  period?: string,
  contextSize: number = 5
) {
  const userEntry = await prisma.leaderboard.findFirst({
    where: {
      type,
      userId,
      period: period || null,
    },
  });

  if (!userEntry) return null;

  const minRank = Math.max(1, userEntry.rank - contextSize);
  const maxRank = userEntry.rank + contextSize;

  const entries = await prisma.leaderboard.findMany({
    where: {
      type,
      period: period || null,
      rank: {
        gte: minRank,
        lte: maxRank,
      },
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          avatar: true,
        },
      },
    },
    orderBy: { rank: "asc" },
  });

  return {
    userRank: userEntry.rank,
    userScore: userEntry.score,
    context: entries,
  };
}
