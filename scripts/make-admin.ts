import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const adminEmail = process.env.ADMIN_EMAIL || "admin@stitcharena.com";

  // Find or create admin user
  let admin = await prisma.user.findUnique({
    where: { email: adminEmail },
  });

  if (!admin) {
    console.log(`Creating new admin user: ${adminEmail}`);
    admin = await prisma.user.create({
      data: {
        email: adminEmail,
        name: "Admin",
        role: "admin",
      },
    });
  } else {
    console.log(`Updating existing user to admin: ${adminEmail}`);
    admin = await prisma.user.update({
      where: { email: adminEmail },
      data: { role: "admin" },
    });
  }

  console.log("✅ Admin user created/updated successfully!");
  console.log(`Email: ${admin.email}`);
  console.log(`Role: ${admin.role}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
