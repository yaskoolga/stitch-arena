import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { checkAchievements, getUserAchievements } from "@/lib/achievements";
import { ACHIEVEMENTS } from "@/lib/constants";

export const dynamic = "force-dynamic";

/**
 * GET /api/users/[userId]/achievements
 * Returns user's achievements with progress
 * Public endpoint - anyone can view
 */
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ userId: string }> }
) {
  const { userId } = await params;
  const session = await getServerSession(authOptions);
  const isOwnProfile = session?.user?.id === userId;

  try {
    // Check all achievements and their progress for this user
    const checks = await checkAchievements(userId);

    // Get unlocked achievements with details
    const unlocked = await getUserAchievements(userId);

    // Combine with achievement definitions
    const achievementsWithProgress = Object.values(ACHIEVEMENTS).map((achievement) => {
      const check = checks.find((c) => c.achievementId === achievement.id);
      const unlockedItem = unlocked.find((u) => u.achievementId === achievement.id);

      return {
        ...achievement,
        isUnlocked: check?.isUnlocked || false,
        progress: check?.progress || 0,
        requirement: achievement.requirement,
        unlockedAt: unlockedItem?.unlockedAt || null,
      };
    });

    // Sort: unlocked first (by date), then by category and requirement
    achievementsWithProgress.sort((a, b) => {
      if (a.isUnlocked && !b.isUnlocked) return -1;
      if (!a.isUnlocked && b.isUnlocked) return 1;
      if (a.isUnlocked && b.isUnlocked) {
        return new Date(b.unlockedAt!).getTime() - new Date(a.unlockedAt!).getTime();
      }
      if (a.category !== b.category) {
        return a.category.localeCompare(b.category);
      }
      return a.requirement - b.requirement;
    });

    return NextResponse.json({
      achievements: achievementsWithProgress,
      unlockedCount: unlocked.length,
      totalCount: Object.keys(ACHIEVEMENTS).length,
      isOwnProfile,
    });
  } catch (error) {
    console.error("Error fetching user achievements:", error);
    return NextResponse.json(
      { error: "Failed to fetch achievements" },
      { status: 500 }
    );
  }
}
