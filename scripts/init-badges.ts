// Script to initialize badges in database
// Run with: npx tsx scripts/init-badges.ts

import { PrismaClient } from "@prisma/client";
import { initializeBadges } from "../src/lib/badges/manager";

const prisma = new PrismaClient();

async function main() {
  console.log("Initializing badges...");

  try {
    await initializeBadges();
    console.log("✅ Badges initialized successfully!");

    // Count badges
    const count = await prisma.badge.count();
    console.log(`📊 Total badges in database: ${count}`);

    // Show breakdown by category
    const categories = await prisma.badge.groupBy({
      by: ["category"],
      _count: true,
    });

    console.log("\n📋 Badges by category:");
    for (const cat of categories) {
      console.log(`  ${cat.category}: ${cat._count}`);
    }

    // Show breakdown by rarity
    const rarities = await prisma.badge.groupBy({
      by: ["rarity"],
      _count: true,
    });

    console.log("\n✨ Badges by rarity:");
    for (const rar of rarities) {
      console.log(`  ${rar.rarity}: ${rar._count}`);
    }
  } catch (error) {
    console.error("❌ Failed to initialize badges:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
