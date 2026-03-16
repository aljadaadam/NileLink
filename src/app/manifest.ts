import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "NileLink — MikroTik Hotspot Management",
    short_name: "NileLink",
    description:
      "Manage MikroTik hotspot networks, generate WiFi vouchers, and control users from one dashboard.",
    start_url: "/",
    display: "standalone",
    background_color: "#f8fafc",
    theme_color: "#0369a1",
    icons: [
      {
        src: "/icon.svg",
        sizes: "any",
        type: "image/svg+xml",
      },
    ],
  };
}
