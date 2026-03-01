import { prisma } from "@/lib/prisma";
import { ALL_BADGES } from "./config";

/**
 * Initialize all badge definitions in database
 * Call this once on app startup or via migration
 */
export async function initializeBadges(): Promise<void> {
  for (const badge of ALL_BADGES) {
    await prisma.badge.upsert({
      where: { key: badge.key },
      update: {
        name: badge.name,
        description: badge.description,
        icon: badge.icon,
        rarity: badge.rarity,
        category: badge.category,
        criteria: badge.criteria,
      },
      create: {
        key: badge.key,
        name: badge.name,
        description: badge.description,
        icon: badge.icon,
        rarity: badge.rarity,
        category: badge.category,
        criteria: badge.criteria,
      },
    });
  }
}

/**
 * Award a badge to a user
 */
export async function awardBadge(
  userId: string,
  badgeKey: string
): Promise<boolean> {
  // Check if badge exists
  const badge = await prisma.badge.findUnique({
    where: { key: badgeKey },
  });

  if (!badge) {
    console.error(`Badge ${badgeKey} not found`);
    return false;
  }

  // Check if user already has badge
  const existing = await prisma.userBadge.findUnique({
    where: {
      userId_badgeKey: { userId, badgeKey },
    },
  });

  if (existing) {
    return false; // Already has badge
  }

  // Award badge
  await prisma.userBadge.create({
    data: {
      userId,
      badgeKey,
    },
  });

  // Create notification
  await prisma.notification.create({
    data: {
      userId,
      type: "achievement",
      content: `You earned the "${badge.name}" badge!`,
      resourceId: badgeKey,
    },
  });

  return true;
}

/**
 * Remove a badge from a user (admin only)
 */
export async function revokeBadge(
  userId: string,
  badgeKey: string
): Promise<boolean> {
  const result = await prisma.userBadge.deleteMany({
    where: {
      userId,
      badgeKey,
    },
  });

  return result.count > 0;
}

/**
 * Get all badges for a user
 */
export async function getUserBadges(userId: string) {
  return await prisma.userBadge.findMany({
    where: { userId },
    include: {
      badge: true,
    },
    orderBy: [
      { isFeatured: "desc" },
      { earnedAt: "desc" },
    ],
  });
}

/**
 * Get featured badges for a user (displayed on profile)
 */
export async function getFeaturedBadges(userId: string) {
  return await prisma.userBadge.findMany({
    where: {
      userId,
      isFeatured: true,
    },
    include: {
      badge: true,
    },
    orderBy: { earnedAt: "desc" },
    take: 5,
  });
}

/**
 * Update featured badges for a user
 */
export async function updateFeaturedBadges(
  userId: string,
  badgeKeys: string[]
): Promise<void> {
  // Maximum 5 featured badges
  const limitedKeys = badgeKeys.slice(0, 5);

  // Unfeatured all current badges
  await prisma.userBadge.updateMany({
    where: { userId },
    data: { isFeatured: false },
  });

  // Feature selected badges
  if (limitedKeys.length > 0) {
    await prisma.userBadge.updateMany({
      where: {
        userId,
        badgeKey: { in: limitedKeys },
      },
      data: { isFeatured: true },
    });
  }
}

/**
 * Get badge statistics for a user
 */
export async function getUserBadgeStats(userId: string) {
  const badges = await getUserBadges(userId);

  const byRarity = {
    common: badges.filter((b) => b.badge.rarity === "common").length,
    rare: badges.filter((b) => b.badge.rarity === "rare").length,
    epic: badges.filter((b) => b.badge.rarity === "epic").length,
    legendary: badges.filter((b) => b.badge.rarity === "legendary").length,
  };

  const byCategory = {
    achievement: badges.filter((b) => b.badge.category === "achievement").length,
    event: badges.filter((b) => b.badge.category === "event").length,
    special: badges.filter((b) => b.badge.category === "special").length,
    challenge: badges.filter((b) => b.badge.category === "challenge").length,
  };

  return {
    total: badges.length,
    byRarity,
    byCategory,
  };
}

/**
 * Check for event badge eligibility
 * Call this when user completes an event challenge or reaches event milestone
 */
export async function checkEventBadgeEligibility(
  userId: string,
  eventId: string
): Promise<void> {
  // Get event details
  const event = await prisma.event.findUnique({
    where: { id: eventId },
    select: { rewardBadge: true },
  });

  if (!event?.rewardBadge) return;

  // Check if user participated in event
  const participation = await prisma.eventParticipant.findUnique({
    where: {
      eventId_userId: { eventId, userId },
    },
  });

  if (participation) {
    await awardBadge(userId, event.rewardBadge);
  }
}

/**
 * Award challenge winner badge based on challenge type
 */
export async function awardChallengeWinnerBadge(
  userId: string,
  challengeType: string
): Promise<void> {
  const badgeMap: Record<string, string> = {
    speed: "speed_champion",
    streak: "streak_master",
    completion: "completion_king",
  };

  const badgeKey = badgeMap[challengeType];
  if (badgeKey) {
    await awardBadge(userId, badgeKey);
  }
}
