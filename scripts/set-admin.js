const { PrismaClient } = require("@prisma/client");
const p = new PrismaClient();
p.user.updateMany({
  where: { email: { in: ["aljadadm654@gmail.com"] } },
  data: { role: "ADMIN" },
})
  .then((r) => console.log("Updated:", r.count, "user(s) to ADMIN"))
  .finally(() => p.$disconnect());
