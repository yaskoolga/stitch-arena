import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { joinChallenge, leaveChallenge, getUserChallengeParticipation } from "@/lib/challenges";

/**
 * POST /api/challenges/[id]/join
 * Join or leave a challenge
 * Body: { action: "join" | "leave" }
 */
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id: challengeId } = await params;
    const body = await request.json();
    const { action } = body;

    if (!action || !["join", "leave"].includes(action)) {
      return NextResponse.json(
        { error: "Invalid action. Must be 'join' or 'leave'" },
        { status: 400 }
      );
    }

    // Check if challenge exists and is active
    const { prisma } = await import("@/lib/prisma");
    const challenge = await prisma.challenge.findUnique({
      where: { id: challengeId },
    });

    if (!challenge) {
      return NextResponse.json(
        { error: "Challenge not found" },
        { status: 404 }
      );
    }

    if (!challenge.isActive) {
      return NextResponse.json(
        { error: "Challenge is not active" },
        { status: 400 }
      );
    }

    // Check if user is already participating
    const existingParticipation = await getUserChallengeParticipation(
      session.user.id,
      challengeId
    );

    if (action === "join") {
      if (existingParticipation) {
        return NextResponse.json(
          { error: "Already participating in this challenge" },
          { status: 400 }
        );
      }

      const participation = await joinChallenge(session.user.id, challengeId);

      return NextResponse.json({
        data: participation,
        message: "Successfully joined challenge",
      });
    } else {
      // leave
      if (!existingParticipation) {
        return NextResponse.json(
          { error: "Not participating in this challenge" },
          { status: 400 }
        );
      }

      await leaveChallenge(session.user.id, challengeId);

      return NextResponse.json({
        message: "Successfully left challenge",
      });
    }
  } catch (error) {
    console.error("Error joining/leaving challenge:", error);
    return NextResponse.json(
      { error: "Failed to process request" },
      { status: 500 }
    );
  }
}
