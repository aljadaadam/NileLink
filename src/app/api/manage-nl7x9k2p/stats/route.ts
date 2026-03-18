import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = session.user.id;

  const [
    totalRouters,
    onlineRouters,
    activeUsers,
    totalVouchers,
    usedVouchers,
    revenueResult,
    peakHoursResult,
    dailyUsageResult,
    unusedVouchers,
  ] = await Promise.all([
    prisma.router.count({ where: { userId } }),
    prisma.router.count({ where: { userId, status: "ONLINE" } }),
    prisma.hotspotUser.count({ where: { userId, isActive: true } }),
    prisma.voucher.count({ where: { userId } }),
    prisma.voucher.count({ where: { userId, status: "USED" } }),
    prisma.$queryRaw<{ currency: string; revenue: number }[]>`
      SELECT p.currency, COALESCE(SUM(p.price::numeric), 0)::float as revenue
      FROM vouchers v
      JOIN packages p ON v."packageId" = p.id
      WHERE v."userId" = ${userId} AND v.status::text = 'USED'
      GROUP BY p.currency
    `,
    // Peak hours: which hours have most session starts (last 30 days)
    prisma.$queryRaw<{ hour: number; count: bigint }[]>`
      SELECT EXTRACT(HOUR FROM hs."startedAt")::int as hour, COUNT(*)::bigint as count
      FROM hotspot_sessions hs
      JOIN routers r ON hs."routerId" = r.id
      WHERE r."userId" = ${userId}
        AND hs."startedAt" > NOW() - INTERVAL '30 days'
      GROUP BY hour
      ORDER BY hour
    `,
    // Daily voucher usage last 14 days
    prisma.$queryRaw<{ day: string; count: bigint }[]>`
      SELECT TO_CHAR(v."usedAt", 'YYYY-MM-DD') as day, COUNT(*)::bigint as count
      FROM vouchers v
      WHERE v."userId" = ${userId}
        AND v.status::text = 'USED'
        AND v."usedAt" > NOW() - INTERVAL '14 days'
      GROUP BY day
      ORDER BY day
    `,
    prisma.voucher.count({ where: { userId, status: "UNUSED" } }),
  ]);

  const revenueByCurrency = revenueResult.map(r => ({ currency: r.currency, amount: r.revenue }));

  // Peak hours: fill 0-23 with counts
  const peakHours = Array.from({ length: 24 }, (_, i) => {
    const found = peakHoursResult.find(r => r.hour === i);
    return { hour: i, sessions: found ? Number(found.count) : 0 };
  });

  // Daily usage: fill last 14 days
  const dailyUsage = dailyUsageResult.map(r => ({
    day: r.day,
    count: Number(r.count),
  }));

  // Voucher burn rate prediction
  const totalUsedLast14 = dailyUsage.reduce((sum, d) => sum + d.count, 0);
  const avgPerDay = dailyUsage.length > 0 ? totalUsedLast14 / 14 : 0;
  const daysUntilEmpty = avgPerDay > 0 ? Math.ceil(unusedVouchers / avgPerDay) : null;

  return NextResponse.json({
    totalRouters,
    onlineRouters,
    activeUsers,
    totalVouchers,
    usedVouchers,
    revenueByCurrency,
    peakHours,
    dailyUsage,
    unusedVouchers,
    avgVouchersPerDay: Math.round(avgPerDay * 10) / 10,
    daysUntilEmpty,
  });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
