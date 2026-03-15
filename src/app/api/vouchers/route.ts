import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const vouchers = await prisma.voucher.findMany({
    where: { userId: session.user.id },
    include: {
      package: { select: { name: true, price: true, currency: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(
    vouchers.map((v) => ({
      ...v,
      package: {
        ...v.package,
        price: v.package.price.toString(),
      },
    }))
  );
}

export async function DELETE(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { ids } = await req.json();

  if (!Array.isArray(ids) || ids.length === 0) {
    return NextResponse.json({ error: "No IDs provided" }, { status: 400 });
  }

  await prisma.voucher.deleteMany({
    where: {
      id: { in: ids },
      userId: session.user.id,
    },
  });

  return NextResponse.json({ success: true });
}
