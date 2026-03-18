import { NextRequest, NextResponse } from "next/server";
import { auth, requireActiveSubscription } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { randomBytes } from "crypto";

// Generate a MikroTik setup script for a specific router
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const subError = await requireActiveSubscription(session.user.id);
    if (subError) return subError;

    const { id } = await params;

    const router = await prisma.router.findFirst({
      where: { id, userId: session.user.id },
      select: { id: true, apiKey: true, port: true },
    });

    if (!router) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const password = randomBytes(16).toString("hex");
    const script = generateMikroTikScript(router.apiKey, router.port, password);

    return NextResponse.json({
      script,
      credentials: {
        username: "nilelink_user",
        password,
        port: router.port,
      },
    });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

function generateMikroTikScript(apiKey: string, port: number, password: string): string {
  return `# ═══════════════════════════════════════════════════════
# NileLink Auto-Setup Script
# Paste this into your MikroTik Terminal — we handle the rest
# ═══════════════════════════════════════════════════════

# Step 1: Enable API service on port ${port}
/ip service enable api
/ip service set api port=${port}

# Step 2: Create dedicated NileLink API user
/user group add name=nilelink_group policy=api,read,write,test,!ftp,!local,!telnet,!ssh,!reboot,!policy,!winbox,!password,!web,!sniff,!sensitive,!romon,!rest-api
/user add name=nilelink_user password="${password}" group=nilelink_group comment="NileLink — do not delete"

# Step 3: Allow NileLink through Walled Garden
/ip hotspot walled-garden ip
add dst-host=nilelink.net action=accept comment="NileLink"

# Step 4: Download login page
/tool fetch url="https://nilelink.net/api/hotspot/login/${apiKey}" dst-path="hotspot/login.html"

# Step 5: Auto-register — detect Cloud DNS and phone home
:do { /ip cloud set ddns-enabled=yes } on-error={}
:delay 3s
:local dnsName ""
:do { :set dnsName [/ip cloud get dns-name] } on-error={}
:local phoneUrl "https://nilelink.net/api/routers/phonehome?key=${apiKey}"
:if ([:len \$dnsName] > 0) do={ :set phoneUrl (\$phoneUrl . "&dns=" . \$dnsName) }
/tool fetch url=\$phoneUrl keep-result=no
/system scheduler add name=nilelink_phonehome interval=1m on-event=":local d \\\"\\\";:do {:set d [/ip cloud get dns-name]} on-error={};:local u \\\"https://nilelink.net/api/routers/phonehome?key=${apiKey}\\\";:if ([:len \\\$d] > 0) do={:set u (\\\$u . \\\"&dns=\\\" . \\\$d)};/tool fetch url=\\\$u keep-result=no" comment="NileLink heartbeat — do not delete"

# Done! NileLink will detect this router automatically.
`;
}
