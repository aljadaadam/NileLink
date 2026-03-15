import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { rateLimit } from "@/lib/rate-limit";
import { sendEmail, generateVerifyCode } from "@/lib/email";
import { verificationCodeEmail } from "@/lib/email-templates";
import { z } from "zod";

const resendSchema = z.object({
  email: z.string().email(),
});

export async function POST(req: NextRequest) {
  try {
    const ip =
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
    const { limited } = rateLimit(`resend:${ip}`, 3);
    if (limited) {
      return NextResponse.json(
        { error: "Too many attempts. Please wait before requesting a new code." },
        { status: 429 }
      );
    }

    const body = await req.json();
    const data = resendSchema.parse(body);

    const user = await prisma.user.findUnique({
      where: { email: data.email },
      select: { id: true, name: true, emailVerified: true },
    });

    // Always return success to prevent email enumeration
    if (!user || user.emailVerified) {
      return NextResponse.json({ success: true });
    }

    const code = generateVerifyCode();
    const expires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    await prisma.user.update({
      where: { id: user.id },
      data: { verifyCode: code, verifyExpires: expires },
    });

    await sendEmail(
      data.email,
      `${code} — NileLink Verification Code`,
      verificationCodeEmail(code, user.name)
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid input" },
        { status: 400 }
      );
    }
    console.error("Resend code error");
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
