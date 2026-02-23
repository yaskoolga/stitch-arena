import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { notifyProjectFollow } from "@/lib/notifications";

/**
 * GET /api/projects/[id]/follow
 * Check if current user follows the project and get follower count
 */
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = await getServerSession(authOptions);

  try {
    const followerCount = await prisma.projectFollow.count({
      where: { projectId: id },
    });

    let isFollowing = false;
    if (session?.user?.id) {
      const follow = await prisma.projectFollow.findUnique({
        where: {
          userId_projectId: {
            userId: session.user.id,
            projectId: id,
          },
        },
      });
      isFollowing = !!follow;
    }

    return NextResponse.json({ followerCount, isFollowing });
  } catch (error) {
    console.error("Error fetching follow status:", error);
    return NextResponse.json(
      { error: "Failed to fetch follow status" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/projects/[id]/follow
 * Toggle follow on a project (follow if not following, unfollow if following)
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
      select: { id: true, isPublic: true, userId: true, title: true },
    });

    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    // Only allow following public projects or own projects
    if (!project.isPublic && project.userId !== session.user.id) {
      return NextResponse.json(
        { error: "Cannot follow private projects" },
        { status: 403 }
      );
    }

    // Check if already following
    const existingFollow = await prisma.projectFollow.findUnique({
      where: {
        userId_projectId: {
          userId: session.user.id,
          projectId: id,
        },
      },
    });

    let isFollowing: boolean;

    if (existingFollow) {
      // Unfollow
      await prisma.projectFollow.delete({
        where: { id: existingFollow.id },
      });
      isFollowing = false;
    } else {
      // Follow
      await prisma.projectFollow.create({
        data: {
          userId: session.user.id,
          projectId: id,
        },
      });
      isFollowing = true;

      // Send notification (don't notify if following own project)
      if (project.userId !== session.user.id) {
        notifyProjectFollow({
          projectId: id,
          projectTitle: project.title,
          followedByUserId: session.user.id,
          followedByUserName: session.user.name || "Someone",
          projectOwnerId: project.userId,
        }).catch(console.error);
      }
    }

    const followerCount = await prisma.projectFollow.count({
      where: { projectId: id },
    });

    return NextResponse.json({ isFollowing, followerCount });
  } catch (error) {
    console.error("Error toggling follow:", error);
    return NextResponse.json(
      { error: "Failed to toggle follow" },
      { status: 500 }
    );
  }
}
