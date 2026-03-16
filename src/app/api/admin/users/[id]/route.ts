import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const updateRoleSchema = z.object({
  role: z.enum(["USER", "ADMIN"]),
});

async function getAdminId() {
  const session = await auth();
  if (!session?.user?.id) return null;
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { id: true, role: true },
  });
  return user?.role === "ADMIN" ? user.id : null;
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const adminId = await getAdminId();
  if (!adminId) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;

  let data;
  try {
    data = updateRoleSchema.parse(await req.json());
  } catch {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }

  // Prevent admin from removing their own admin role
  if (id === adminId && data.role === "USER") {
    return NextResponse.json(
      { error: "Cannot remove your own admin role" },
      { status: 400 }
    );
  }

  await prisma.user.update({
    where: { id },
    data: { role: data.role },
  });

  await prisma.adminLog.create({
    data: {
      adminId,
      action: "TOGGLE_ROLE",
      targetId: id,
      details: JSON.stringify({ newRole: data.role }),
    },
  });

  return NextResponse.json({ success: true });
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const adminId = await getAdminId();
  if (!adminId) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;

  // Prevent admin from deleting themselves
  if (id === adminId) {
    return NextResponse.json(
      { error: "Cannot delete your own account" },
      { status: 400 }
    );
  }

  try {
    const targetUser = await prisma.user.findUnique({
      where: { id },
      select: { name: true, email: true },
    });
    await prisma.user.delete({ where: { id } });
    await prisma.adminLog.create({
      data: {
        adminId,
        action: "DELETE_USER",
        targetId: id,
        details: JSON.stringify({ name: targetUser?.name, email: targetUser?.email }),
      },
    });
  } catch {
    return NextResponse.json(
      { error: "Cannot delete user with existing data" },
      { status: 400 }
    );
  }

  return NextResponse.json({ success: true });
}
