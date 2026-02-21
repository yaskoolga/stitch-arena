import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = 'force-dynamic';

/**
 * GET /api/users/[userId]
 * Get public profile information for a user
 */
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ userId: string }> }
) {
  const { userId } = await params;
  const session = await getServerSession(authOptions);
  const isOwnProfile = session?.user?.id === userId;

  try {
    // Get user with all necessary relations
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        avatar: true,
        bio: true,
        createdAt: true,
        projects: {
          // If viewing own profile, show all projects; otherwise only public
          where: isOwnProfile ? undefined : { isPublic: true },
          select: {
            id: true,
            title: true,
            description: true,
            coverImage: true,
            schemaImage: true,
            totalStitches: true,
            status: true,
            isPublic: true,
            themes: true,
            createdAt: true,
            updatedAt: true,
            logs: {
              select: { totalStitches: true },
              orderBy: { date: "desc" },
              take: 1,
            },
            _count: {
              select: { likes: true, comments: true },
            },
          },
          orderBy: { createdAt: "desc" },
        },
        achievements: {
          select: {
            achievementId: true,
            unlockedAt: true,
            progress: true,
          },
          orderBy: { unlockedAt: "desc" },
        },
        _count: {
          select: {
            projects: true,
            achievements: true,
            comments: true,
            likes: true,
            followers: true,
            following: true,
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // Calculate total stitches across all projects
    const totalStitches = user.projects.reduce((sum, project) => {
      const completedStitches = project.logs[0]?.totalStitches || 0;
      return sum + completedStitches;
    }, 0);

    // Map all projects with additional data
    const allProjects = user.projects.map((p) => ({
      ...p,
      themes: p.themes ? JSON.parse(p.themes) : [],
      completedStitches: p.logs[0]?.totalStitches || 0,
      likeCount: p._count.likes,
      commentCount: p._count.comments,
    }));

    // For response, separate public and all projects
    const publicProjects = allProjects.filter((p) => p.isPublic);

    // Count completed projects
    const completedProjects = user.projects.filter(
      (p) => p.status === "completed"
    ).length;

    // Build response
    const profile = {
      id: user.id,
      name: user.name,
      avatar: user.avatar,
      bio: user.bio,
      createdAt: user.createdAt,
      isOwnProfile,
      stats: {
        totalProjects: user._count.projects,
        publicProjects: publicProjects.length,
        completedProjects,
        totalStitches,
        achievements: user._count.achievements,
        comments: user._count.comments,
        likes: user._count.likes,
        followers: user._count.followers,
        following: user._count.following,
      },
      achievements: user.achievements,
      publicProjects,
      // Include all projects only if viewing own profile
      ...(isOwnProfile && { allProjects }),
    };

    return NextResponse.json(profile);
  } catch (error) {
    console.error("Error fetching user profile:", error);
    return NextResponse.json(
      { error: "Failed to fetch user profile" },
      { status: 500 }
    );
  }
}
