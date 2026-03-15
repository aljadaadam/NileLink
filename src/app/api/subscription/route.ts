import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PLAN_LIMITS } from "@/lib/plans";

// GET /api/subscription — get current user's subscription info
export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { plan: true, trialEndsAt: true },
  });

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const subscription = await prisma.subscription.findFirst({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
  });

  const now = new Date();
  const planChosen = user.trialEndsAt !== null; // user has selected a plan
  const isTrialActive = user.trialEndsAt && user.trialEndsAt > now;
  const isSubscriptionActive =
    subscription &&
    (subscription.status === "ACTIVE" || subscription.status === "TRIAL") &&
    subscription.currentPeriodEnd > now;

  const limits = PLAN_LIMITS[user.plan];

  return NextResponse.json({
    plan: user.plan,
    planChosen,
    trialEndsAt: user.trialEndsAt,
    subscription: subscription
      ? {
          id: subscription.id,
          status: subscription.status,
          currentPeriodStart: subscription.currentPeriodStart,
          currentPeriodEnd: subscription.currentPeriodEnd,
        }
      : null,
    isActive: !planChosen || isTrialActive || isSubscriptionActive,
    limits,
  });
}
