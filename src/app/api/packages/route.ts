import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const createPackageSchema = z.object({
  name: z.string().min(1).max(100),
  nameAr: z.string().max(100).optional(),
  duration: z.number().int().min(1).optional(),
  dataLimit: z.number().int().min(1).optional(),
  uploadSpeed: z.number().int().min(1).optional(),
  downloadSpeed: z.number().int().min(1).optional(),
  price: z.number().min(0),
  currency: z.string().max(10).default("USD"),
});

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const packages = await prisma.package.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(
    packages.map((p) => ({
      ...p,
      price: p.price.toString(),
      dataLimit: p.dataLimit?.toString() ?? null,
    }))
  );
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const data = createPackageSchema.parse(body);

    const pkg = await prisma.package.create({
      data: {
        name: data.name,
        nameAr: data.nameAr,
        duration: data.duration,
        dataLimit: data.dataLimit ? BigInt(data.dataLimit) : undefined,
        uploadSpeed: data.uploadSpeed,
        downloadSpeed: data.downloadSpeed,
        price: data.price,
        currency: data.currency,
        userId: session.user.id,
      },
    });

    return NextResponse.json(
      { ...pkg, price: pkg.price.toString(), dataLimit: pkg.dataLimit?.toString() ?? null },
      { status: 201 }
    );
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
