/**
 * Cron job to update leaderboards for all active challenges
 * Runs every 5 minutes
 */

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  calculateUserProgressForChallenge,
  updateLeaderboardEntry,
  recalculateRanks,
} from "@/lib/challenges";

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
 * Update leaderboard for a single challenge
 */
async function updateChallengeLeaderboard(challengeId: string): Promise<{
  challengeId: string;
  participantsUpdated: number;
  success: boolean;
  error?: string;
}> {
  try {
    // Get challenge and its participants
    const challenge = await prisma.challenge.findUnique({
      where: { id: challengeId },
      include: {
        participants: true,
      },
    });

    if (!challenge) {
      return {
        challengeId,
        participantsUpdated: 0,
        success: false,
        error: "Challenge not found",
      };
    }

    // Update progress for each participant
    for (const participant of challenge.participants) {
      const progress = await calculateUserProgressForChallenge(
        participant.userId,
        challenge
      );

      // Update participant progress
      await prisma.challengeParticipant.update({
        where: {
          challengeId_userId: {
            challengeId: challenge.id,
            userId: participant.userId,
          },
        },
        data: { currentProgress: progress },
      });

      // Update leaderboard entry
      await updateLeaderboardEntry(
        participant.userId,
        challenge.id,
        progress
      );
    }

    // Recalculate ranks
    await recalculateRanks(challenge.id);

    return {
      challengeId,
      participantsUpdated: challenge.participants.length,
      success: true,
    };
  } catch (error) {
    console.error(
      `Error updating leaderboard for challenge ${challengeId}:`,
      error
    );
    return {
      challengeId,
      participantsUpdated: 0,
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * GET /api/cron/challenges/update-leaderboards
 * Update leaderboards for all active challenges
 */
export async function GET(request: Request) {
  // Verify cron request
  if (!verifyCronRequest(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const now = new Date();

    // Find all active challenges
    const activeChallenges = await prisma.challenge.findMany({
      where: {
        isActive: true,
        startDate: {
          lte: now,
        },
        endDate: {
          gte: now,
        },
      },
      select: {
        id: true,
        title: true,
      },
    });

    if (activeChallenges.length === 0) {
      return NextResponse.json({
        message: "No active challenges to update",
        updated: 0,
      });
    }

    // Update leaderboards for each challenge
    const results = await Promise.all(
      activeChallenges.map((challenge) =>
        updateChallengeLeaderboard(challenge.id)
      )
    );

    const successCount = results.filter((r) => r.success).length;
    const totalParticipants = results.reduce(
      (sum, r) => sum + r.participantsUpdated,
      0
    );

    return NextResponse.json({
      message: `Updated ${successCount}/${activeChallenges.length} challenge leaderboards`,
      challengesUpdated: successCount,
      totalParticipantsUpdated: totalParticipants,
      results,
    });
  } catch (error) {
    console.error("Error updating leaderboards:", error);
    return NextResponse.json(
      { error: "Failed to update leaderboards" },
      { status: 500 }
    );
  }
}
