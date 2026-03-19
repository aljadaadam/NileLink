import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { decrypt, isEncrypted } from "@/lib/encryption";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ apiKey: string }> }
) {
  try {
    const { apiKey } = await params;

    if (!apiKey || !apiKey.startsWith("nl_")) {
      return new NextResponse("Not found", { status: 404 });
    }

    const router = await prisma.router.findUnique({
      where: { apiKey },
      select: { apiKey: true, port: true, password: true, username: true },
    });

    if (!router) {
      return new NextResponse("Not found", { status: 404 });
    }

    const password = isEncrypted(router.password)
      ? decrypt(router.password)
      : router.password;

    const username = router.username || "nilelink_user";
    const port = router.port || 8728;

    const script = generateRscScript(router.apiKey, port, username, password);

    return new NextResponse(script, {
      status: 200,
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Content-Disposition": 'attachment; filename="nilelink.rsc"',
        "Cache-Control": "no-store",
      },
    });
  } catch {
    return new NextResponse("Error", { status: 500 });
  }
}

function generateRscScript(
  apiKey: string,
  port: number,
  username: string,
  password: string
): string {
  return `# NileLink Auto-Setup
/ip service enable api
/ip service set api port=${port}
/user group add name=nilelink_group policy=api,read,write,test,!ftp,!local,!telnet,!ssh,!reboot,!policy,!winbox,!password,!web,!sniff,!sensitive,!romon,!rest-api
/user add name=${username} password="${password}" group=nilelink_group comment="NileLink"
/ip hotspot walled-garden ip add dst-host=nilelink.net action=accept comment="NileLink"
/tool fetch url="https://nilelink.net/api/hotspot/login/${apiKey}" dst-path="hotspot/login.html"
:do { /ip cloud set ddns-enabled=yes } on-error={}
:delay 3s
:local dnsName ""
:do { :set dnsName [/ip cloud get dns-name] } on-error={}
:local phoneUrl "https://nilelink.net/api/routers/phonehome\\?key=${apiKey}"
:if ([:len \$dnsName] > 0) do={ :set phoneUrl (\$phoneUrl . "&dns=" . \$dnsName) }
/tool fetch url=\$phoneUrl keep-result=no
/system scheduler add name=nilelink_phonehome interval=1m on-event=":local d \\\"\\\";:do {:set d [/ip cloud get dns-name]} on-error={};:local u \\\"https://nilelink.net/api/routers/phonehome\\\\?key=${apiKey}\\\";:if ([:len \\\$d] > 0) do={:set u (\\\$u . \\\"&dns=\\\" . \\\$d)};/tool fetch url=\\\$u keep-result=no" comment="NileLink heartbeat"
`;
}
