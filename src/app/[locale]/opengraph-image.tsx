import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "NileLink — MikroTik Hotspot Management Platform";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const isAr = locale === "ar";

  const title = isAr
    ? "NileLink"
    : "NileLink";
  const subtitle = isAr
    ? "منصة إدارة هوت سبوت مايكروتك"
    : "MikroTik Hotspot Management";
  const tagline = isAr
    ? "أسهل ربط للمايكروتيك · نظام وكلاء متكامل · لوحة تحكم ذكية"
    : "Easiest MikroTik Setup · Reseller System · Smart Dashboard";

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #0c4a6e 0%, #0369a1 40%, #0ea5e9 100%)",
          fontFamily: "sans-serif",
          position: "relative",
        }}
      >
        {/* Grid pattern overlay */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            opacity: 0.08,
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.3) 1px, transparent 1px)",
            backgroundSize: "40px 40px",
            display: "flex",
          }}
        />

        {/* WiFi icon */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: 80,
            height: 80,
            borderRadius: 20,
            backgroundColor: "rgba(255,255,255,0.15)",
            marginBottom: 24,
          }}
        >
          <svg
            width="48"
            height="48"
            viewBox="0 0 32 32"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M16 8a8 8 0 0 1 8 8"
              stroke="white"
              strokeWidth="3"
              strokeLinecap="round"
            />
            <path
              d="M16 12a4 4 0 0 1 4 4"
              stroke="white"
              strokeWidth="3"
              strokeLinecap="round"
            />
            <circle cx="16" cy="16" r="2" fill="white" />
          </svg>
        </div>

        {/* Title */}
        <div
          style={{
            fontSize: 72,
            fontWeight: 700,
            color: "white",
            letterSpacing: "-2px",
            display: "flex",
          }}
        >
          {title}
        </div>

        {/* Subtitle */}
        <div
          style={{
            fontSize: 32,
            fontWeight: 500,
            color: "rgba(255,255,255,0.9)",
            marginTop: 8,
            display: "flex",
            direction: isAr ? "rtl" : "ltr",
          }}
        >
          {subtitle}
        </div>

        {/* Tagline */}
        <div
          style={{
            fontSize: 20,
            color: "rgba(255,255,255,0.7)",
            marginTop: 24,
            display: "flex",
            direction: isAr ? "rtl" : "ltr",
          }}
        >
          {tagline}
        </div>

        {/* Bottom bar */}
        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            height: 6,
            background: "linear-gradient(90deg, #06b6d4, #0ea5e9, #38bdf8)",
            display: "flex",
          }}
        />
      </div>
    ),
    { ...size }
  );
}
