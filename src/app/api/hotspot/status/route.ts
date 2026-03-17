import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { rateLimit } from "@/lib/rate-limit";

// Public endpoint — no auth required
// Allows end users to check their voucher/hotspot status by code
export async function GET(req: NextRequest) {
  const clientIp = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  const { limited } = rateLimit(`status:${clientIp}`, 20);
  if (limited) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  const code = req.nextUrl.searchParams.get("code")?.trim();
  if (!code || code.length < 3 || code.length > 50) {
    return NextResponse.json({ error: "Invalid code" }, { status: 400 });
  }

  // Check as voucher first
  const voucher = await prisma.voucher.findFirst({
    where: { code },
    select: {
      code: true,
      status: true,
      expiresAt: true,
      createdAt: true,
      package: {
        select: {
          name: true,
          nameAr: true,
          duration: true,
          dataLimit: true,
          uploadSpeed: true,
          downloadSpeed: true,
        },
      },
    },
  });

  if (voucher) {
    // If voucher is USED, find the associated hotspot user
    if (voucher.status === "USED") {
      const hotspotUser = await prisma.hotspotUser.findFirst({
        where: { username: code },
        select: {
          bytesIn: true,
          bytesOut: true,
          uptime: true,
          isActive: true,
          expiresAt: true,
          createdAt: true,
          sessions: {
            orderBy: { startedAt: "desc" },
            take: 1,
            select: {
              bytesIn: true,
              bytesOut: true,
              startedAt: true,
              endedAt: true,
            },
          },
        },
      });

      if (hotspotUser) {
        const totalBytes = Number(hotspotUser.bytesIn) + Number(hotspotUser.bytesOut);
        const dataLimitBytes = voucher.package.dataLimit ? Number(voucher.package.dataLimit) : null;
        const dataUsedMB = totalBytes / (1024 * 1024);
        const dataLimitMB = dataLimitBytes ? dataLimitBytes / (1024 * 1024) : null;
        const dataPercent = dataLimitMB ? Math.min(100, Math.round((dataUsedMB / dataLimitMB) * 100)) : null;

        const session = hotspotUser.sessions[0];
        const sessionBytes = session ? Number(session.bytesIn) + Number(session.bytesOut) : 0;

        let minutesRemaining: number | null = null;
        if (voucher.package.duration && hotspotUser.expiresAt) {
          const remaining = hotspotUser.expiresAt.getTime() - Date.now();
          minutesRemaining = Math.max(0, Math.round(remaining / 60000));
        }

        return NextResponse.json({
          found: true,
          type: "active",
          status: hotspotUser.isActive ? "ACTIVE" : "EXPIRED",
          package: voucher.package.name,
          packageAr: voucher.package.nameAr,
          dataUsedMB: Math.round(dataUsedMB * 100) / 100,
          dataLimitMB: dataLimitMB ? Math.round(dataLimitMB * 100) / 100 : null,
          dataPercent,
          minutesRemaining,
          totalMinutes: voucher.package.duration,
          uploadSpeed: voucher.package.uploadSpeed,
          downloadSpeed: voucher.package.downloadSpeed,
          expiresAt: hotspotUser.expiresAt?.toISOString() || null,
          sessionActive: session ? !session.endedAt : false,
          sessionBytesUsed: sessionBytes,
          connectedSince: session?.startedAt?.toISOString() || null,
        });
      }
    }

    // Voucher exists but not used yet, or expired
    return NextResponse.json({
      found: true,
      type: "voucher",
      status: voucher.status,
      package: voucher.package.name,
      packageAr: voucher.package.nameAr,
      dataLimitMB: voucher.package.dataLimit
        ? Math.round(Number(voucher.package.dataLimit) / (1024 * 1024) * 100) / 100
        : null,
      totalMinutes: voucher.package.duration,
      uploadSpeed: voucher.package.uploadSpeed,
      downloadSpeed: voucher.package.downloadSpeed,
      expiresAt: voucher.expiresAt?.toISOString() || null,
    });
  }

  // Check as a hotspot user (manual accounts)
  const hotspotUser = await prisma.hotspotUser.findFirst({
    where: { username: code },
    select: {
      bytesIn: true,
      bytesOut: true,
      uptime: true,
      isActive: true,
      expiresAt: true,
      packageName: true,
      sessions: {
        orderBy: { startedAt: "desc" },
        take: 1,
        select: {
          bytesIn: true,
          bytesOut: true,
          startedAt: true,
          endedAt: true,
        },
      },
    },
  });

  if (hotspotUser) {
    const totalBytes = Number(hotspotUser.bytesIn) + Number(hotspotUser.bytesOut);
    const dataUsedMB = totalBytes / (1024 * 1024);
    const session = hotspotUser.sessions[0];

    let minutesRemaining: number | null = null;
    if (hotspotUser.expiresAt) {
      const remaining = hotspotUser.expiresAt.getTime() - Date.now();
      minutesRemaining = Math.max(0, Math.round(remaining / 60000));
    }

    return NextResponse.json({
      found: true,
      type: "active",
      status: hotspotUser.isActive ? "ACTIVE" : "EXPIRED",
      package: hotspotUser.packageName,
      dataUsedMB: Math.round(dataUsedMB * 100) / 100,
      dataLimitMB: null,
      dataPercent: null,
      minutesRemaining,
      totalMinutes: null,
      expiresAt: hotspotUser.expiresAt?.toISOString() || null,
      sessionActive: session ? !session.endedAt : false,
      connectedSince: session?.startedAt?.toISOString() || null,
    });
  }

  return NextResponse.json({ found: false });
}
