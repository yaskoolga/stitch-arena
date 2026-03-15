import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function testFullQuery() {
  const user = await prisma.user.findUnique({
    where: { username: 'olga' }
  });
  
  if (!user) {
    console.log('User not found');
    return;
  }
  
  try {
    const project = await prisma.project.findFirst({
      where: {
        userId: user.id,
        slug: 'drakosha-2'
      },
      include: {
        logs: {
          orderBy: { date: 'desc' }
        },
        user: {
          select: {
            id: true,
            name: true,
            avatar: true,
            username: true
          }
        }
      }
    });
    
    if (!project) {
      console.log('Project not found');
      return;
    }
    
    console.log('Project found:', project.title);
    console.log('Logs count:', project.logs.length);
    console.log('First log:', project.logs[0]);
    
    // Try the calculation
    const completedStitches = project.logs.reduce(
      (total, log) => total + (log.dailyStitches || 0),
      project.initialStitches
    );
    
    console.log('Completed stitches:', completedStitches);
    
  } catch (error) {
    console.error('Error:', error);
  }
  
  await prisma.$disconnect();
}

testFullQuery();
