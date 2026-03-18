import { prisma } from "@/lib/prisma";

/**
 * Gathers a concise summary of the current user's data
 * for injection into the AI assistant's system prompt.
 */
export async function getUserContext(userId: string): Promise<string> {
  const [
    user,
    totalRouters,
    onlineRouters,
    activeHotspotUsers,
    totalVouchers,
    unusedVouchers,
    usedVouchersToday,
    todayRevenue,
    packages,
  ] = await Promise.all([
    prisma.user.findUnique({
      where: { id: userId },
      select: { name: true, plan: true, trialEndsAt: true },
    }),
    prisma.router.count({ where: { userId } }),
    prisma.router.count({ where: { userId, status: "ONLINE" } }),
    prisma.hotspotUser.count({ where: { userId, isActive: true } }),
    prisma.voucher.count({ where: { userId } }),
    prisma.voucher.count({ where: { userId, status: "UNUSED" } }),
    prisma.voucher.count({
      where: {
        userId,
        status: "USED",
        usedAt: { gte: new Date(new Date().setHours(0, 0, 0, 0)) },
      },
    }),
    prisma.$queryRaw<{ currency: string; revenue: number }[]>`
      SELECT p.currency, COALESCE(SUM(p.price::numeric), 0)::float as revenue
      FROM vouchers v
      JOIN packages p ON v."packageId" = p.id
      WHERE v."userId" = ${userId}
        AND v.status::text = 'USED'
        AND v."usedAt" >= CURRENT_DATE
      GROUP BY p.currency
    `,
    prisma.package.findMany({
      where: { userId },
      select: { id: true, name: true, price: true, currency: true },
      take: 20,
    }),
  ]);

  const revenueStr =
    todayRevenue.length > 0
      ? todayRevenue.map((r) => `${r.revenue} ${r.currency}`).join(", ")
      : "0";

  const packageList =
    packages.length > 0
      ? packages.map((p) => `- ${p.name} (${p.price} ${p.currency}, ID: ${p.id})`).join("\n")
      : "No packages created yet.";

  return `
=== User Dashboard Summary ===
Name: ${user?.name || "Unknown"}
Plan: ${user?.plan || "STARTER"}
Trial Ends: ${user?.trialEndsAt ? user.trialEndsAt.toISOString().split("T")[0] : "N/A"}

Routers: ${onlineRouters} online / ${totalRouters} total
Active Hotspot Users: ${activeHotspotUsers}
Vouchers: ${unusedVouchers} unused / ${totalVouchers} total
Used Today: ${usedVouchersToday}
Revenue Today: ${revenueStr}

Available Packages:
${packageList}
`.trim();
}
