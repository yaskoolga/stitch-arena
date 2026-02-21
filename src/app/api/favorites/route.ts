import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/favorites
 * Get all projects liked by the current user
 */
export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const likes = await prisma.like.findMany({
      where: { userId: session.user.id },
      include: {
        project: {
          include: {
            user: {
              select: {
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
              select: { likes: true },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const projects = likes.map(like => {
      const projectThemes = like.project.themes ? JSON.parse(like.project.themes) : [];

      return {
        ...like.project,
        themes: projectThemes,
        completedStitches: like.project.logs[0]?.totalStitches || 0,
        likeCount: like.project._count.likes,
        likedAt: like.createdAt,
      };
    });

    return NextResponse.json(projects);
  } catch (error) {
    console.error("Error fetching favorites:", error);
    return NextResponse.json(
      { error: "Failed to fetch favorites" },
      { status: 500 }
    );
  }
}
