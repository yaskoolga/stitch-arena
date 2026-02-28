import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getUserAchievements } from "@/lib/achievements";

/**
 * PUT /api/profile/title
 * Set or update user's selected title
 */
export async function PUT(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { achievementId } = await req.json();

    // Validate that achievementId is provided (can be null to clear title)
    if (achievementId !== null && typeof achievementId !== "string") {
      return NextResponse.json(
        { error: "Invalid achievement ID" },
        { status: 400 }
      );
    }

    // If setting a title, verify user has unlocked this achievement
    if (achievementId) {
      const unlockedAchievements = await getUserAchievements(session.user.id);
      const hasAchievement = unlockedAchievements.some(
        (a) => a.achievementId === achievementId
      );

      if (!hasAchievement) {
        return NextResponse.json(
          { error: "Achievement not unlocked" },
          { status: 403 }
        );
      }
    }

    // Update user's selected title
    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: { selectedTitle: achievementId },
      select: {
        id: true,
        name: true,
        email: true,
        avatar: true,
        bio: true,
        selectedTitle: true,
      },
    });

    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error("Error updating title:", error);
    return NextResponse.json(
      { error: "Failed to update title" },
      { status: 500 }
    );
  }
}
