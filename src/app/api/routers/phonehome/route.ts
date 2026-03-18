import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Called by MikroTik scheduler to confirm the router is alive and reachable.
// Also handles auto-registration: detects the router's public IP from the request
// and optionally accepts a Cloud DNS hostname via ?dns= parameter.
export async function GET(req: NextRequest) {
  const apiKey = req.nextUrl.searchParams.get("key");
  if (!apiKey || apiKey.length < 10) {
    return NextResponse.json({ error: "Invalid key" }, { status: 400 });
  }

  const router = await prisma.router.findUnique({
    where: { apiKey },
    select: { id: true, host: true },
  });

  if (!router) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  // Detect router address: prefer Cloud DNS param, fall back to source IP
  const cloudDns = req.nextUrl.searchParams.get("dns");
  const sourceIp =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    null;

  const detectedHost =
    cloudDns && cloudDns.length > 3 ? cloudDns : sourceIp;

  const updateData: Record<string, unknown> = {
    status: "ONLINE",
    lastSeen: new Date(),
  };

  // Auto-register host if still pending
  if (router.host === "pending" && detectedHost) {
    updateData.host = detectedHost;
  }

  await prisma.router.update({
    where: { id: router.id },
    data: updateData,
  });

  return NextResponse.json({ ok: true });
}
