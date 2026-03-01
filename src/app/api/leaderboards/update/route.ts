import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { updateAllLeaderboards } from "@/lib/leaderboards/calculator";

// Manual endpoint to update leaderboards (for testing)
// In production, this should be called by a cron job
export async function POST() {
  const session = await getServerSession(authOptions);

  // Only allow admins to manually trigger updates
  if (!session?.user?.email || session.user.email !== process.env.ADMIN_EMAIL) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await updateAllLeaderboards();
    return NextResponse.json({ success: true, message: "Leaderboards updated" });
  } catch (error) {
    console.error("Failed to update leaderboards:", error);
    return NextResponse.json(
      { error: "Failed to update leaderboards" },
      { status: 500 }
    );
  }
}
