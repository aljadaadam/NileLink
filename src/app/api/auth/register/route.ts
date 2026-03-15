import { NextRequest, NextResponse } from "next/server";
import { hash } from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { rateLimit } from "@/lib/rate-limit";
import { z } from "zod";
import { sendEmail, generateVerifyCode } from "@/lib/email";
import { verificationCodeEmail } from "@/lib/email-templates";

const registerSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email().max(255),
  password: z.string().min(6).max(72),
  company: z.string().max(100).optional(),
  phone: z.string().min(5).max(20),
});

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
    const { limited } = rateLimit(`register:${ip}`, 5);
    if (limited) {
      return NextResponse.json(
        { error: "Too many requests. Please try again later." },
        { status: 429 }
      );
    }

    const body = await req.json();
    const data = registerSchema.parse(body);

    const existing = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (existing) {
      return NextResponse.json(
        { error: "Registration failed. Please try again or use a different email." },
        { status: 409 }
      );
    }

    const hashedPassword = await hash(data.password, 12);
    const verifyCode = generateVerifyCode();
    const verifyExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    await prisma.user.create({
      data: {
        name: data.name,
        email: data.email,
        hashedPassword,
        company: data.company,
        phone: data.phone,
        verifyCode,
        verifyExpires,
      },
    });

    // Send verification email (non-blocking)
    sendEmail(
      data.email,
      "Verify your email - NileLink",
      verificationCodeEmail(verifyCode, data.name)
    ).catch((err) => console.error("Failed to send verification email:", err));

    return NextResponse.json({ success: true, requireVerification: true }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      );
    }
    console.error("Register error");
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
