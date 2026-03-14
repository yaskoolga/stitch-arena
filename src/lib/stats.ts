/**
 * Statistical calculations and utilities
 */

import { DailyLog } from "@prisma/client";
import { subMonths, differenceInDays, differenceInCalendarDays, startOfDay, isSameDay, subDays } from "date-fns";
import { SPEED_CALCULATION_MONTHS } from "./constants";

/**
 * Calculate average stitches per day over the last N months
 */
export function calculate6MonthAverage(logs: DailyLog[]): number {
  if (!logs.length) return 0;

  const cutoffDate = subMonths(new Date(), SPEED_CALCULATION_MONTHS);
  const recentLogs = logs.filter(log => new Date(log.date) >= cutoffDate);

  if (!recentLogs.length) return 0;

  const totalStitches = recentLogs.reduce((sum, log) => sum + log.dailyStitches, 0);

  // Exclude logs with 0 stitches (e.g., initial state logs) from period calculation
  const activeLogs = recentLogs.filter(log => log.dailyStitches > 0);

  if (!activeLogs.length) return 0;

  // Calculate number of days in the period based on active logs only
  const oldestLog = activeLogs.reduce((oldest, log) =>
    new Date(log.date) < new Date(oldest.date) ? log : oldest
  );
  const newestLog = activeLogs.reduce((newest, log) =>
    new Date(log.date) > new Date(newest.date) ? log : newest
  );

  const daySpan = differenceInDays(new Date(newestLog.date), new Date(oldestLog.date)) + 1;

  return totalStitches / daySpan;
}

/**
 * Calculate estimated completion date based on current progress and average speed
 * @returns Date object or null if completion date cannot be calculated
 */
export function calculateForecast(
  completedStitches: number,
  totalStitches: number,
  avgStitchesPerDay: number
): Date | null {
  if (avgStitchesPerDay <= 0 || completedStitches >= totalStitches) {
    return null;
  }

  const remainingStitches = totalStitches - completedStitches;
  const daysRemaining = Math.ceil(remainingStitches / avgStitchesPerDay);

  const completionDate = new Date();
  completionDate.setDate(completionDate.getDate() + daysRemaining);

  return completionDate;
}

/**
 * Group daily logs by date for heatmap visualization
 * @returns Array of {date: string, count: number} objects
 */
export function groupLogsByDate(logs: DailyLog[], monthsBack = 12): Array<{ date: string; count: number }> {
  const cutoffDate = subMonths(new Date(), monthsBack);
  const recentLogs = logs.filter(log => new Date(log.date) >= cutoffDate);

  const grouped = recentLogs.reduce((acc, log) => {
    const dateStr = new Date(log.date).toISOString().split('T')[0];
    if (!acc[dateStr]) {
      acc[dateStr] = 0;
    }
    acc[dateStr] += log.dailyStitches;
    return acc;
  }, {} as Record<string, number>);

  return Object.entries(grouped)
    .map(([date, count]) => ({ date, count }))
    .sort((a, b) => a.date.localeCompare(b.date));
}

/**
 * Find the most productive day from logs
 */
export function findMostProductiveDay(logs: DailyLog[]): { date: Date; count: number } | null {
  if (!logs.length) return null;

  const maxLog = logs.reduce((max, log) =>
    log.dailyStitches > max.dailyStitches ? log : max
  );

  return {
    date: new Date(maxLog.date),
    count: maxLog.dailyStitches,
  };
}

/**
 * Find the most productive week from logs
 */
export function findMostProductiveWeek(logs: DailyLog[]): {
  startDate: Date;
  endDate: Date;
  count: number
} | null {
  if (!logs.length) return null;

  // Sort logs by date
  const sortedLogs = [...logs].sort((a, b) =>
    new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  let maxWeekTotal = 0;
  let maxWeekStart = sortedLogs[0].date;
  let maxWeekEnd = sortedLogs[0].date;

  // Sliding window to find 7-day period with most stitches
  for (let i = 0; i < sortedLogs.length; i++) {
    const windowStart = new Date(sortedLogs[i].date);
    const windowEnd = new Date(windowStart);
    windowEnd.setDate(windowEnd.getDate() + 6);

    const weekLogs = sortedLogs.filter(log => {
      const logDate = new Date(log.date);
      return logDate >= windowStart && logDate <= windowEnd;
    });

    const weekTotal = weekLogs.reduce((sum, log) => sum + log.dailyStitches, 0);

    if (weekTotal > maxWeekTotal) {
      maxWeekTotal = weekTotal;
      maxWeekStart = sortedLogs[i].date;
      maxWeekEnd = weekLogs.length > 0
        ? weekLogs[weekLogs.length - 1].date
        : maxWeekStart;
    }
  }

  return {
    startDate: new Date(maxWeekStart),
    endDate: new Date(maxWeekEnd),
    count: maxWeekTotal,
  };
}

/**
 * Calculate project statistics
 * @param logs Daily logs for the project
 * @param totalStitches Total stitches in the pattern
 * @param initialStitches Stitches already completed before tracking started (default 0)
 */
export function calculateProjectStats(logs: DailyLog[], totalStitches: number, initialStitches = 0) {
  const completed = logs.length > 0
    ? Math.max(...logs.map(l => l.totalStitches))
    : initialStitches;

  // Calculate actual stitches done while tracking (excluding initial)
  const actualStitched = Math.max(0, completed - initialStitches);

  // Progress based on remaining stitches (total - initial)
  const remainingStitches = totalStitches - initialStitches;
  const progress = remainingStitches > 0 ? (actualStitched / remainingStitches) * 100 : 0;

  const avgSpeed = calculate6MonthAverage(logs);
  const forecast = calculateForecast(actualStitched, remainingStitches, avgSpeed);

  return {
    completed,
    actualStitched,
    progress,
    avgSpeed,
    forecast,
  };
}

/**
 * Calculate current streak (consecutive days with logs)
 * @returns Object with currentStreak and bestStreak (longest ever)
 */
export function calculateStreak(logs: DailyLog[]): {
  currentStreak: number;
  bestStreak: number;
} {
  if (!logs.length) return { currentStreak: 0, bestStreak: 0 };

  // Get unique dates (in case multiple logs per day)
  const uniqueDates = Array.from(
    new Set(logs.map(log => startOfDay(new Date(log.date)).getTime()))
  )
    .map(time => new Date(time))
    .sort((a, b) => b.getTime() - a.getTime()); // Sort descending (newest first)

  let currentStreak = 0;
  let bestStreak = 0;
  let tempStreak = 1;

  const today = startOfDay(new Date());
  const yesterday = subDays(today, 1);

  // Calculate current streak
  // Check if there's a log today or yesterday (grace period)
  const mostRecentDate = uniqueDates[0];
  if (isSameDay(mostRecentDate, today) || isSameDay(mostRecentDate, yesterday)) {
    currentStreak = 1;

    // Count consecutive days going backwards
    for (let i = 1; i < uniqueDates.length; i++) {
      const currentDate = uniqueDates[i];
      const previousDate = uniqueDates[i - 1];

      const daysDiff = differenceInCalendarDays(previousDate, currentDate);

      if (daysDiff === 1) {
        currentStreak++;
      } else {
        break;
      }
    }
  }

  // Calculate best streak (all time)
  for (let i = 0; i < uniqueDates.length; i++) {
    if (i === 0) {
      tempStreak = 1;
      bestStreak = 1;
      continue;
    }

    const currentDate = uniqueDates[i];
    const previousDate = uniqueDates[i - 1];
    const daysDiff = differenceInCalendarDays(previousDate, currentDate);

    if (daysDiff === 1) {
      tempStreak++;
      bestStreak = Math.max(bestStreak, tempStreak);
    } else {
      tempStreak = 1;
    }
  }

  return {
    currentStreak,
    bestStreak: Math.max(bestStreak, currentStreak),
  };
}
