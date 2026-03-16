import { NextRequest, NextResponse } from "next/server";
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

// PATCH /api/admin/invoices/[id] — mark invoice as paid / cancelled
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;
  const { action } = await req.json();

  const invoice = await prisma.invoice.findUnique({
    where: { id },
    include: { user: { select: { id: true, plan: true } } },
  });

  if (!invoice) {
    return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
  }

  if (action === "pay") {
    if (invoice.status === "PAID") {
      return NextResponse.json({ error: "Already paid" }, { status: 400 });
    }

    const now = new Date();
    const periodEnd = new Date(now);
    periodEnd.setMonth(periodEnd.getMonth() + 1);

    // Mark invoice as paid
    await prisma.invoice.update({
      where: { id },
      data: { status: "PAID", paidAt: now },
    });

    // Activate subscription
    if (invoice.subscriptionId) {
      await prisma.subscription.update({
        where: { id: invoice.subscriptionId },
        data: {
          status: "ACTIVE",
          currentPeriodStart: now,
          currentPeriodEnd: periodEnd,
        },
      });
    } else {
      // Create a new subscription if none linked
      await prisma.subscription.create({
        data: {
          userId: invoice.user.id,
          plan: invoice.plan,
          status: "ACTIVE",
          currentPeriodStart: now,
          currentPeriodEnd: periodEnd,
        },
      });
    }

    return NextResponse.json({ success: true, status: "PAID" });
  }

  if (action === "cancel") {
    await prisma.invoice.update({
      where: { id },
      data: { status: "CANCELLED" },
    });
    return NextResponse.json({ success: true, status: "CANCELLED" });
  }

  return NextResponse.json({ error: "Invalid action" }, { status: 400 });
}
