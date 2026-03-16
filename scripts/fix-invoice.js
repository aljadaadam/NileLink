const { PrismaClient } = require("@prisma/client");
const p = new PrismaClient();

async function main() {
  const user = await p.user.findUnique({
    where: { email: "aljadadm654@gmail.com" },
    select: { id: true, plan: true, trialEndsAt: true },
  });
  console.log("User:", JSON.stringify(user));

  const sub = await p.subscription.findFirst({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
  });
  console.log("Sub:", JSON.stringify(sub));

  const existingInv = await p.invoice.count({ where: { userId: user.id } });
  console.log("Existing invoices:", existingInv);

  if (existingInv === 0 && sub) {
    const now = new Date();
    const periodEnd = new Date(now);
    periodEnd.setMonth(periodEnd.getMonth() + 1);

    const priceMap = { STARTER: 9, PRO: 29, ENTERPRISE: 79 };
    const price = priceMap[user.plan] || 9;

    const rand = Math.random().toString(36).substring(2, 8).toUpperCase();
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, "0");

    const invoice = await p.invoice.create({
      data: {
        invoiceNumber: `NL-${y}${m}-${rand}`,
        userId: user.id,
        subscriptionId: sub.id,
        plan: user.plan,
        amount: price,
        currency: "USD",
        status: "PENDING",
        dueDate: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000),
        periodStart: now,
        periodEnd: periodEnd,
      },
    });
    console.log("Invoice created:", invoice.invoiceNumber);

    // Update subscription status to EXPIRED (already expired)
    await p.subscription.update({
      where: { id: sub.id },
      data: { status: "EXPIRED" },
    });
    console.log("Done!");
  } else {
    console.log("Invoice already exists or no subscription found");
  }

  await p.$disconnect();
}

main().catch(console.error);
