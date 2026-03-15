import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { MikroTikClient } from "@/lib/mikrotik";

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  const user = await prisma.hotspotUser.findFirst({
    where: { id, userId: session.user.id },
    include: { router: true },
  });

  if (!user) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  // Try to remove from MikroTik
  try {
    const client = new MikroTikClient({
      host: user.router.host,
      port: user.router.port,
      username: user.router.username,
      password: user.router.password,
    });
    await client.removeHotspotUser(user.username);
  } catch {
    // Continue even if router is unreachable
  }

  await prisma.hotspotUser.delete({ where: { id } });

  return NextResponse.json({ success: true });
}
