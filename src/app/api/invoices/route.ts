import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET /api/invoices — get user's invoices
export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const invoices = await prisma.invoice.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(
    invoices.map((inv) => ({
      id: inv.id,
      invoiceNumber: inv.invoiceNumber,
      plan: inv.plan,
      amount: Number(inv.amount),
      currency: inv.currency,
      status: inv.status,
      dueDate: inv.dueDate,
      paidAt: inv.paidAt,
      periodStart: inv.periodStart,
      periodEnd: inv.periodEnd,
      createdAt: inv.createdAt,
    }))
  );
}
