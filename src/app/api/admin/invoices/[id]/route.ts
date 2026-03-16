import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

async function getAdminId() {
  const session = await auth();
  if (!session?.user?.id) return null;
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { id: true, role: true },
  });
  return user?.role === "ADMIN" ? user.id : null;
}

// PATCH /api/admin/invoices/[id] — mark invoice as paid / cancelled
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const adminId = await getAdminId();
  if (!adminId) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;
  let body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
  const { action } = body;

  if (action !== "pay" && action !== "cancel") {
    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  }

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
      data: { status: "PAID", paidAt: now, confirmedById: adminId },
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

    // Log admin action
    await prisma.adminLog.create({
      data: {
        adminId,
        action: "CONFIRM_PAYMENT",
        targetId: id,
        details: JSON.stringify({
          invoiceNumber: invoice.invoiceNumber,
          amount: Number(invoice.amount),
          plan: invoice.plan,
          userId: invoice.user.id,
        }),
      },
    });

    return NextResponse.json({ success: true, status: "PAID" });
  }

  if (action === "cancel") {
    await prisma.invoice.update({
      where: { id },
      data: { status: "CANCELLED" },
    });

    await prisma.adminLog.create({
      data: {
        adminId,
        action: "CANCEL_INVOICE",
        targetId: id,
        details: JSON.stringify({
          invoiceNumber: invoice.invoiceNumber,
          amount: Number(invoice.amount),
          userId: invoice.user.id,
        }),
      },
    });

    return NextResponse.json({ success: true, status: "CANCELLED" });
  }
}
