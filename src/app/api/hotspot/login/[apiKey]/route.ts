import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateTemplateHTML } from "@/lib/login-templates";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ apiKey: string }> }
) {
  try {
  const { apiKey } = await params;

  const router = await prisma.router.findUnique({
    where: { apiKey },
    select: {
      loginPageHtml: true,
      loginPageCss: true,
      loginPageTemplate: true,
      loginPageTitle: true,
      loginPageLogo: true,
    },
  });

  if (!router) {
    return new NextResponse("Not Found", { status: 404 });
  }

  let fullHtml: string;

  if (router.loginPageHtml) {
    // Use custom/saved HTML + CSS
    const css = router.loginPageCss || "";
    fullHtml = router.loginPageHtml.replace(
      "</head>",
      `<style>${css}</style></head>`
    );
  } else {
    // Generate from template
    const { html, css } = generateTemplateHTML(
      router.loginPageTemplate || "modern",
      router.loginPageTitle || "WiFi Hotspot",
      router.loginPageLogo
    );
    fullHtml = html.replace("</head>", `<style>${css}</style></head>`);
  }

  return new NextResponse(fullHtml, {
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "no-cache, no-store, must-revalidate",
    },
  });
  } catch {
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
