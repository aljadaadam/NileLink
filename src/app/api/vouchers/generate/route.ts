import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { generateVoucherCodes } from "@/lib/api-key";
import { z } from "zod";

const generateSchema = z.object({
  packageId: z.string().min(1),
  count: z.number().int().min(1).max(500),
  expiresAt: z.string().optional(),
});

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

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

    const codes = generateVoucherCodes(data.count);

    await prisma.voucher.createMany({
      data: codes.map((code) => ({
        code,
        packageId: data.packageId,
        userId: session.user.id,
        expiresAt: data.expiresAt ? new Date(data.expiresAt) : undefined,
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
