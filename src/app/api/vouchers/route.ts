import { NextRequest, NextResponse } from "next/server";
import { auth, requireActiveSubscription } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const page = Math.max(1, parseInt(req.nextUrl.searchParams.get("page") || "1"));
    const limit = Math.min(100, Math.max(1, parseInt(req.nextUrl.searchParams.get("limit") || "50")));
    const skip = (page - 1) * limit;

    const [vouchers, total] = await Promise.all([
      prisma.voucher.findMany({
        where: { userId: session.user.id },
        select: {
          id: true,
          code: true,
          status: true,
          usedBy: true,
          usedAt: true,
          expiresAt: true,
          createdAt: true,
          package: { select: { name: true, price: true, currency: true } },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.voucher.count({ where: { userId: session.user.id } }),
    ]);

    return NextResponse.json({
      vouchers: vouchers.map((v) => ({
        ...v,
        package: {
          ...v.package,
          price: v.package.price.toString(),
        },
      })),
      total,
      page,
      totalPages: Math.ceil(total / limit),
    });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

const deleteSchema = z.object({
  ids: z.array(z.string().min(1)).min(1).max(500),
});

export async function DELETE(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const subError = await requireActiveSubscription(session.user.id);
    if (subError) return subError;

    const body = await req.json();
    const { ids } = deleteSchema.parse(body);

    await prisma.voucher.deleteMany({
      where: {
        id: { in: ids },
        userId: session.user.id,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors[0].message }, { status: 400 });
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
