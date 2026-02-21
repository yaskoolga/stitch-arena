const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkImages() {
  const projects = await prisma.project.findMany({
    select: {
      id: true,
      title: true,
      coverImage: true,
      schemaImage: true,
      user: {
        select: { email: true }
      }
    }
  });

  console.log('\n📁 Projects and their images:');
  projects.forEach((p, idx) => {
    console.log(`\n${idx + 1}. ${p.title} (${p.user.email})`);
    console.log(`   Cover: ${p.coverImage || '❌ No cover image'}`);
    console.log(`   Schema: ${p.schemaImage || '❌ No schema image'}`);
  });
}

checkImages()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
