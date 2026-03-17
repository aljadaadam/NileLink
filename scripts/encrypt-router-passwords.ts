// Run: npx tsx scripts/encrypt-router-passwords.ts
// Encrypts all existing plaintext router passwords
import { PrismaClient } from "@prisma/client";
import { encrypt, isEncrypted } from "../src/lib/encryption";

async function main() {
  const prisma = new PrismaClient();

  try {
    const routers = await prisma.router.findMany({
      select: { id: true, name: true, password: true },
    });

    let encrypted = 0;
    let skipped = 0;

    for (const router of routers) {
      if (isEncrypted(router.password)) {
        skipped++;
        console.log(`  SKIP: "${router.name}" (already encrypted)`);
        continue;
      }

      await prisma.router.update({
        where: { id: router.id },
        data: { password: encrypt(router.password) },
      });

      encrypted++;
      console.log(`  OK: "${router.name}" encrypted`);
    }

    console.log(`\nDone: ${encrypted} encrypted, ${skipped} skipped`);
  } finally {
    await prisma.$disconnect();
  }
}

main().catch(console.error);
