import { NextRequest, NextResponse } from "next/server";
import { auth, requireActiveSubscription } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { MikroTikClient } from "@/lib/mikrotik";
import { decrypt, isEncrypted } from "@/lib/encryption";
import { z } from "zod";

const createUserSchema = z.object({
  username: z.string().min(1).max(100),
  password: z.string().min(1).max(100),
  routerId: z.string().min(1),
  packageName: z.string().optional(),
  expiresAt: z.string().optional(),
});

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const users = await prisma.hotspotUser.findMany({
      where: { userId: session.user.id },
      select: {
        id: true,
        username: true,
        password: true,
        packageName: true,
        isActive: true,
        bytesIn: true,
        bytesOut: true,
        uptime: true,
        expiresAt: true,
        createdAt: true,
        routerId: true,
        router: { select: { name: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(
      users.map((u) => ({
        ...u,
        bytesIn: u.bytesIn.toString(),
        bytesOut: u.bytesOut.toString(),
      }))
    );
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
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
        password: isEncrypted(router.password) ? decrypt(router.password) : router.password,
      });

      // If package specified, look up limits
      let profile: string | undefined;
      let limitUptime: string | undefined;
      let limitBytes: string | undefined;

      if (data.packageName) {
        const pkg = await prisma.package.findFirst({
          where: { name: data.packageName, userId: session.user.id },
        });
        if (pkg) {
          if (pkg.uploadSpeed || pkg.downloadSpeed) {
            try {
              const rateLimit = `${pkg.uploadSpeed || 0}k/${pkg.downloadSpeed || 0}k`;
              const sessionTimeout = pkg.duration ? `${pkg.duration}m` : undefined;
              await client.createHotspotProfile(pkg.name, rateLimit, sessionTimeout, 1);
            } catch {
              // Profile might already exist
            }
            profile = pkg.name;
          }
          if (pkg.duration) limitUptime = `${pkg.duration * 60}`;
          if (pkg.dataLimit) limitBytes = pkg.dataLimit.toString();
        }
      }

      await client.addHotspotUser(data.username, data.password, profile, limitUptime, limitBytes);
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
