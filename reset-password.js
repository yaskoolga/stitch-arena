// Reset password for development
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function resetPassword() {
  const email = process.argv[2];
  const newPassword = process.argv[3];

  if (!email || !newPassword) {
    console.log('Usage: node reset-password.js <email> <new-password>');
    console.log('\nExample:');
    console.log('  node reset-password.js yasko.olga@gmail.com 123456');
    process.exit(1);
  }

  const user = await prisma.user.findUnique({ where: { email } });

  if (!user) {
    console.log(`❌ User not found: ${email}`);
    console.log('\n📊 Available users:');
    const users = await prisma.user.findMany({ select: { email: true } });
    users.forEach(u => console.log(`   - ${u.email}`));
    process.exit(1);
  }

  const hashedPassword = await bcrypt.hash(newPassword, 10);
  await prisma.user.update({
    where: { email },
    data: { password: hashedPassword }
  });

  console.log(`✅ Password updated for ${email}`);
  console.log(`   New password: ${newPassword}`);
  console.log('\nNow you can login with:');
  console.log(`   Email: ${email}`);
  console.log(`   Password: ${newPassword}`);
}

resetPassword()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
