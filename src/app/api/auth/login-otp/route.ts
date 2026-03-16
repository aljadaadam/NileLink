import { NextResponse } from "next/server";
import { compare } from "bcryptjs";
import { createHash } from "crypto";
import { prisma } from "@/lib/prisma";
import { rateLimit } from "@/lib/rate-limit";
import { sendEmail, generateVerifyCode } from "@/lib/email";
import { loginOtpEmail } from "@/lib/email-templates";
import { headers } from "next/headers";

export async function POST(req: Request) {
  const hdrs = await headers();
  const ip =
    hdrs.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    hdrs.get("x-real-ip") ||
    "unknown";

  const { limited } = rateLimit(`login-otp:${ip}`, 10);
  if (limited) {
    return NextResponse.json(
      { error: "Too many attempts. Please try again later." },
      { status: 429 }
    );
  }

  const { email, password } = await req.json();

  if (!email || !password) {
    return NextResponse.json(
      { error: "Email and password are required" },
      { status: 400 }
    );
  }

  const user = await prisma.user.findUnique({
    where: { email: email.toLowerCase().trim() },
  });

  if (!user) {
    return NextResponse.json(
      { error: "INVALID_CREDENTIALS" },
      { status: 401 }
    );
  }

  const isValid = await compare(password, user.hashedPassword);
  if (!isValid) {
    return NextResponse.json(
      { error: "INVALID_CREDENTIALS" },
      { status: 401 }
    );
  }

  if (!user.emailVerified) {
    return NextResponse.json(
      { error: "EMAIL_NOT_VERIFIED" },
      { status: 403 }
    );
  }

  // Check if device is trusted
  const userAgent = hdrs.get("user-agent") || "unknown";
  const fingerprint = createHash("sha256")
    .update(`${ip}:${userAgent}`)
    .digest("hex");

  const trusted = await prisma.trustedDevice.findUnique({
    where: { userId_fingerprint: { userId: user.id, fingerprint } },
  });

  if (trusted && trusted.expiresAt > new Date()) {
    // Device is trusted — allow login without OTP
    return NextResponse.json({ status: "TRUSTED", email: user.email });
  }

  // Clean up expired trusted device if exists
  if (trusted) {
    await prisma.trustedDevice.delete({ where: { id: trusted.id } });
  }

  // New device — generate OTP, store on user, send email
  const code = generateVerifyCode();
  await prisma.user.update({
    where: { id: user.id },
    data: {
      verifyCode: code,
      verifyExpires: new Date(Date.now() + 10 * 60 * 1000), // 10 min
    },
  });

  await sendEmail(
    user.email,
    "NileLink — Login Verification Code",
    loginOtpEmail(code, user.name, ip, userAgent)
  );

  return NextResponse.json({
    status: "OTP_REQUIRED",
    email: user.email,
    maskedEmail: maskEmail(user.email),
  });
}

function maskEmail(email: string): string {
  const [local, domain] = email.split("@");
  if (local.length <= 2) return `${local[0]}***@${domain}`;
  return `${local[0]}${local[1]}${"*".repeat(Math.min(local.length - 2, 6))}@${domain}`;
}
