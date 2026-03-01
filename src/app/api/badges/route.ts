import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ALL_BADGES } from "@/lib/badges/config";

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Get user's earned badges
    const userBadges = await prisma.userBadge.findMany({
      where: { userId: session.user.id },
      include: {
        badge: true,
      },
    });

    // Create a map of earned badges
    const earnedMap = new Map(
      userBadges.map((ub) => [
        ub.badgeKey,
        {
          earnedAt: ub.earnedAt,
          isFeatured: ub.isFeatured,
        },
      ])
    );

    // Combine with all badge definitions
    const badges = ALL_BADGES.map((badgeDef) => {
      const earned = earnedMap.get(badgeDef.key);
      return {
        key: badgeDef.key,
        name: badgeDef.name,
        description: badgeDef.description,
        icon: badgeDef.icon,
        rarity: badgeDef.rarity,
        category: badgeDef.category,
        earnedAt: earned?.earnedAt || null,
        isFeatured: earned?.isFeatured || false,
      };
    });

    // Calculate stats
    const stats = {
      total: userBadges.length,
      byRarity: {
        common: userBadges.filter((b) => b.badge.rarity === "common").length,
        rare: userBadges.filter((b) => b.badge.rarity === "rare").length,
        epic: userBadges.filter((b) => b.badge.rarity === "epic").length,
        legendary: userBadges.filter((b) => b.badge.rarity === "legendary").length,
      },
      byCategory: {
        achievement: userBadges.filter((b) => b.badge.category === "achievement")
          .length,
        event: userBadges.filter((b) => b.badge.category === "event").length,
        special: userBadges.filter((b) => b.badge.category === "special").length,
        challenge: userBadges.filter((b) => b.badge.category === "challenge").length,
      },
    };

    return NextResponse.json({ badges, stats });
  } catch (error) {
    console.error("Failed to fetch badges:", error);
    return NextResponse.json(
      { error: "Failed to fetch badges" },
      { status: 500 }
    );
  }
}
