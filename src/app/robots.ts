import { MetadataRoute } from "next";
import { siteConfig } from "@/lib/metadata-config";

export const dynamic = 'force-static';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin/", "/profile/", "/api/"],
    },
    sitemap: `${siteConfig.url}/sitemap.xml`,
  };
}
