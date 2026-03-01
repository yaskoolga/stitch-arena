// Script to update all user stats and leaderboards
// Run with: npx tsx scripts/update-leaderboards.ts

import { PrismaClient } from "@prisma/client";
import { updateUserStats } from "../src/lib/achievements/engine";
import { updateAllLeaderboards } from "../src/lib/leaderboards/calculator";

const prisma = new PrismaClient();

async function main() {
  console.log("🔄 Updating user statistics...");

  // Get all users
  const users = await prisma.user.findMany({
    select: { id: true, email: true, name: true },
  });

  console.log(`📊 Found ${users.length} users`);

  // Update stats for each user
  let updated = 0;
  for (const user of users) {
    try {
      await updateUserStats(user.id);
      updated++;
      console.log(`  ✅ Updated stats for ${user.name || user.email}`);
    } catch (error) {
      console.error(`  ❌ Failed to update ${user.name || user.email}:`, error);
    }
  }

  console.log(`\n✅ Updated stats for ${updated}/${users.length} users`);

  console.log("\n🏆 Updating leaderboards...");

  try {
    await updateAllLeaderboards();
    console.log("✅ All leaderboards updated!");

    // Show leaderboard stats
    const leaderboardCounts = await prisma.leaderboard.groupBy({
      by: ["type"],
      _count: true,
    });

    console.log("\n📋 Leaderboard entries:");
    for (const lb of leaderboardCounts) {
      console.log(`  ${lb.type}: ${lb._count} entries`);
    }
  } catch (error) {
    console.error("❌ Failed to update leaderboards:", error);
    process.exit(1);
  }

  console.log("\n🎉 Done!");
}

main()
  .catch((error) => {
    console.error("Fatal error:", error);
    process.exit(1);
  })
  .finally(() => {
    prisma.$disconnect();
  });
