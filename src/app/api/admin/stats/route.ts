import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

async function isAdmin() {
  const session = await auth();
  if (!session?.user?.id) return false;
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { role: true },
  });
  return user?.role === "ADMIN";
}

export async function GET() {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const [
    totalUsers,
    newUsersThisMonth,
    totalRouters,
    onlineRouters,
    paidInvoices,
    pendingInvoices,
    activeSubscriptions,
    trialSubscriptions,
    expiredSubscriptions,
    recentUsers,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { createdAt: { gte: startOfMonth } } }),
    prisma.router.count(),
    prisma.router.count({ where: { status: "ONLINE" } }),
    prisma.invoice.findMany({
      where: { status: "PAID" },
      select: { amount: true, confirmedById: true },
    }),
    prisma.invoice.count({ where: { status: { in: ["PENDING", "OVERDUE"] } } }),
    prisma.subscription.count({ where: { status: "ACTIVE" } }),
    prisma.subscription.count({ where: { status: "TRIAL" } }),
    prisma.subscription.count({ where: { status: { in: ["EXPIRED", "PAST_DUE", "CANCELLED"] } } }),
    prisma.user.findMany({
      take: 10,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        email: true,
        company: true,
        plan: true,
        createdAt: true,
        _count: { select: { routers: true } },
      },
    }),
  ]);

  const totalRevenue = paidInvoices.reduce(
    (sum, inv) => sum + Number(inv.amount),
    0
  );

  // Per-admin payment stats
  const admins = await prisma.user.findMany({
    where: { role: "ADMIN" },
    select: { id: true, name: true, email: true },
  });

  const adminPaymentStats = admins.map((admin) => {
    const confirmed = paidInvoices.filter((i) => i.confirmedById === admin.id);
    return {
      id: admin.id,
      name: admin.name,
      email: admin.email,
      invoiceCount: confirmed.length,
      totalAmount: confirmed.reduce((s, i) => s + Number(i.amount), 0),
    };
  });

  return NextResponse.json({
    totalUsers,
    newUsersThisMonth,
    totalRouters,
    onlineRouters,
    totalRevenue,
    pendingInvoices,
    activeSubscriptions,
    trialSubscriptions,
    expiredSubscriptions,
    recentUsers,
    adminPaymentStats,
  });
}
