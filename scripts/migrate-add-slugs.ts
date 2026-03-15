/**
 * Migration script to add slug fields to User, Project, and Challenge models
 * Run with: npx tsx scripts/migrate-add-slugs.ts
 */

import { PrismaClient } from '@prisma/client';
import { generateSlug, generateUsernameSlug, generateUniqueSlug, generateChallengeSlug } from '../src/lib/slug';

const prisma = new PrismaClient();

async function main() {
  console.log('🚀 Starting slug migration...\n');

  try {
    // 1. Add slug columns (if not exist)
    console.log('📝 Adding slug columns to database...');
    await prisma.$executeRawUnsafe(`
      ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "username" TEXT;
    `);
    await prisma.$executeRawUnsafe(`
      ALTER TABLE "Project" ADD COLUMN IF NOT EXISTS "slug" TEXT;
    `);
    await prisma.$executeRawUnsafe(`
      ALTER TABLE "Challenge" ADD COLUMN IF NOT EXISTS "slug" TEXT;
    `);
    console.log('✅ Columns added\n');

    // 2. Migrate Users
    console.log('👥 Migrating users...');
    const users = await prisma.user.findMany({
      where: { username: null },
      select: { id: true, name: true, email: true }
    });

    const existingUsernames: string[] = [];

    for (const user of users) {
      const baseSlug = generateUsernameSlug(user.name, user.email);
      const username = generateUniqueSlug(baseSlug, existingUsernames);
      existingUsernames.push(username);

      await prisma.user.update({
        where: { id: user.id },
        data: { username }
      });

      console.log(`  ✓ User ${user.id}: @${username}`);
    }
    console.log(`✅ Migrated ${users.length} users\n`);

    // 3. Migrate Projects
    console.log('📁 Migrating projects...');
    const projects = await prisma.project.findMany({
      where: { slug: null },
      select: { id: true, userId: true, title: true }
    });

    // Group by userId to ensure unique slugs per user
    const projectsByUser = projects.reduce((acc, project) => {
      if (!acc[project.userId]) acc[project.userId] = [];
      acc[project.userId].push(project);
      return acc;
    }, {} as Record<string, typeof projects>);

    let migratedProjects = 0;
    for (const [userId, userProjects] of Object.entries(projectsByUser)) {
      const existingSlugs: string[] = [];

      for (const project of userProjects) {
        const baseSlug = generateSlug(project.title);
        const slug = generateUniqueSlug(baseSlug, existingSlugs);
        existingSlugs.push(slug);

        await prisma.project.update({
          where: { id: project.id },
          data: { slug }
        });

        console.log(`  ✓ Project ${project.id}: /${slug}`);
        migratedProjects++;
      }
    }
    console.log(`✅ Migrated ${migratedProjects} projects\n`);

    // 4. Migrate Challenges
    console.log('🎯 Migrating challenges...');
    const challenges = await prisma.challenge.findMany({
      where: { slug: null },
      select: { id: true, title: true, startDate: true }
    });

    const existingChallengeSlugs: string[] = [];

    for (const challenge of challenges) {
      const baseSlug = generateChallengeSlug(challenge.title, challenge.startDate);
      const slug = generateUniqueSlug(baseSlug, existingChallengeSlugs);
      existingChallengeSlugs.push(slug);

      await prisma.challenge.update({
        where: { id: challenge.id },
        data: { slug }
      });

      console.log(`  ✓ Challenge ${challenge.id}: /${slug}`);
    }
    console.log(`✅ Migrated ${challenges.length} challenges\n`);

    // 5. Add unique constraints
    console.log('🔒 Adding unique constraints...');

    await prisma.$executeRawUnsafe(`
      CREATE UNIQUE INDEX IF NOT EXISTS "User_username_key" ON "User"("username");
    `);

    await prisma.$executeRawUnsafe(`
      CREATE UNIQUE INDEX IF NOT EXISTS "Project_userId_slug_key" ON "Project"("userId", "slug");
    `);

    await prisma.$executeRawUnsafe(`
      CREATE UNIQUE INDEX IF NOT EXISTS "Challenge_slug_key" ON "Challenge"("slug");
    `);

    console.log('✅ Constraints added\n');

    // 6. Make columns NOT NULL (after all data is migrated)
    console.log('⚠️  Making slug columns required...');
    await prisma.$executeRawUnsafe(`
      ALTER TABLE "User" ALTER COLUMN "username" SET NOT NULL;
    `);
    await prisma.$executeRawUnsafe(`
      ALTER TABLE "Project" ALTER COLUMN "slug" SET NOT NULL;
    `);
    await prisma.$executeRawUnsafe(`
      ALTER TABLE "Challenge" ALTER COLUMN "slug" SET NOT NULL;
    `);
    console.log('✅ Columns are now required\n');

    console.log('🎉 Migration completed successfully!');
  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
