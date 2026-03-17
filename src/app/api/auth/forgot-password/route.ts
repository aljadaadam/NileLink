import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { rateLimit } from "@/lib/rate-limit";
import { sendEmail, generateVerifyCode } from "@/lib/email";
import { passwordResetEmail } from "@/lib/email-templates";
import { z } from "zod";

const schema = z.object({
  email: z.string().email(),
});

// Step 1: User submits email → send 6-digit reset code
export async function POST(req: NextRequest) {
  const clientIp = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  const { limited } = rateLimit(`forgot:${clientIp}`, 5);
  if (limited) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  try {
    const body = await req.json();
    const { email } = schema.parse(body);

    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    // Always return success to prevent email enumeration
    if (!user) {
      return NextResponse.json({ success: true });
    }

    const code = generateVerifyCode();
    const expires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    await prisma.user.update({
      where: { id: user.id },
      data: { verifyCode: code, verifyExpires: expires },
    });

    sendEmail(
      user.email,
      "🔑 Password Reset — NileLink",
      passwordResetEmail(code, user.name)
    ).catch((err) => console.error("Failed to send reset email:", err));

    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid email" }, { status: 400 });
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
