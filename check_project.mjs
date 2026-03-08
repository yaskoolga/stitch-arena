import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

const project = await prisma.project.findFirst({
  where: { title: { contains: 'омик' } },
  select: { id: true, title: true, isPublic: true, userId: true }
})

console.log(JSON.stringify(project, null, 2))
await prisma.$disconnect()
