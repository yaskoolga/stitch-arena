import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  groupLogsByDate,
  findMostProductiveDay,
  findMostProductiveWeek,
  calculate6MonthAverage,
  calculateStreak,
} from "@/lib/stats";
import { HEATMAP_MONTHS } from "@/lib/constants";

export const dynamic = "force-dynamic";

/**
 * GET /api/stats/user/[userId]
 * Get statistics for a user's PUBLIC projects only
 * Used when viewing another user's dashboard
 */
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ userId: string }> }
) {
  const { userId } = await params;

  try {
    // Get only PUBLIC projects for the user
    const projects = await prisma.project.findMany({
      where: {
        userId,
        isPublic: true,
      },
      include: {
        logs: {
          orderBy: { date: "asc" },
        },
      },
    });

    // Get all logs from public projects only
    const allLogs = await prisma.dailyLog.findMany({
      where: {
        project: {
          userId,
          isPublic: true,
        },
      },
      orderBy: { date: "asc" },
    });

    // Calculate overall statistics (only from public projects)
    const totalProjects = projects.length;
    const activeProjects = projects.filter((p) => p.status === "in_progress").length;
    const completedProjects = projects.filter((p) => p.status === "completed").length;
    const pausedProjects = projects.filter((p) => p.status === "paused").length;

    // Total stitches across public projects
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
    const projectsWithStitches = projects
      .map((p) => {
        const completed =
          p.logs.length > 0
            ? Math.max(...p.logs.map((l) => l.totalStitches))
            : p.initialStitches;
        // Calculate actual stitched (excluding initial)
        const actualStitched = Math.max(0, completed - p.initialStitches);
        // Progress based on remaining stitches to complete
        const remainingStitches = p.totalStitches - p.initialStitches;
        const progress =
          remainingStitches > 0 ? (actualStitched / remainingStitches) * 100 : 0;

        return {
          id: p.id,
          title: p.title,
          schemaImage: p.schemaImage,
          totalStitches: p.totalStitches,
          completedStitches: completed,
          actualStitched, // Stitches done while tracking
          progress,
        };
      })
      .sort((a, b) => b.actualStitched - a.actualStitched)
      .slice(0, 5);

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

    return NextResponse.json(stats);
  } catch (error) {
    console.error("Error fetching user stats:", error);
    return NextResponse.json(
      { error: "Failed to fetch user statistics" },
      { status: 500 }
    );
  }
}
