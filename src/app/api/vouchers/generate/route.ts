import { NextRequest, NextResponse } from "next/server";
import { auth, requireActiveSubscription } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { generateVoucherCodes } from "@/lib/api-key";
import { PLAN_LIMITS } from "@/lib/plans";
import { z } from "zod";

const generateSchema = z.object({
  packageId: z.string().min(1),
  count: z.number().int().min(1).max(500),
  expiryDays: z.number().int().min(1).max(365).optional(),
});

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const subError = await requireActiveSubscription(session.user.id);
  if (subError) return subError;

  try {
    const body = await req.json();
    const data = generateSchema.parse(body);

    // Verify package belongs to user
    const pkg = await prisma.package.findFirst({
      where: { id: data.packageId, userId: session.user.id },
    });

    if (!pkg) {
      return NextResponse.json(
        { error: "Package not found" },
        { status: 404 }
      );
    }

    // Enforce monthly voucher limit
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { plan: true },
    });
    const limits = PLAN_LIMITS[user?.plan ?? "STARTER"];
    if (limits.maxVouchersPerMonth !== -1) {
      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      startOfMonth.setHours(0, 0, 0, 0);
      const monthlyCount = await prisma.voucher.count({
        where: {
          userId: session.user.id,
          createdAt: { gte: startOfMonth },
        },
      });
      if (monthlyCount + data.count > limits.maxVouchersPerMonth) {
        const remaining = limits.maxVouchersPerMonth - monthlyCount;
        return NextResponse.json(
          { error: `Monthly voucher limit: ${remaining} remaining of ${limits.maxVouchersPerMonth}` },
          { status: 403 }
        );
      }
    }

    const codes = generateVoucherCodes(data.count);

    const expiresAt = data.expiryDays
      ? new Date(Date.now() + data.expiryDays * 24 * 60 * 60 * 1000)
      : undefined;

    await prisma.voucher.createMany({
      data: codes.map((code) => ({
        code,
        packageId: data.packageId,
        userId: session.user.id,
        expiresAt,
      })),
    });

    return NextResponse.json({ count: codes.length, codes }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
