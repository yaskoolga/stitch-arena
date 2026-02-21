// Temporary script to check users in database
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('\n📊 Users in database:');
  const users = await prisma.user.findMany({
    select: {
      id: true,
      email: true,
      name: true,
      createdAt: true,
      _count: {
        select: { projects: true }
      }
    }
  });

  users.forEach((user, idx) => {
    console.log(`\n${idx + 1}. ${user.name || 'No name'} (${user.email})`);
    console.log(`   ID: ${user.id}`);
    console.log(`   Projects: ${user._count.projects}`);
    console.log(`   Created: ${new Date(user.createdAt).toLocaleString()}`);
  });

  console.log('\n📁 Projects in database:');
  const projects = await prisma.project.findMany({
    select: {
      id: true,
      title: true,
      userId: true,
      user: {
        select: { email: true }
      }
    }
  });

  projects.forEach((project, idx) => {
    console.log(`\n${idx + 1}. ${project.title}`);
    console.log(`   Owner: ${project.user.email}`);
  });
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
