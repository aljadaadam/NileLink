import { NextResponse } from "next/server";
import { createHash } from "crypto";
import { prisma } from "@/lib/prisma";
import { rateLimit } from "@/lib/rate-limit";
import { headers } from "next/headers";

export async function POST(req: Request) {
  const hdrs = await headers();
  const ip =
    hdrs.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    hdrs.get("x-real-ip") ||
    "unknown";

  const { limited } = rateLimit(`verify-login:${ip}`, 10);
  if (limited) {
    return NextResponse.json(
      { error: "Too many attempts. Please try again later." },
      { status: 429 }
    );
  }

  const { email, code } = await req.json();

  if (!email || !code) {
    return NextResponse.json(
      { error: "Email and code are required" },
      { status: 400 }
    );
  }

  const user = await prisma.user.findUnique({
    where: { email: email.toLowerCase().trim() },
  });

  if (!user || !user.verifyCode || !user.verifyExpires) {
    return NextResponse.json(
      { error: "INVALID_CODE" },
      { status: 401 }
    );
  }

  if (user.verifyExpires < new Date()) {
    return NextResponse.json(
      { error: "CODE_EXPIRED" },
      { status: 401 }
    );
  }

  if (user.verifyCode !== code) {
    return NextResponse.json(
      { error: "INVALID_CODE" },
      { status: 401 }
    );
  }

  // Clear the OTP
  await prisma.user.update({
    where: { id: user.id },
    data: { verifyCode: null, verifyExpires: null },
  });

  // Save device as trusted (30 days)
  const userAgent = hdrs.get("user-agent") || "unknown";
  const fingerprint = createHash("sha256")
    .update(`${ip}:${userAgent}`)
    .digest("hex");

  await prisma.trustedDevice.upsert({
    where: { userId_fingerprint: { userId: user.id, fingerprint } },
    create: {
      userId: user.id,
      fingerprint,
      ipAddress: ip,
      userAgent: userAgent.substring(0, 500),
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    },
    update: {
      ipAddress: ip,
      userAgent: userAgent.substring(0, 500),
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    },
  });

  return NextResponse.json({ status: "VERIFIED", email: user.email });
}
