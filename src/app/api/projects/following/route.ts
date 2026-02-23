import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/projects/following
 * Get all projects followed by the current user
 */
export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const follows = await prisma.projectFollow.findMany({
      where: { userId: session.user.id },
      include: {
        project: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                avatar: true,
              },
            },
            logs: {
              select: { totalStitches: true },
              orderBy: { date: "desc" },
              take: 1,
            },
            _count: {
              select: {
                likes: true,
                comments: true,
                followers: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const projects = follows.map(follow => {
      const projectThemes = follow.project.themes ? JSON.parse(follow.project.themes) : [];

      return {
        ...follow.project,
        themes: projectThemes,
        completedStitches: follow.project.logs[0]?.totalStitches || 0,
        likeCount: follow.project._count.likes,
        commentCount: follow.project._count.comments,
        followerCount: follow.project._count.followers,
        followedAt: follow.createdAt,
      };
    });

    return NextResponse.json(projects);
  } catch (error) {
    console.error("Error fetching following projects:", error);
    return NextResponse.json(
      { error: "Failed to fetch following projects" },
      { status: 500 }
    );
  }
}
