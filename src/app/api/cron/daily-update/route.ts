import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { updateUserStats, checkAndAwardAchievements } from "@/lib/achievements/engine";
import { updateAllLeaderboards } from "@/lib/leaderboards/calculator";

// Daily cron job to update stats and leaderboards
// Called automatically once per day
export async function GET(request: NextRequest) {
  // Verify cron secret to prevent unauthorized access
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const startTime = Date.now();
  const results = {
    usersUpdated: 0,
    achievementsAwarded: 0,
    leaderboardsUpdated: false,
    errors: [] as string[],
  };

  try {
    console.log("[CRON] Starting daily update...");

    // Get all users
    const users = await prisma.user.findMany({
      select: { id: true, email: true },
    });

    console.log(`[CRON] Found ${users.length} users`);

    // Update stats and check achievements for each user
    for (const user of users) {
      try {
        // Update cached stats
        await updateUserStats(user.id);
        results.usersUpdated++;

        // Check for new achievements
        const newAchievements = await checkAndAwardAchievements(user.id);
        results.achievementsAwarded += newAchievements.length;

        if (newAchievements.length > 0) {
          console.log(
            `[CRON] User ${user.email} unlocked ${newAchievements.length} achievements`
          );
        }
      } catch (error) {
        const errorMsg = `Failed to update user ${user.email}: ${error}`;
        console.error(`[CRON] ${errorMsg}`);
        results.errors.push(errorMsg);
      }
    }

    // Update all leaderboards
    console.log("[CRON] Updating leaderboards...");
    await updateAllLeaderboards();
    results.leaderboardsUpdated = true;

    const duration = Date.now() - startTime;
    console.log(`[CRON] Daily update completed in ${duration}ms`);

    return NextResponse.json({
      success: true,
      results,
      duration: `${duration}ms`,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("[CRON] Fatal error during daily update:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Daily update failed",
        results,
      },
      { status: 500 }
    );
  }
}

// Allow POST as well (for manual triggers)
export async function POST(request: NextRequest) {
  return GET(request);
}
