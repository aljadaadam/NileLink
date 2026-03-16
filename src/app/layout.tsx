import type { Metadata } from "next";
import "./globals.css";

const SITE_URL = "https://nilelink.net";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "NileLink — MikroTik Hotspot Management Platform",
    template: "%s | NileLink",
  },
  description:
    "The #1 SaaS platform to manage MikroTik hotspot networks. Generate WiFi vouchers, create packages, control users, and monitor routers — all from one dashboard.",
  keywords: [
    "MikroTik",
    "hotspot management",
    "WiFi management",
    "voucher system",
    "MikroTik hotspot",
    "WiFi voucher generator",
    "hotspot billing",
    "MikroTik dashboard",
    "WiFi network management",
    "hotspot portal",
    "captive portal",
    "internet cafe management",
    "hotel WiFi",
    "NileLink",
    "إدارة شبكات واي فاي",
    "أكواد واي فاي",
    "إدارة هوت سبوت",
    "مايكروتك",
    "باقات إنترنت",
  ],
  authors: [{ name: "NileLink" }],
  creator: "NileLink",
  publisher: "NileLink",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    alternateLocale: "ar_EG",
    url: SITE_URL,
    siteName: "NileLink",
    title: "NileLink — MikroTik Hotspot Management Platform",
    description:
      "Manage MikroTik hotspot networks, generate WiFi vouchers, create packages, and monitor routers from one powerful dashboard.",
  },
  twitter: {
    card: "summary_large_image",
    title: "NileLink — MikroTik Hotspot Management",
    description:
      "The #1 platform to manage MikroTik hotspot networks. Generate vouchers, control users, and monitor routers.",
  },
  alternates: {
    canonical: SITE_URL,
    languages: {
      en: `${SITE_URL}/en`,
      ar: `${SITE_URL}/ar`,
    },
  },
  category: "technology",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
