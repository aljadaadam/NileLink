const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

(async () => {
  const prisma = new PrismaClient();
  const hash = await bcrypt.hash('hemmamax2013', 12);
  const user = await prisma.user.upsert({
    where: { email: 'hemmamax2013@gmail.com' },
    update: { role: 'ADMIN', hashedPassword: hash, emailVerified: true },
    create: {
      name: 'Hemma',
      email: 'hemmamax2013@gmail.com',
      hashedPassword: hash,
      role: 'ADMIN',
      emailVerified: true,
    },
    select: { id: true, name: true, email: true, role: true }
  });
  console.log('Done:', JSON.stringify(user));
  await prisma.$disconnect();
})();
