import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { PLAN_LIMITS, type PlanKey } from "@/lib/plans";

const changePlanSchema = z.object({
  plan: z.enum(["STARTER", "PRO", "ENTERPRISE"]),
});

// POST /api/subscription/change-plan — change user's plan
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let data;
  try {
    data = changePlanSchema.parse(await req.json());
  } catch {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }

  const newPlan = data.plan as PlanKey;

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { plan: true, trialEndsAt: true },
  });

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const now = new Date();
  const isInTrial = user.trialEndsAt && user.trialEndsAt > now;

  // Update user plan
  await prisma.user.update({
    where: { id: session.user.id },
    data: { plan: newPlan },
  });

  // Update current subscription plan if in trial
  if (isInTrial) {
    const currentSub = await prisma.subscription.findFirst({
      where: { userId: session.user.id, status: "TRIAL" },
      orderBy: { createdAt: "desc" },
    });
    if (currentSub) {
      await prisma.subscription.update({
        where: { id: currentSub.id },
        data: { plan: newPlan },
      });
    }
  }

  return NextResponse.json({ success: true, plan: newPlan });
}
