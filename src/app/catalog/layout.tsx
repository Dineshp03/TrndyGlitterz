import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Shop All Collections",
  description: "Browse our complete catalog of luxury earrings, necklaces, bracelets, and more. Find the perfect accessory for any occasion.",
  openGraph: {
    title: "Catalog | TRENDY GLITTERZ",
    description: "Explore the full Trendy Glitterz collection. Luxury accessories curated for modern elegance.",
  },
};

export default function CatalogLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
