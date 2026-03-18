import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { rateLimit } from "@/lib/rate-limit";
import { MikroTikClient } from "@/lib/mikrotik";
import { decrypt, isEncrypted } from "@/lib/encryption";
import { z } from "zod";

const hotspotAuthSchema = z.object({
  apiKey: z.string().min(1),
  username: z.string().min(1).max(100),
  password: z.string().max(100).default(""),
  mac: z.string().max(50).optional(),
  ip: z.string().max(50).optional(),
});

// This endpoint is called by the MikroTik router to authenticate hotspot users
export async function POST(req: NextRequest) {
  try {
    const clientIp = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
    const { limited } = rateLimit(`hotspot:${clientIp}`, 30);
    if (limited) {
      return NextResponse.json(
        { error: "Too many requests" },
        { status: 429 }
      );
    }

    const body = await req.json();
    const parsed = hotspotAuthSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }
    const { apiKey, username, password, mac, ip } = parsed.data;

    // Find router by API key
    const router = await prisma.router.findUnique({
      where: { apiKey },
    });

    if (!router) {
      return NextResponse.json(
        { error: "Authentication failed" },
        { status: 401 }
      );
    }

    // Update router last seen
    await prisma.router.update({
      where: { id: router.id },
      data: { status: "ONLINE", lastSeen: new Date() },
    });

    // First try as a voucher code
    const voucher = await prisma.voucher.findFirst({
      where: {
        code: username,
        userId: router.userId,
        status: "UNUSED",
      },
      include: { package: true },
    });

    if (voucher) {
      // Check voucher expiry
      if (voucher.expiresAt && voucher.expiresAt < new Date()) {
        await prisma.voucher.update({
          where: { id: voucher.id },
          data: { status: "EXPIRED" },
        });
        return NextResponse.json(
          { error: "Voucher expired" },
          { status: 401 }
        );
      }

      // Mark voucher as used
      await prisma.voucher.update({
        where: { id: voucher.id },
        data: {
          status: "USED",
          usedBy: mac || ip || "unknown",
          usedAt: new Date(),
        },
      });

      // Create hotspot user from voucher
      const hotspotUser = await prisma.hotspotUser.create({
        data: {
          username: voucher.code,
          password: "",
          routerId: router.id,
          userId: router.userId,
          packageName: voucher.package.name,
          expiresAt: voucher.package.duration
            ? new Date(Date.now() + voucher.package.duration * 60000)
            : undefined,
        },
      });

      // Create user on MikroTik with proper limits
      try {
        const client = new MikroTikClient({
          host: router.host,
          port: router.port,
          username: router.username,
          password: isEncrypted(router.password) ? decrypt(router.password) : router.password,
        });

        const pkg = voucher.package;

        // Create profile on MikroTik for speed limits (if speeds defined)
        if (pkg.uploadSpeed || pkg.downloadSpeed) {
          try {
            const rateLimit = `${pkg.uploadSpeed || 0}k/${pkg.downloadSpeed || 0}k`;
            const sessionTimeout = pkg.duration ? `${pkg.duration}m` : undefined;
            await client.createHotspotProfile(pkg.name, rateLimit, sessionTimeout, 1);
          } catch {
            // Profile might already exist — ignore
          }
        }

        // Add user to MikroTik with limits
        const profile = (pkg.uploadSpeed || pkg.downloadSpeed) ? pkg.name : undefined;
        const limitUptime = pkg.duration ? `${pkg.duration * 60}` : undefined;
        const limitBytes = pkg.dataLimit ? pkg.dataLimit.toString() : undefined;
        await client.addHotspotUser(voucher.code, "", profile, limitUptime, limitBytes);
      } catch {
        // Router might be offline — user created in DB, will sync later
      }

      // Create session
      await prisma.hotspotSession.create({
        data: {
          hotspotUserId: hotspotUser.id,
          routerId: router.id,
          ipAddress: ip,
          macAddress: mac,
        },
      });

      return NextResponse.json({
        success: true,
        profile: voucher.package.name,
        timeLimit: voucher.package.duration
          ? `${voucher.package.duration}m`
          : undefined,
        dataLimit: voucher.package.dataLimit?.toString(),
        rateLimit: voucher.package.downloadSpeed && voucher.package.uploadSpeed
          ? `${voucher.package.uploadSpeed}k/${voucher.package.downloadSpeed}k`
          : undefined,
      });
    }

    // Try as a regular hotspot user
    const hotspotUser = await prisma.hotspotUser.findFirst({
      where: {
        username,
        routerId: router.id,
        isActive: true,
      },
    });

    if (hotspotUser && hotspotUser.password === password) {
      // Check expiry
      if (hotspotUser.expiresAt && hotspotUser.expiresAt < new Date()) {
        await prisma.hotspotUser.update({
          where: { id: hotspotUser.id },
          data: { isActive: false },
        });
        return NextResponse.json(
          { error: "Authentication failed" },
          { status: 401 }
        );
      }

      // Create session
      await prisma.hotspotSession.create({
        data: {
          hotspotUserId: hotspotUser.id,
          routerId: router.id,
          ipAddress: ip,
          macAddress: mac,
        },
      });

      return NextResponse.json({ success: true });
    }

    return NextResponse.json(
      { error: "Authentication failed" },
      { status: 401 }
    );
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
