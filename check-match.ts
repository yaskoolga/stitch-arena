import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkMatch() {
  const user = await prisma.user.findUnique({
    where: { username: 'olga' },
    select: { id: true, name: true, username: true }
  });
  
  console.log('User olga:', user);
  
  if (user) {
    const projects = await prisma.project.findMany({
      where: { userId: user.id },
      select: { id: true, title: true, slug: true }
    });
    
    console.log('\nProjects by this user:');
    projects.forEach(p => {
      console.log(`  ${p.title}: slug="${p.slug}"`);
    });
    
    // Now try the exact query from API
    const project = await prisma.project.findFirst({
      where: {
        userId: user.id,
        slug: 'drakosha-2'
      },
      select: { id: true, title: true }
    });
    
    console.log('\nDirect query result:', project);
  }
  
  await prisma.$disconnect();
}

checkMatch();
