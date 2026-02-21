import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import {
  checkChallengeCreationEligibility,
  countActiveUserChallenges,
} from "@/lib/challenges";

/**
 * GET /api/challenges/eligibility
 * Check if current user is eligible to create challenges
 */
export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const eligibility = await checkChallengeCreationEligibility(session.user.id);
    const activeCount = await countActiveUserChallenges(session.user.id);

    return NextResponse.json({
      data: {
        ...eligibility,
        activeCount,
        maxActive: 1,
        canCreate: eligibility.eligible && activeCount < 1,
      },
    });
  } catch (error) {
    console.error("Error checking eligibility:", error);
    return NextResponse.json(
      { error: "Failed to check eligibility" },
      { status: 500 }
    );
  }
}
