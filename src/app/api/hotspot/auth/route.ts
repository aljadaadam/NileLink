import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// This endpoint is called by the MikroTik router to authenticate hotspot users
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { apiKey, username, password, mac, ip } = body;

    if (!apiKey || !username) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Find router by API key
    const router = await prisma.router.findUnique({
      where: { apiKey },
    });

    if (!router) {
      return NextResponse.json(
        { error: "Invalid API key" },
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
          { error: "User expired" },
          { status: 403 }
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
      { error: "Invalid credentials" },
      { status: 401 }
    );
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
