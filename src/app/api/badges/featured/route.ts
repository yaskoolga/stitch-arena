import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { updateFeaturedBadges } from "@/lib/badges/manager";

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { badgeKeys } = body;

    if (!Array.isArray(badgeKeys)) {
      return NextResponse.json(
        { error: "badgeKeys must be an array" },
        { status: 400 }
      );
    }

    if (badgeKeys.length > 5) {
      return NextResponse.json(
        { error: "Maximum 5 featured badges allowed" },
        { status: 400 }
      );
    }

    await updateFeaturedBadges(session.user.id, badgeKeys);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to update featured badges:", error);
    return NextResponse.json(
      { error: "Failed to update featured badges" },
      { status: 500 }
    );
  }
}
