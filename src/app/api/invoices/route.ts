import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET /api/invoices — get user's invoices
export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const invoices = await prisma.invoice.findMany({
      where: { userId: session.user.id },
      select: {
        id: true,
        invoiceNumber: true,
        plan: true,
        amount: true,
        currency: true,
        status: true,
        dueDate: true,
        paidAt: true,
        periodStart: true,
        periodEnd: true,
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(
      invoices.map((inv) => ({
        ...inv,
        amount: Number(inv.amount),
      }))
    );
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
