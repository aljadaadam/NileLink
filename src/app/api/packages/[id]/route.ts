import { NextRequest, NextResponse } from "next/server";
import { auth, requireActiveSubscription } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const updatePackageSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  nameAr: z.string().max(100).optional(),
  duration: z.number().int().min(1).optional().nullable(),
  dataLimit: z.number().int().min(1).optional().nullable(),
  uploadSpeed: z.number().int().min(1).optional().nullable(),
  downloadSpeed: z.number().int().min(1).optional().nullable(),
  price: z.number().min(0).optional(),
  currency: z.string().max(10).optional(),
  isActive: z.boolean().optional(),
});

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const subError = await requireActiveSubscription(session.user.id);
  if (subError) return subError;

  const { id } = await params;

  const existing = await prisma.package.findFirst({
    where: { id, userId: session.user.id },
    select: { id: true },
  });

  if (!existing) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  try {
    const body = await req.json();
    const data = updatePackageSchema.parse(body);

    const pkg = await prisma.package.update({
      where: { id },
      data: {
        ...data,
        dataLimit: data.dataLimit !== undefined
          ? data.dataLimit !== null ? BigInt(data.dataLimit) : null
          : undefined,
      },
    });

    return NextResponse.json({
      ...pkg,
      price: pkg.price.toString(),
      dataLimit: pkg.dataLimit?.toString() ?? null,
    });
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

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const subError = await requireActiveSubscription(session.user.id);
  if (subError) return subError;

  const { id } = await params;

  const existing = await prisma.package.findFirst({
    where: { id, userId: session.user.id },
    select: { id: true },
  });

  if (!existing) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const voucherCount = await prisma.voucher.count({
    where: { packageId: id, status: { in: ["UNUSED", "ACTIVE"] } },
  });

  if (voucherCount > 0) {
    return NextResponse.json(
      { error: `Cannot delete: ${voucherCount} active/unused voucher(s) use this package` },
      { status: 400 }
    );
  }

  await prisma.package.delete({ where: { id } });

  return NextResponse.json({ success: true });
}
