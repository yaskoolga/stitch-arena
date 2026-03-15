import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkSlugs() {
  const users = await prisma.user.findMany({
    select: { id: true, name: true, username: true }
  });
  
  console.log('Users:');
  users.forEach(u => {
    console.log(`  ${u.name}: username="${u.username}"`);
  });
  
  const projects = await prisma.project.findMany({
    select: { id: true, title: true, slug: true, userId: true },
    take: 5
  });
  
  console.log('\nProjects:');
  projects.forEach(p => {
    console.log(`  ${p.title}: slug="${p.slug}", userId="${p.userId}"`);
  });
  
  await prisma.$disconnect();
}

checkSlugs();
