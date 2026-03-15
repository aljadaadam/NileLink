import { PrismaClient } from "@prisma/client";
import { hash } from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  // Create demo user
  const hashedPassword = await hash("demo123", 12);

  const user = await prisma.user.upsert({
    where: { email: "demo@nilelink.com" },
    update: {},
    create: {
      name: "Demo User",
      email: "demo@nilelink.com",
      hashedPassword,
      company: "NileLink Demo",
    },
  });

  // Create demo packages
  const pkg1h = await prisma.package.create({
    data: {
      name: "1 Hour",
      nameAr: "ساعة واحدة",
      duration: 60,
      downloadSpeed: 2048,
      uploadSpeed: 1024,
      price: 1.0,
      currency: "USD",
      userId: user.id,
    },
  });

  const pkg1d = await prisma.package.create({
    data: {
      name: "1 Day",
      nameAr: "يوم واحد",
      duration: 1440,
      downloadSpeed: 5120,
      uploadSpeed: 2048,
      price: 3.0,
      currency: "USD",
      userId: user.id,
    },
  });

  await prisma.package.create({
    data: {
      name: "1 Week",
      nameAr: "أسبوع واحد",
      duration: 10080,
      downloadSpeed: 10240,
      uploadSpeed: 5120,
      dataLimit: BigInt(5 * 1024 * 1024 * 1024), // 5 GB
      price: 10.0,
      currency: "USD",
      userId: user.id,
    },
  });

  console.log("Seed completed successfully!");
  console.log("Demo login: demo@nilelink.com / demo123");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
