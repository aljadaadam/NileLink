import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { PLAN_LIMITS, type PlanKey } from "@/lib/plans";

function generateInvoiceNumber(): string {
  const date = new Date();
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const rand = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `NL-${y}${m}-${rand}`;
}

// POST /api/admin/generate-invoices — generate invoices for expired trials
// Called by cron or admin manually
export async function POST(req: Request) {
  try {
  const authHeader = req.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const now = new Date();

  // Find users whose trial has ended but no invoice has been generated yet
  const expiredTrialUsers = await prisma.user.findMany({
    where: {
      trialEndsAt: { lte: now },
      subscriptions: {
        some: { status: "TRIAL" },
      },
    },
    include: {
      subscriptions: {
        where: { status: "TRIAL" },
        take: 1,
        orderBy: { createdAt: "desc" },
      },
    },
  });

  let generated = 0;

  for (const user of expiredTrialUsers) {
    const sub = user.subscriptions[0];
    if (!sub) continue;

    const plan = user.plan as PlanKey;
    const price = PLAN_LIMITS[plan]?.priceUSD ?? 9;

    const periodStart = new Date(now);
    const periodEnd = new Date(now);
    periodEnd.setMonth(periodEnd.getMonth() + 1);

    // Create invoice
    await prisma.invoice.create({
      data: {
        invoiceNumber: generateInvoiceNumber(),
        userId: user.id,
        subscriptionId: sub.id,
        plan: user.plan,
        amount: price,
        currency: "USD",
        status: "PENDING",
        dueDate: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000), // 7 days to pay
        periodStart,
        periodEnd,
      },
    });

    // Update subscription status from TRIAL to PAST_DUE
    await prisma.subscription.update({
      where: { id: sub.id },
      data: {
        status: "PAST_DUE",
        currentPeriodStart: periodStart,
        currentPeriodEnd: periodEnd,
      },
    });

    generated++;
  }

  return NextResponse.json({ success: true, generated });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
