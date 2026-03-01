import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { updateUserStats } from "@/lib/achievements/engine";

// Update current user's cached stats
export async function POST() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await updateUserStats(session.user.id);
    return NextResponse.json({ success: true, message: "Stats updated" });
  } catch (error) {
    console.error("Failed to update user stats:", error);
    return NextResponse.json(
      { error: "Failed to update user stats" },
      { status: 500 }
    );
  }
}
