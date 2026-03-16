import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
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
  ]);

  const revenueByCurrency = revenueResult.map(r => ({ currency: r.currency, amount: r.revenue }));

  return NextResponse.json({
    totalRouters,
    onlineRouters,
    activeUsers,
    totalVouchers,
    usedVouchers,
    revenueByCurrency,
  });
}
