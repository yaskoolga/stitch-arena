import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { groupLogsByDate, findMostProductiveDay, findMostProductiveWeek, calculate6MonthAverage, calculateStreak } from "@/lib/stats";
import { HEATMAP_MONTHS } from "@/lib/constants";
import { getLevelProgress } from "@/lib/levels";

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

    // Top 5 projects by stitches + calculate speed for each project
    const projectsWithStitches = projects.map(p => {
      const completed = p.logs.length > 0
        ? Math.max(...p.logs.map(l => l.totalStitches))
        : p.initialStitches;
      // Calculate actual stitched (excluding initial)
      const actualStitched = Math.max(0, completed - p.initialStitches);
      // Progress based on remaining stitches to complete
      const remainingStitches = p.totalStitches - p.initialStitches;
      const progress = remainingStitches > 0 ? (actualStitched / remainingStitches) * 100 : 0;

      // Calculate project-specific average speed (last 6 months)
      const projectAvgSpeed = calculate6MonthAverage(p.logs);

      return {
        id: p.id,
        title: p.title,
        schemaImage: p.schemaImage,
        totalStitches: p.totalStitches,
        completedStitches: completed,
        actualStitched, // Stitches done while tracking
        progress,
        avgSpeed: Math.round(projectAvgSpeed * 10) / 10,
        status: p.status,
      };
    }).sort((a, b) => b.actualStitched - a.actualStitched).slice(0, 5);

    // Heatmap data for last 12 months
    const heatmapData = groupLogsByDate(allLogs, HEATMAP_MONTHS);

    // Progress chart data (last 90 days)
    const progressData = groupLogsByDate(allLogs, 3); // 3 months

    // All projects with speed data (for comparison chart)
    const allProjectsWithSpeed = projects.map(p => {
      const completed = p.logs.length > 0
        ? Math.max(...p.logs.map(l => l.totalStitches))
        : p.initialStitches;
      const actualStitched = Math.max(0, completed - p.initialStitches);
      const remainingStitches = p.totalStitches - p.initialStitches;
      const progress = remainingStitches > 0 ? (actualStitched / remainingStitches) * 100 : 0;
      const projectAvgSpeed = calculate6MonthAverage(p.logs);

      return {
        id: p.id,
        title: p.title,
        totalStitches: p.totalStitches,
        completedStitches: completed,
        progress: Math.round(progress),
        avgSpeed: Math.round(projectAvgSpeed * 10) / 10,
        status: p.status,
      };
    });

    // Calculate user level based on total stitches
    const levelInfo = getLevelProgress(totalStitches);

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
      progressData, // For progress chart
      projectsWithSpeed: allProjectsWithSpeed, // For speed comparison
      level: {
        current: levelInfo.current,
        next: levelInfo.next,
        progress: levelInfo.progress,
        stitchesUntilNext: levelInfo.stitchesUntilNext,
        stitchesInCurrentLevel: levelInfo.stitchesInCurrentLevel,
      },
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
