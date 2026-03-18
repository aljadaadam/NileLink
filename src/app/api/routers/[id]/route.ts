import { NextRequest, NextResponse } from "next/server";
import { auth, requireActiveSubscription } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { encrypt } from "@/lib/encryption";
import { z } from "zod";

const PRIVATE_IP_REGEX = /^(10\.|172\.(1[6-9]|2\d|3[01])\.|192\.168\.|127\.|0\.|169\.254\.|localhost|::1|fc|fd|fe80)/i;

const updateRouterSchema = z.object({
  name: z.string().min(1).max(100),
  host: z.string().min(1).max(255).refine(
    (h) => h === "pending" || !PRIVATE_IP_REGEX.test(h),
    { message: "Private/internal IP addresses are not allowed" }
  ),
  port: z.number().int().min(1).max(65535).default(8728),
  username: z.string().min(1).max(100),
  password: z.string().max(100).optional(),
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

  const router = await prisma.router.findFirst({
    where: { id, userId: session.user.id },
    select: { id: true },
  });

  if (!router) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  try {
    const body = await req.json();
    const data = updateRouterSchema.parse(body);

    const updateData: Record<string, unknown> = {
      name: data.name,
      host: data.host,
      port: data.port,
      username: data.username,
    };
    if (data.password) {
      updateData.password = encrypt(data.password);
    }

    const updated = await prisma.router.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json(updated);
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

  const router = await prisma.router.findFirst({
    where: { id, userId: session.user.id },
    select: { id: true },
  });

  if (!router) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  await prisma.router.delete({ where: { id } });

  return NextResponse.json({ success: true });
}
