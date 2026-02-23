/**
 * Cron job to automatically close finished challenges
 * Runs daily at 01:00 UTC
 */

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { awardChallengeAchievements } from "@/lib/challenges";

/**
 * Verify that the request is from Vercel Cron
 */
function verifyCronRequest(request: Request): boolean {
  const authHeader = request.headers.get("authorization");

  // In development, allow requests without auth
  if (process.env.NODE_ENV === "development") {
    return true;
  }

  // In production, verify the cron secret
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret) {
    console.error("CRON_SECRET not configured");
    return false;
  }

  return authHeader === `Bearer ${cronSecret}`;
}

/**
 * GET /api/cron/challenges/close
 * Close all challenges that have ended
 */
export async function GET(request: Request) {
  // Verify cron request
  if (!verifyCronRequest(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const now = new Date();

    // Find all active challenges that have ended
    const finishedChallenges = await prisma.challenge.findMany({
      where: {
        isActive: true,
        endDate: {
          lt: now,
        },
      },
    });

    if (finishedChallenges.length === 0) {
      return NextResponse.json({
        message: "No challenges to close",
        closed: 0,
      });
    }

    // Close each challenge and award achievements
    const results = [];
    for (const challenge of finishedChallenges) {
      // Deactivate the challenge
      await prisma.challenge.update({
        where: { id: challenge.id },
        data: { isActive: false },
      });

      // Award achievements to winners
      try {
        await awardChallengeAchievements(challenge.id);
        results.push({
          challengeId: challenge.id,
          title: challenge.title,
          success: true,
        });
      } catch (error) {
        console.error(
          `Error awarding achievements for challenge ${challenge.id}:`,
          error
        );
        results.push({
          challengeId: challenge.id,
          title: challenge.title,
          success: false,
          error: error instanceof Error ? error.message : "Unknown error",
        });
      }
    }

    return NextResponse.json({
      message: `Closed ${finishedChallenges.length} challenges`,
      closed: finishedChallenges.length,
      results,
    });
  } catch (error) {
    console.error("Error closing challenges:", error);
    return NextResponse.json(
      { error: "Failed to close challenges" },
      { status: 500 }
    );
  }
}
