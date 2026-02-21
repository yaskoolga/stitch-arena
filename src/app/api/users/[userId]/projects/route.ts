import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

/**
 * GET /api/users/[userId]/projects
 * Get public projects for a specific user
 * Used when viewing another user's dashboard
 */
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ userId: string }> }
) {
  const { userId } = await params;

  try {
    const projects = await prisma.project.findMany({
      where: {
        userId,
        isPublic: true,
      },
      include: {
        logs: {
          select: { totalStitches: true, dailyStitches: true, date: true },
          orderBy: { date: "desc" },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const result = projects.map((p) => {
      const completedStitches = p.logs[0]?.totalStitches || p.initialStitches;
      const actualStitched = Math.max(0, completedStitches - p.initialStitches);
      return {
        ...p,
        completedStitches,
        actualStitched,
      };
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error fetching user projects:", error);
    return NextResponse.json(
      { error: "Failed to fetch user projects" },
      { status: 500 }
    );
  }
}
