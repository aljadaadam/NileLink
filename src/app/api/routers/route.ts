import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { generateApiKey } from "@/lib/api-key";
import { z } from "zod";

const createRouterSchema = z.object({
  name: z.string().min(1).max(100),
  host: z.string().min(1).max(255),
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
