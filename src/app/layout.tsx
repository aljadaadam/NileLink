import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "NileLink — MikroTik Hotspot Management",
  description:
    "A powerful SaaS platform to manage MikroTik hotspot networks, generate vouchers, and control WiFi users.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
