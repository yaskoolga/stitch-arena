import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { notifyLike } from "@/lib/notifications";

/**
 * GET /api/projects/[id]/like
 * Check if current user liked the project and get like count
 */
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = await getServerSession(authOptions);

  try {
    const likeCount = await prisma.like.count({
      where: { projectId: id },
    });

    let isLiked = false;
    if (session?.user?.id) {
      const like = await prisma.like.findUnique({
        where: {
          userId_projectId: {
            userId: session.user.id,
            projectId: id,
          },
        },
      });
      isLiked = !!like;
    }

    return NextResponse.json({ likeCount, isLiked });
  } catch (error) {
    console.error("Error fetching like status:", error);
    return NextResponse.json(
      { error: "Failed to fetch like status" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/projects/[id]/like
 * Toggle like on a project (like if not liked, unlike if liked)
 */
export async function POST(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Check if project exists
    const project = await prisma.project.findUnique({
      where: { id },
      select: { id: true, isPublic: true, userId: true },
    });

    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    // Only allow likes on public projects or own projects
    if (!project.isPublic && project.userId !== session.user.id) {
      return NextResponse.json(
        { error: "Cannot like private projects" },
        { status: 403 }
      );
    }

    // Check if already liked
    const existingLike = await prisma.like.findUnique({
      where: {
        userId_projectId: {
          userId: session.user.id,
          projectId: id,
        },
      },
    });

    if (existingLike) {
      // Unlike
      await prisma.like.delete({
        where: { id: existingLike.id },
      });

      const likeCount = await prisma.like.count({
        where: { projectId: id },
      });

      return NextResponse.json({ liked: false, likeCount });
    } else {
      // Like
      await prisma.like.create({
        data: {
          userId: session.user.id,
          projectId: id,
        },
      });

      const likeCount = await prisma.like.count({
        where: { projectId: id },
      });

      // Send notification
      notifyLike({
        projectId: id,
        likedByUserId: session.user.id,
        likedByUserName: session.user.name || "Someone",
      }).catch(console.error);

      return NextResponse.json({ liked: true, likeCount });
    }
  } catch (error) {
    console.error("Error toggling like:", error);
    return NextResponse.json(
      { error: "Failed to toggle like" },
      { status: 500 }
    );
  }
}
