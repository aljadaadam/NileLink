import { NextRequest, NextResponse } from "next/server";
import { auth, requireActiveSubscription } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { MikroTikClient } from "@/lib/mikrotik";
import { decrypt, isEncrypted } from "@/lib/encryption";

export async function DELETE(
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

    const user = await prisma.hotspotUser.findFirst({
      where: { id, userId: session.user.id },
      select: {
        id: true,
        username: true,
        router: {
          select: { host: true, port: true, username: true, password: true },
        },
      },
    });

    if (!user) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    // Try to remove from MikroTik
    try {
      const client = new MikroTikClient({
        host: user.router.host,
        port: user.router.port,
        username: user.router.username,
        password: isEncrypted(user.router.password) ? decrypt(user.router.password) : user.router.password,
      });
      await client.removeHotspotUser(user.username);
    } catch {
      // Continue even if router is unreachable
    }

    await prisma.hotspotUser.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
