import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  const { userId } = await params;
  const { searchParams } = new URL(request.url);
  const featuredOnly = searchParams.get("featured") === "true";

  try {
    const where: any = { userId };
    if (featuredOnly) {
      where.isFeatured = true;
    }

    const userBadges = await prisma.userBadge.findMany({
      where,
      include: {
        badge: true,
      },
      orderBy: [
        { isFeatured: "desc" },
        { earnedAt: "desc" },
      ],
    });

    const badges = userBadges.map((ub) => ({
      key: ub.badge.key,
      name: ub.badge.name,
      description: ub.badge.description,
      icon: ub.badge.icon,
      rarity: ub.badge.rarity,
      category: ub.badge.category,
      earnedAt: ub.earnedAt,
      isFeatured: ub.isFeatured,
    }));

    return NextResponse.json({ badges });
  } catch (error) {
    console.error("Failed to fetch user badges:", error);
    return NextResponse.json(
      { error: "Failed to fetch user badges" },
      { status: 500 }
    );
  }
}
