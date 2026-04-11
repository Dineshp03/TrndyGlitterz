import { MetadataRoute } from "next";
import { siteConfig } from "@/lib/metadata-config";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Fetch products to include in sitemap
  let products = [];
  try {
    const res = await fetch(`${siteConfig.url}/api/products`);
    const data = await res.json();
    products = data.products || [];
  } catch (error) {
    console.error("Sitemap fetch error:", error);
  }

  const productUrls = products.map((product: any) => ({
    url: `${siteConfig.url}/product/${product.id}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));

  return [
    {
      url: siteConfig.url,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: `${siteConfig.url}/catalog`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
    ...productUrls,
  ];
}
