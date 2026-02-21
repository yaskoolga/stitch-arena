import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { checkAchievements, getUserAchievements, unlockAchievements } from "@/lib/achievements";
import { ACHIEVEMENTS } from "@/lib/constants";

/**
 * GET /api/achievements
 * Returns user's achievements with progress
 */
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Check all achievements and their progress
    const checks = await checkAchievements(session.user.id);

    // Get unlocked achievements with details
    const unlocked = await getUserAchievements(session.user.id);

    // Combine with achievement definitions
    const achievementsWithProgress = Object.values(ACHIEVEMENTS).map(achievement => {
      const check = checks.find(c => c.achievementId === achievement.id);
      const unlockedItem = unlocked.find(u => u.achievementId === achievement.id);

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
    });
  } catch (error) {
    console.error("Error fetching achievements:", error);
    return NextResponse.json(
      { error: "Failed to fetch achievements" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/achievements
 * Check and unlock new achievements for the user
 * Returns newly unlocked achievement IDs
 */
export async function POST() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const newlyUnlocked = await unlockAchievements(session.user.id);

    // Get full details of newly unlocked achievements
    const unlockedDetails = newlyUnlocked.map(id => {
      const achievement = Object.values(ACHIEVEMENTS).find(a => a.id === id);
      return achievement;
    }).filter(Boolean);

    return NextResponse.json({
      newlyUnlocked: unlockedDetails,
      count: newlyUnlocked.length,
    });
  } catch (error) {
    console.error("Error unlocking achievements:", error);
    return NextResponse.json(
      { error: "Failed to unlock achievements" },
      { status: 500 }
    );
  }
}
