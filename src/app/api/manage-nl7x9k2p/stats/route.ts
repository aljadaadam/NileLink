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
    prisma.voucher.findMany({
      where: { userId, status: "USED" },
      include: { package: { select: { price: true } } },
    }),
  ]);

  const revenue = revenueResult.reduce(
    (sum, v) => sum + Number(v.package.price),
    0
  );

  return NextResponse.json({
    totalRouters,
    onlineRouters,
    activeUsers,
    totalVouchers,
    usedVouchers,
    revenue,
  });
}
