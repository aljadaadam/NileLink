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

  // Get all admins
  const admins = await prisma.user.findMany({
    where: { role: "ADMIN" },
    select: { id: true, name: true, email: true },
  });

  // Revenue overview
  const paidInvoices = await prisma.invoice.findMany({
    where: { status: "PAID" },
    select: {
      id: true,
      amount: true,
      paidAt: true,
      plan: true,
      confirmedById: true,
      invoiceNumber: true,
      user: { select: { name: true, email: true } },
    },
    orderBy: { paidAt: "desc" },
  });

  const totalRevenue = paidInvoices.reduce((s, i) => s + Number(i.amount), 0);
  const monthlyRevenue = paidInvoices
    .filter((i) => i.paidAt && i.paidAt >= startOfMonth)
    .reduce((s, i) => s + Number(i.amount), 0);

  // Revenue per admin (who confirmed the payment)
  const revenuePerAdmin = admins.map((admin) => {
    const confirmed = paidInvoices.filter((i) => i.confirmedById === admin.id);
    return {
      id: admin.id,
      name: admin.name,
      email: admin.email,
      totalConfirmed: confirmed.reduce((s, i) => s + Number(i.amount), 0),
      monthlyConfirmed: confirmed
        .filter((i) => i.paidAt && i.paidAt >= startOfMonth)
        .reduce((s, i) => s + Number(i.amount), 0),
      invoiceCount: confirmed.length,
    };
  });

  // Unattributed revenue (confirmed before tracking was added)
  const unattributed = paidInvoices.filter((i) => !i.confirmedById);
  const unattributedTotal = unattributed.reduce((s, i) => s + Number(i.amount), 0);

  // Monthly revenue breakdown (last 12 months)
  const monthlyBreakdown: { month: string; total: number; perAdmin: Record<string, number> }[] = [];
  for (let m = 11; m >= 0; m--) {
    const d = new Date(now.getFullYear(), now.getMonth() - m, 1);
    const monthEnd = new Date(d.getFullYear(), d.getMonth() + 1, 1);
    const label = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;

    const monthInvoices = paidInvoices.filter(
      (i) => i.paidAt && i.paidAt >= d && i.paidAt < monthEnd
    );

    const perAdmin: Record<string, number> = {};
    for (const admin of admins) {
      perAdmin[admin.id] = monthInvoices
        .filter((i) => i.confirmedById === admin.id)
        .reduce((s, i) => s + Number(i.amount), 0);
    }

    monthlyBreakdown.push({
      month: label,
      total: monthInvoices.reduce((s, i) => s + Number(i.amount), 0),
      perAdmin,
    });
  }

  // Recent admin activity logs
  const recentLogs = await prisma.adminLog.findMany({
    take: 50,
    orderBy: { createdAt: "desc" },
    include: {
      admin: { select: { name: true, email: true } },
    },
  });

  // Activity count per admin
  const activityPerAdmin = admins.map((admin) => {
    const logs = recentLogs.filter((l) => l.adminId === admin.id);
    return {
      id: admin.id,
      name: admin.name,
      confirmPayments: logs.filter((l) => l.action === "CONFIRM_PAYMENT").length,
      cancelInvoices: logs.filter((l) => l.action === "CANCEL_INVOICE").length,
      deleteUsers: logs.filter((l) => l.action === "DELETE_USER").length,
      toggleRoles: logs.filter((l) => l.action === "TOGGLE_ROLE").length,
      total: logs.length,
    };
  });

  // Recent payments (last 20)
  const recentPayments = paidInvoices.slice(0, 20).map((inv) => ({
    id: inv.id,
    invoiceNumber: inv.invoiceNumber,
    amount: Number(inv.amount),
    plan: inv.plan,
    paidAt: inv.paidAt,
    confirmedBy: admins.find((a) => a.id === inv.confirmedById)?.name || null,
    user: inv.user,
  }));

  return NextResponse.json({
    admins,
    totalRevenue,
    monthlyRevenue,
    sharePerPartner: totalRevenue / Math.max(admins.length, 1),
    monthlySharePerPartner: monthlyRevenue / Math.max(admins.length, 1),
    revenuePerAdmin,
    unattributedTotal,
    monthlyBreakdown,
    recentPayments,
    activityPerAdmin,
    recentLogs: recentLogs.map((l) => ({
      id: l.id,
      action: l.action,
      adminName: l.admin.name,
      adminEmail: l.admin.email,
      targetId: l.targetId,
      details: l.details ? JSON.parse(l.details) : null,
      createdAt: l.createdAt,
    })),
  });
}
