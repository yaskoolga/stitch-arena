import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { groupLogsByDate, findMostProductiveDay, findMostProductiveWeek, calculate6MonthAverage, calculateStreak } from "@/lib/stats";
import { HEATMAP_MONTHS } from "@/lib/constants";

// Cache the result for 5 minutes
let cachedStats: any = null;
let cacheTime: number = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Check cache
  const now = Date.now();
  if (cachedStats && cacheTime && (now - cacheTime) < CACHE_DURATION) {
    return NextResponse.json(cachedStats);
  }

  try {
    // Get all projects for the user
    const projects = await prisma.project.findMany({
      where: { userId: session.user.id },
      include: {
        logs: {
          orderBy: { date: "asc" },
        },
      },
    });

    // Get all logs for the user
    const allLogs = await prisma.dailyLog.findMany({
      where: {
        project: {
          userId: session.user.id,
        },
      },
      orderBy: { date: "asc" },
    });

    // Calculate overall statistics
    const totalProjects = projects.length;
    const activeProjects = projects.filter(p => p.status === "in_progress").length;
    const completedProjects = projects.filter(p => p.status === "completed").length;
    const pausedProjects = projects.filter(p => p.status === "paused").length;

    // Total stitches across all projects
    const totalStitches = allLogs.reduce((sum, log) => sum + log.dailyStitches, 0);

    // Most productive day
    const mostProductiveDay = findMostProductiveDay(allLogs);

    // Most productive week
    const mostProductiveWeek = findMostProductiveWeek(allLogs);

    // Average speed over last 6 months
    const avgSpeed = calculate6MonthAverage(allLogs);

    // Calculate streaks
    const streaks = calculateStreak(allLogs);

    // Top 5 projects by stitches
    const projectsWithStitches = projects.map(p => {
      const completed = p.logs.length > 0
        ? Math.max(...p.logs.map(l => l.totalStitches))
        : 0;
      return {
        id: p.id,
        title: p.title,
        schemaImage: p.schemaImage,
        totalStitches: p.totalStitches,
        completedStitches: completed,
        progress: p.totalStitches > 0 ? (completed / p.totalStitches) * 100 : 0,
      };
    }).sort((a, b) => b.completedStitches - a.completedStitches).slice(0, 5);

    // Heatmap data for last 12 months
    const heatmapData = groupLogsByDate(allLogs, HEATMAP_MONTHS);

    const stats = {
      projectCounts: {
        total: totalProjects,
        active: activeProjects,
        completed: completedProjects,
        paused: pausedProjects,
      },
      totalStitches,
      mostProductiveDay,
      mostProductiveWeek,
      avgSpeed: Math.round(avgSpeed * 10) / 10, // Round to 1 decimal
      currentStreak: streaks.currentStreak,
      bestStreak: streaks.bestStreak,
      topProjects: projectsWithStitches,
      heatmapData,
    };

    // Update cache
    cachedStats = stats;
    cacheTime = now;

    return NextResponse.json(stats);
  } catch (error) {
    console.error("Error fetching overall stats:", error);
    return NextResponse.json(
      { error: "Failed to fetch statistics" },
      { status: 500 }
    );
  }
}
