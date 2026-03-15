import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { generateApiKey } from "@/lib/api-key";
import { PLAN_LIMITS } from "@/lib/plans";
import { z } from "zod";

const PRIVATE_IP_REGEX = /^(10\.|172\.(1[6-9]|2\d|3[01])\.|192\.168\.|127\.|0\.|169\.254\.|localhost|::1|fc|fd|fe80)/i;

const createRouterSchema = z.object({
  name: z.string().min(1).max(100),
  host: z.string().min(1).max(255).refine(
    (h) => !PRIVATE_IP_REGEX.test(h),
    { message: "Private/internal IP addresses are not allowed" }
  ),
  port: z.number().int().min(1).max(65535).default(8728),
  username: z.string().min(1).max(100),
  password: z.string().min(1).max(100),
});

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const routers = await prisma.router.findMany({
    where: { userId: session.user.id },
    select: {
      id: true,
      name: true,
      host: true,
      port: true,
      username: true,
      apiKey: true,
      status: true,
      lastSeen: true,
      loginPageHtml: true,
      loginPageCss: true,
      loginPageTemplate: true,
      loginPageTitle: true,
      loginPageLogo: true,
      createdAt: true,
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(routers);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const data = createRouterSchema.parse(body);

    // Enforce plan limit
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { plan: true },
    });
    const limits = PLAN_LIMITS[user?.plan ?? "STARTER"];
    if (limits.maxRouters !== -1) {
      const currentCount = await prisma.router.count({
        where: { userId: session.user.id },
      });
      if (currentCount >= limits.maxRouters) {
        return NextResponse.json(
          { error: `Router limit reached (${limits.maxRouters}). Upgrade your plan.` },
          { status: 403 }
        );
      }
    }

    const router = await prisma.router.create({
      data: {
        ...data,
        apiKey: generateApiKey(),
        userId: session.user.id,
      },
    });

    return NextResponse.json(router, { status: 201 });
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
