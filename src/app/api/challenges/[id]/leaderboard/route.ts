import { NextResponse } from "next/server";
import { getChallengeLeaderboard } from "@/lib/challenges";

/**
 * GET /api/challenges/[id]/leaderboard
 * Returns full leaderboard with pagination
 * Query params:
 * - limit: number of entries (default 100, max 500)
 * - offset: skip entries (default 0)
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { searchParams } = new URL(request.url);
    const { id: challengeId } = await params;

    // Parse pagination params
    const limit = Math.min(
      parseInt(searchParams.get("limit") || "100"),
      500
    );
    const offset = parseInt(searchParams.get("offset") || "0");

    const result = await getChallengeLeaderboard(challengeId, limit, offset);

    return NextResponse.json({
      data: result.entries,
      total: result.total,
      limit,
      offset,
    });
  } catch (error) {
    console.error("Error fetching leaderboard:", error);
    return NextResponse.json(
      { error: "Failed to fetch leaderboard" },
      { status: 500 }
    );
  }
}
