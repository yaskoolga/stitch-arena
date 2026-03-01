import { getUserLevel, type Level } from "./levels";
import { prisma } from "./prisma";

/**
 * Check if user leveled up after adding stitches
 * Returns new level if leveled up, null otherwise
 */
export async function checkLevelUp(
  userId: string,
  previousStitches: number,
  newStitches: number
): Promise<Level | null> {
  const previousLevel = getUserLevel(previousStitches);
  const newLevel = getUserLevel(newStitches);

  if (newLevel.level > previousLevel.level) {
    return newLevel;
  }

  return null;
}

/**
 * Get user's total stitches from database
 */
export async function getUserTotalStitches(userId: string): Promise<number> {
  const result = await prisma.dailyLog.aggregate({
    where: {
      project: {
        userId,
      },
    },
    _sum: {
      dailyStitches: true,
    },
  });

  return result._sum.dailyStitches ?? 0;
}
