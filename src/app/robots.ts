import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/api/",
          "/manage-nl7x9k2p/",
          "/nileadmin-p8x2k/",
          "/auth/verify-email",
        ],
      },
    ],
    sitemap: "https://nilelink.net/sitemap.xml",
  };
}
