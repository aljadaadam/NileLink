import { NextRequest, NextResponse } from "next/server";
import { auth, requireActiveSubscription } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { MikroTikClient } from "@/lib/mikrotik";
import { z } from "zod";

const createUserSchema = z.object({
  username: z.string().min(1).max(100),
  password: z.string().min(1).max(100),
  routerId: z.string().min(1),
  packageName: z.string().optional(),
  expiresAt: z.string().optional(),
});

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const users = await prisma.hotspotUser.findMany({
    where: { userId: session.user.id },
    include: { router: { select: { name: true } } },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(
    users.map((u) => ({
      ...u,
      bytesIn: u.bytesIn.toString(),
      bytesOut: u.bytesOut.toString(),
    }))
  );
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const subError = await requireActiveSubscription(session.user.id);
  if (subError) return subError;

  try {
    const body = await req.json();
    const data = createUserSchema.parse(body);

    // Verify router belongs to user
    const router = await prisma.router.findFirst({
      where: { id: data.routerId, userId: session.user.id },
    });

    if (!router) {
      return NextResponse.json(
        { error: "Router not found" },
        { status: 404 }
      );
    }

    // Try to add user to MikroTik
    try {
      const client = new MikroTikClient({
        host: router.host,
        port: router.port,
        username: router.username,
        password: router.password,
      });
      await client.addHotspotUser(data.username, data.password);
    } catch {
      // Router might be offline, still create in DB
    }

    const hotspotUser = await prisma.hotspotUser.create({
      data: {
        username: data.username,
        password: data.password,
        routerId: data.routerId,
        userId: session.user.id,
        packageName: data.packageName,
        expiresAt: data.expiresAt ? new Date(data.expiresAt) : undefined,
      },
      include: { router: { select: { name: true } } },
    });

    return NextResponse.json(
      {
        ...hotspotUser,
        bytesIn: hotspotUser.bytesIn.toString(),
        bytesOut: hotspotUser.bytesOut.toString(),
      },
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
