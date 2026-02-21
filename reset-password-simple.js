const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function resetPassword() {
  const email = "yasko.olga@gmail.com"; // Измените на нужный email
  const newPassword = "123456"; // Новый пароль

  try {
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    const user = await prisma.user.update({
      where: { email },
      data: { password: hashedPassword },
    });

    console.log(`✅ Password reset successful!`);
    console.log(`📧 Email: ${email}`);
    console.log(`🔑 New password: ${newPassword}`);
    console.log(`\nNow you can login at: http://localhost:3000/login`);
  } catch (error) {
    console.error("❌ Error:", error.message);
  } finally {
    await prisma.$disconnect();
  }
}

resetPassword();
