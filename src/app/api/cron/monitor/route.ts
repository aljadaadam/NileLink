import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { MikroTikClient } from "@/lib/mikrotik";
import { decrypt, isEncrypted } from "@/lib/encryption";
import { sendEmail } from "@/lib/email";
import { routerOfflineEmail } from "@/lib/email-templates";

// Called every 10 minutes via cron to check router status
// and send email alerts for offline routers
export async function POST(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const results = { checked: 0, online: 0, offline: 0, alerts: 0, errors: 0 };

  const routers = await prisma.router.findMany({
    include: { user: { select: { name: true, email: true } } },
  });

  for (const router of routers) {
    results.checked++;

    try {
      const client = new MikroTikClient({
        host: router.host,
        port: router.port,
        username: router.username,
        password: isEncrypted(router.password) ? decrypt(router.password) : router.password,
      });

      const isOnline = await client.testConnection();

      if (isOnline) {
        results.online++;
        await prisma.router.update({
          where: { id: router.id },
          data: { status: "ONLINE", lastSeen: new Date() },
        });
      } else {
        results.offline++;
        const wasOnline = router.status === "ONLINE";

        await prisma.router.update({
          where: { id: router.id },
          data: { status: "OFFLINE" },
        });

        // Only alert if router just went offline (was ONLINE before)
        if (wasOnline) {
          results.alerts++;
          const lastSeen = router.lastSeen
            ? router.lastSeen.toISOString().replace("T", " ").slice(0, 19)
            : "Unknown";

          sendEmail(
            router.user.email,
            `⚠️ Router "${router.name}" is Offline — NileLink`,
            routerOfflineEmail(router.user.name, router.name, router.host, lastSeen)
          ).catch((err) => console.error("Failed to send offline alert:", err));
        }
      }
    } catch {
      results.errors++;
      const wasOnline = router.status === "ONLINE";

      await prisma.router.update({
        where: { id: router.id },
        data: { status: "ERROR" },
      });

      if (wasOnline) {
        results.alerts++;
        const lastSeen = router.lastSeen
          ? router.lastSeen.toISOString().replace("T", " ").slice(0, 19)
          : "Unknown";

        sendEmail(
          router.user.email,
          `⚠️ Router "${router.name}" is Offline — NileLink`,
          routerOfflineEmail(router.user.name, router.name, router.host, lastSeen)
        ).catch((err) => console.error("Failed to send offline alert:", err));
      }
    }
  }

  return NextResponse.json(results);
}
