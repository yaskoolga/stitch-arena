import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

/**
 * GET /api/projects/by-slug?username=olga&slug=project-slug
 * Get project by username and slug (SEO-friendly URLs)
 */
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const searchParams = req.nextUrl.searchParams;
    const username = searchParams.get("username");
    const slug = searchParams.get("slug");

    if (!username || !slug) {
      return NextResponse.json(
        { error: "Username and slug are required" },
        { status: 400 }
      );
    }

    // Find user by username
    const user = await prisma.user.findUnique({
      where: { username },
      select: { id: true },
    });

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // Find project by userId + slug
    const project = await prisma.project.findFirst({
      where: {
        userId: user.id,
        slug,
      },
      include: {
        logs: {
          orderBy: { date: "desc" },
        },
        user: {
          select: {
            id: true,
            name: true,
            avatar: true,
            username: true,
          },
        },
      },
    });

    if (!project) {
      return NextResponse.json(
        { error: "Project not found" },
        { status: 404 }
      );
    }

    // Check if project is public or belongs to current user
    const isOwner = session?.user?.id === project.userId;
    if (!project.isPublic && !isOwner) {
      return NextResponse.json(
        { error: "Project is private" },
        { status: 403 }
      );
    }

    // Calculate completedStitches from logs
    const completedStitches = project.logs.reduce(
      (total, log) => total + (log.dailyStitches || 0),
      project.initialStitches
    );

    // Get like count
    const likeCount = await prisma.like.count({
      where: { projectId: project.id },
    });

    // Check if current user liked this project
    const isLiked = session?.user?.id
      ? await prisma.like.findUnique({
          where: {
            userId_projectId: {
              userId: session.user.id,
              projectId: project.id,
            },
          },
        })
      : null;

    // Get follower count
    const followerCount = await prisma.projectFollow.count({
      where: { projectId: project.id },
    });

    // Check if current user follows this project
    const isFollowing = session?.user?.id
      ? await prisma.projectFollow.findUnique({
          where: {
            userId_projectId: {
              userId: session.user.id,
              projectId: project.id,
            },
          },
        })
      : null;

    return NextResponse.json({
      ...project,
      completedStitches,
      actualStitched: completedStitches - project.initialStitches,
      likeCount,
      isLiked: !!isLiked,
      followerCount,
      isFollowing: !!isFollowing,
    });
  } catch (error) {
    console.error("Error fetching project by slug:", error);
    return NextResponse.json(
      { error: "Failed to fetch project" },
      { status: 500 }
    );
  }
}
