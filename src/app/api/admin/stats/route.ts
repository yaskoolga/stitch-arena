import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const { session, error } = await requireAdmin();
  if (error) return error;

  try {
    // Get current date for calculations
    const now = new Date();
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const firstDayOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastDayOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);

    // Total counts
    const [
      totalUsers,
      totalProjects,
      totalComments,
      totalChallenges,
      pendingReports,
      bannedUsers,
      // This month
      usersThisMonth,
      projectsThisMonth,
      // Last month
      usersLastMonth,
      projectsLastMonth,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.project.count(),
      prisma.comment.count(),
      prisma.challenge.count({ where: { isActive: true } }),
      prisma.report.count({ where: { status: "pending" } }),
      prisma.user.count({ where: { isBanned: true } }),
      // This month
      prisma.user.count({
        where: { createdAt: { gte: firstDayOfMonth } },
      }),
      prisma.project.count({
        where: { createdAt: { gte: firstDayOfMonth } },
      }),
      // Last month
      prisma.user.count({
        where: {
          createdAt: {
            gte: firstDayOfLastMonth,
            lte: lastDayOfLastMonth,
          },
        },
      }),
      prisma.project.count({
        where: {
          createdAt: {
            gte: firstDayOfLastMonth,
            lte: lastDayOfLastMonth,
          },
        },
      }),
    ]);

    // Calculate trends
    const userTrend =
      usersLastMonth > 0
        ? ((usersThisMonth - usersLastMonth) / usersLastMonth) * 100
        : 0;
    const projectTrend =
      projectsLastMonth > 0
        ? ((projectsThisMonth - projectsLastMonth) / projectsLastMonth) * 100
        : 0;

    return NextResponse.json({
      totalUsers,
      totalProjects,
      totalComments,
      totalChallenges,
      pendingReports,
      bannedUsers,
      trends: {
        users: {
          value: Math.round(userTrend),
          isPositive: userTrend >= 0,
        },
        projects: {
          value: Math.round(projectTrend),
          isPositive: projectTrend >= 0,
        },
      },
    });
  } catch (error) {
    console.error("Failed to fetch admin stats:", error);
    return NextResponse.json(
      { error: "Failed to fetch statistics" },
      { status: 500 }
    );
  }
}
