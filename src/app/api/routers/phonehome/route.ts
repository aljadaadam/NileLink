import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Called by MikroTik scheduler to confirm the router is alive and reachable.
// The script adds a scheduler that hits this endpoint every 60s with the router's API key.
export async function GET(req: NextRequest) {
  const apiKey = req.nextUrl.searchParams.get("key");
  if (!apiKey || apiKey.length < 10) {
    return NextResponse.json({ error: "Invalid key" }, { status: 400 });
  }

  const router = await prisma.router.findUnique({
    where: { apiKey },
    select: { id: true, status: true },
  });

  if (!router) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  await prisma.router.update({
    where: { id: router.id },
    data: {
      status: "ONLINE",
      lastSeen: new Date(),
    },
  });

  return NextResponse.json({ ok: true });
}
