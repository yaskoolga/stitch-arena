import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getUserChallengeParticipation } from "@/lib/challenges";

/**
 * GET /api/challenges/[id]
 * Returns challenge details with top 10 leaderboard and user's participation
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    const { id: challengeId } = await params;

    // Get challenge with participant count and creator info
    const challenge = await prisma.challenge.findUnique({
      where: { id: challengeId },
      include: {
        creator: {
          select: {
            id: true,
            name: true,
          },
        },
        _count: {
          select: {
            participants: true,
          },
        },
      },
    });

    if (!challenge) {
      return NextResponse.json(
        { error: "Challenge not found" },
        { status: 404 }
      );
    }

    // Get top 10 leaderboard
    const leaderboard = await prisma.challengeLeaderboard.findMany({
      where: { challengeId },
      include: {
        challenge: {
          select: {
            id: true,
            type: true,
            title: true,
          },
        },
      },
      orderBy: [{ rank: "asc" }, { score: "desc" }],
      take: 10,
    });

    // Enrich with user data
    const enrichedLeaderboard = await Promise.all(
      leaderboard.map(async (entry) => {
        const user = await prisma.user.findUnique({
          where: { id: entry.userId },
          select: {
            id: true,
            name: true,
            avatar: true,
          },
        });
        return { ...entry, user };
      })
    );

    // Get user's participation if logged in
    let userParticipation = null;
    let userLeaderboardEntry = null;

    if (session?.user?.id) {
      userParticipation = await getUserChallengeParticipation(
        session.user.id,
        challengeId
      );

      if (userParticipation) {
        userLeaderboardEntry = await prisma.challengeLeaderboard.findUnique({
          where: {
            challengeId_userId: {
              challengeId,
              userId: session.user.id,
            },
          },
        });
      }
    }

    return NextResponse.json({
      data: {
        challenge,
        leaderboard: enrichedLeaderboard,
        userParticipation,
        userLeaderboardEntry,
      },
    });
  } catch (error) {
    console.error("Error fetching challenge:", error);
    return NextResponse.json(
      { error: "Failed to fetch challenge" },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/challenges/[id]
 * Update a challenge (creator only, before start, no participants)
 */
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id: challengeId } = await params;
    const { challengeUpdateSchema } = await import("@/lib/validations");
    const { canEditChallenge } = await import("@/lib/challenges");

    // Check if user can edit
    const editCheck = await canEditChallenge(challengeId, session.user.id);
    if (!editCheck.canEdit) {
      return NextResponse.json(
        { error: editCheck.reason || "Cannot edit this challenge" },
        { status: 403 }
      );
    }

    // Validate request body
    const body = await request.json();
    const validatedData = challengeUpdateSchema.parse(body);

    // Build update data
    const updateData: any = {};
    if (validatedData.type) updateData.type = validatedData.type;
    if (validatedData.title) updateData.title = validatedData.title;
    if (validatedData.description !== undefined)
      updateData.description = validatedData.description;
    if (validatedData.startDate)
      updateData.startDate = new Date(validatedData.startDate);
    if (validatedData.endDate)
      updateData.endDate = new Date(validatedData.endDate);
    if (validatedData.targetValue)
      updateData.targetValue = validatedData.targetValue;

    // Update challenge
    const challenge = await prisma.challenge.update({
      where: { id: challengeId },
      data: updateData,
    });

    return NextResponse.json({ data: challenge });
  } catch (error) {
    console.error("Error updating challenge:", error);

    // Handle validation errors
    if (error instanceof Error && error.name === "ZodError") {
      return NextResponse.json(
        { error: "Validation failed", details: error },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Failed to update challenge" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/challenges/[id]
 * Delete a challenge (creator only, before start OR active with no participants)
 */
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id: challengeId } = await params;
    const { canDeleteChallenge } = await import("@/lib/challenges");

    // Check if user can delete
    const deleteCheck = await canDeleteChallenge(challengeId, session.user.id);
    if (!deleteCheck.canDelete) {
      return NextResponse.json(
        { error: deleteCheck.reason || "Cannot delete this challenge" },
        { status: 403 }
      );
    }

    // Delete challenge (cascade will handle participants and leaderboard)
    await prisma.challenge.delete({
      where: { id: challengeId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting challenge:", error);
    return NextResponse.json(
      { error: "Failed to delete challenge" },
      { status: 500 }
    );
  }
}
