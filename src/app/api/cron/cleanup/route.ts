import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { MikroTikClient } from "@/lib/mikrotik";

// This endpoint should be called periodically (e.g., every 5 minutes via cron)
// It handles: 1) Auto-disconnect expired hotspot users  2) Expire old vouchers
export async function POST(req: NextRequest) {
  // Verify cron secret to prevent unauthorized calls
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const results = { disconnected: 0, vouchersExpired: 0, errors: 0 };

  // ─── 1. Auto-disconnect expired hotspot users ─────────────
  try {
    const expiredUsers = await prisma.hotspotUser.findMany({
      where: {
        expiresAt: { lt: new Date() },
        isActive: true,
      },
      include: { router: true },
    });

    // Group by router to minimize connections
    const byRouter = new Map<string, typeof expiredUsers>();
    for (const user of expiredUsers) {
      const list = byRouter.get(user.routerId) || [];
      list.push(user);
      byRouter.set(user.routerId, list);
    }

    for (const [, users] of byRouter) {
      const router = users[0].router;
      let client: MikroTikClient | null = null;

      try {
        client = new MikroTikClient({
          host: router.host,
          port: router.port,
          username: router.username,
          password: router.password,
        });

        const activeSessions = await client.getActiveSessions();

        for (const user of users) {
          try {
            // Disconnect active session on MikroTik
            const session = activeSessions.find(
              (s) => s.user === user.username || s.name === user.username
            );
            if (session?.[".id"]) {
              await client.disconnectUser(session[".id"]);
            }

            // Remove hotspot user from MikroTik
            await client.removeHotspotUser(user.username);
            results.disconnected++;
          } catch {
            results.errors++;
          }
        }
      } catch {
        // Router unreachable — still mark users inactive
        results.errors++;
      }

      // Mark all expired users as inactive in DB
      const userIds = users.map((u) => u.id);
      await prisma.hotspotUser.updateMany({
        where: { id: { in: userIds } },
        data: { isActive: false },
      });

      // End their sessions in DB
      await prisma.hotspotSession.updateMany({
        where: {
          hotspotUserId: { in: userIds },
          endedAt: null,
        },
        data: { endedAt: new Date() },
      });
    }
  } catch {
    results.errors++;
  }

  // ─── 2. Expire old vouchers ───────────────────────────────
  try {
    const expired = await prisma.voucher.updateMany({
      where: {
        status: "UNUSED",
        expiresAt: { lt: new Date() },
      },
      data: { status: "EXPIRED" },
    });
    results.vouchersExpired = expired.count;
  } catch {
    results.errors++;
  }

  return NextResponse.json({
    success: true,
    ...results,
    timestamp: new Date().toISOString(),
  });
}
