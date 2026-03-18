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

    // Disconnect from MikroTik router
    try {
      const client = new MikroTikClient({
        host: user.router.host,
        port: user.router.port,
        username: user.router.username,
        password: isEncrypted(user.router.password) ? decrypt(user.router.password) : user.router.password,
      });

      // Remove active session from MikroTik
      const activeSessions = await client.getActiveSessions();
      const activeSession = activeSessions.find(
        (s) => s.user === user.username || s.name === user.username
      );
      if (activeSession?.[".id"]) {
        await client.disconnectUser(activeSession[".id"]);
      }

      // Also remove the hotspot user from MikroTik so they can't reconnect
      await client.removeHotspotUser(user.username);
    } catch {
      // Router might be offline — still mark inactive in DB
    }

    // End active sessions in DB
    await prisma.hotspotSession.updateMany({
      where: { hotspotUserId: id, endedAt: null },
      data: { endedAt: new Date() },
    });

    await prisma.hotspotUser.update({
      where: { id },
      data: { isActive: false },
    });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
