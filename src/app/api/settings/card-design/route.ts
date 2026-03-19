import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const design = await prisma.cardDesign.findUnique({
    where: { userId: session.user.id },
  });

  return NextResponse.json(design || {});
}

const MAX_IMAGE_SIZE = 500_000; // ~500KB base64

export async function PUT(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();

  // Validate image sizes
  if (body.logo && body.logo.length > MAX_IMAGE_SIZE) {
    return NextResponse.json({ error: "Logo too large" }, { status: 400 });
  }
  if (body.backgroundImage && body.backgroundImage.length > MAX_IMAGE_SIZE) {
    return NextResponse.json({ error: "Background too large" }, { status: 400 });
  }

  // Validate color format
  const colorFields = ["backgroundColor", "gradientTo", "borderColor", "codeColor", "brandColor", "footerColor"];
  for (const field of colorFields) {
    if (body[field] && !/^#[0-9a-fA-F]{6}$/.test(body[field])) {
      return NextResponse.json({ error: `Invalid ${field}` }, { status: 400 });
    }
  }

  const data = {
    logo: body.logo || null,
    backgroundImage: body.backgroundImage || null,
    backgroundColor: body.backgroundColor || "#f0fdfa",
    gradientTo: body.gradientTo || "#ecfeff",
    borderColor: body.borderColor || "#0891b2",
    codeColor: body.codeColor || "#0e7490",
    brandText: typeof body.brandText === "string" ? body.brandText.slice(0, 100) : "NileLink WiFi",
    brandColor: body.brandColor || "#64748b",
    footerText: typeof body.footerText === "string" ? body.footerText.slice(0, 200) : null,
    footerColor: body.footerColor || "#94a3b8",
    showPrice: body.showPrice !== false,
    showPackage: body.showPackage !== false,
    showQr: body.showQr !== false,
  };

  const design = await prisma.cardDesign.upsert({
    where: { userId: session.user.id },
    create: { userId: session.user.id, ...data },
    update: data,
  });

  return NextResponse.json(design);
}
