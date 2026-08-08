import { Metadata } from "next";
import ProductDetailClient from "./ProductDetailClient";
import { siteConfig } from "@/lib/metadata-config";
import { createAdminSupabaseClient } from "@/lib/supabase-server";
import { Product, products as staticProducts } from "@/data/products";

async function getProduct(id: string): Promise<Product | null> {
  try {
    const supabase = createAdminSupabaseClient();
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .eq("id", id)
      .single();

    if (!error && data) {
      return {
        id: data.id,
        name: data.name,
        price: data.price,
        category: data.category,
        image: data.image,
        images: data.images || [],
        description: data.description,
        stock: data.stock,
        featured: data.featured,
        isImported: data.is_imported,
        oldPrice: data.old_price,
      };
    }
  } catch (error) {
    console.error("Error fetching product from Supabase:", error);
  }

  // Fallback to static products list
  const fallback = staticProducts.find((p) => p.id === id);
  return fallback || null;
}

export async function generateStaticParams() {
  try {
    const supabase = createAdminSupabaseClient();
    const { data } = await supabase.from("products").select("id");
    return (data || []).map((p) => ({ id: p.id }));
  } catch (e) {
    console.error("generateStaticParams error:", e);
    return [];
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const product = await getProduct(id);

  if (!product) {
    return {
      title: "Product Not Found",
    };
  }

  return {
    title: product.name,
    description: product.description,
    openGraph: {
      title: product.name,
      description: product.description,
      images: [
        {
          url: product.image,
          alt: product.name,
        },
      ],
      type: "article",
    },
    twitter: {
      card: "summary_large_image",
      title: product.name,
      description: product.description,
      images: [product.image],
    },
  };
}

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const product = await getProduct(id);

  const jsonLd = product ? {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": product.name,
    "image": product.image,
    "description": product.description,
    "brand": {
      "@type": "Brand",
      "name": siteConfig.name
    },
    "offers": {
      "@type": "Offer",
      "url": `${siteConfig.url}/product/${product.id}`,
      "priceCurrency": "INR",
      "price": product.price,
      "availability": product.stock && product.stock > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock"
    }
  } : null;

  return (
    <>
      {jsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      )}
      <ProductDetailClient initialProduct={product || undefined} />
    </>
  );
}
