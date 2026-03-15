import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { rateLimit } from "@/lib/rate-limit";
import { sendEmail, generateVerifyCode } from "@/lib/email";
import { welcomeEmail } from "@/lib/email-templates";
import { z } from "zod";

const verifySchema = z.object({
  email: z.string().email(),
  code: z.string().length(6),
});

export async function POST(req: NextRequest) {
  try {
    const ip =
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
    const { limited } = rateLimit(`verify:${ip}`, 10);
    if (limited) {
      return NextResponse.json(
        { error: "Too many attempts. Please try again later." },
        { status: 429 }
      );
    }

    const body = await req.json();
    const data = verifySchema.parse(body);

    const user = await prisma.user.findUnique({
      where: { email: data.email },
      select: {
        id: true,
        name: true,
        emailVerified: true,
        verifyCode: true,
        verifyExpires: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Invalid code" },
        { status: 400 }
      );
    }

    if (user.emailVerified) {
      return NextResponse.json({ success: true, alreadyVerified: true });
    }

    if (
      !user.verifyCode ||
      !user.verifyExpires ||
      user.verifyCode !== data.code
    ) {
      return NextResponse.json(
        { error: "Invalid code" },
        { status: 400 }
      );
    }

    if (user.verifyExpires < new Date()) {
      return NextResponse.json(
        { error: "Code expired. Please request a new one." },
        { status: 400 }
      );
    }

    // Mark email as verified
    await prisma.user.update({
      where: { id: user.id },
      data: {
        emailVerified: true,
        verifyCode: null,
        verifyExpires: null,
      },
    });

    // Send welcome email (non-blocking)
    sendEmail(
      data.email,
      "Welcome to NileLink! 🎉",
      welcomeEmail(user.name)
    ).catch(() => {});

    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid input" },
        { status: 400 }
      );
    }
    console.error("Verify email error");
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
