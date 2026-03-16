const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
(async () => {
  const p = new PrismaClient();
  const h = await bcrypt.hash('aljadadm654', 12);
  const u = await p.user.update({
    where: { email: 'aljadadm654@gmail.com' },
    data: { hashedPassword: h },
    select: { id: true, name: true, email: true }
  });
  console.log('Done:', JSON.stringify(u));
  await p.$disconnect();
})();
