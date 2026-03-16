import { NextRequest, NextResponse } from "next/server";
import { auth, requireActiveSubscription } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const loginPageSchema = z.object({
  html: z.string().max(100000),
  css: z.string().max(100000),
  template: z.string().max(50).optional(),
  title: z.string().max(100).optional(),
  logo: z.string().max(700000).nullable().optional(), // base64 logo ~500KB
});

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const subError = await requireActiveSubscription(session.user.id);
  if (subError) return subError;

  const { id } = await params;

  const router = await prisma.router.findFirst({
    where: { id, userId: session.user.id },
  });

  if (!router) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  try {
    const body = await req.json();
    const data = loginPageSchema.parse(body);

    await prisma.router.update({
      where: { id },
      data: {
        loginPageHtml: data.html,
        loginPageCss: data.css,
        loginPageTemplate: data.template ?? null,
        loginPageTitle: data.title ?? null,
        loginPageLogo: data.logo ?? null,
      },
    });

    return NextResponse.json({ success: true });
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
