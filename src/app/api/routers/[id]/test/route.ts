import { NextRequest, NextResponse } from "next/server";
import { auth, requireActiveSubscription } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { MikroTikClient } from "@/lib/mikrotik";
import { decrypt, isEncrypted } from "@/lib/encryption";

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const subError = await requireActiveSubscription(session.user.id);
    if (subError) return subError;

    const { id } = await params;

    const router = await prisma.router.findFirst({
      where: { id, userId: session.user.id },
      select: { id: true, host: true, port: true, username: true, password: true },
    });

    if (!router) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const client = new MikroTikClient({
      host: router.host,
      port: router.port,
      username: router.username,
      password: isEncrypted(router.password) ? decrypt(router.password) : router.password,
    });

    const success = await client.testConnection();

    await prisma.router.update({
      where: { id },
      data: {
        status: success ? "ONLINE" : "ERROR",
        lastSeen: success ? new Date() : undefined,
      },
    });

    return NextResponse.json({ success });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
