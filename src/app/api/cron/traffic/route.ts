import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { MikroTikClient } from "@/lib/mikrotik";
import { decrypt, isEncrypted } from "@/lib/encryption";
import { sendEmail } from "@/lib/email";
import { trafficAlertEmail } from "@/lib/email-templates";

// Called every 10 minutes via cron to check router traffic load
// Sends email suggestion when active sessions exceed 80% of router capacity
export async function POST(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const results = { checked: 0, alerts: 0, errors: 0 };

  const routers = await prisma.router.findMany({
    where: { status: "ONLINE" },
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

      // Get active sessions from MikroTik
      const activeSessions = await client.getActiveSessions();
      const activeCount = activeSessions.length;

      // Get user profiles to determine max capacity
      const profiles = await client.getHotspotProfiles();
      // Calculate max allowed users across all profiles
      let maxUsers = 0;
      for (const profile of profiles) {
        const shared = parseInt(profile["shared-users"] || "1", 10);
        maxUsers += shared;
      }

      // Fallback: if no profiles or very low max, use a reasonable default
      if (maxUsers < 10) maxUsers = 50;

      const loadPercent = Math.round((activeCount / maxUsers) * 100);

      if (loadPercent >= 80) {
        results.alerts++;

        // Calculate total bandwidth from active sessions
        let totalBytesIn = BigInt(0);
        let totalBytesOut = BigInt(0);
        for (const session of activeSessions) {
          totalBytesIn += BigInt(session["bytes-in"] || "0");
          totalBytesOut += BigInt(session["bytes-out"] || "0");
        }
        const totalTrafficMB = Number((totalBytesIn + totalBytesOut) / BigInt(1024 * 1024));

        sendEmail(
          router.user.email,
          `⚠️ High Load on "${router.name}" (${loadPercent}%) — NileLink`,
          trafficAlertEmail(
            router.user.name,
            router.name,
            activeCount,
            maxUsers,
            loadPercent,
            totalTrafficMB
          )
        ).catch((err) => console.error("Failed to send traffic alert:", err));
      }
    } catch {
      results.errors++;
    }
  }

  return NextResponse.json({
    success: true,
    ...results,
    timestamp: new Date().toISOString(),
  });
}
