"use client";

import Link from "next/link";
import { useState, useEffect, Suspense } from "react";
import { useProductStore } from "@/store/useProductStore";
import ProductSlider from "@/components/ProductSlider";
import ProductCard from "@/components/ProductCard";
import { Search, ShoppingBag, X, Menu, Gem, ArrowUpRight, Instagram } from "lucide-react";
import HeroSection from "@/components/HeroSection";
import { Testimonials } from "@/components/ui/demo";
import { useSettingsStore } from "@/store/useSettingsStore";
import { useRouter, useSearchParams } from "next/navigation";

// Fixed category filters matching the menu structure
const CATEGORY_FILTERS = [
  { label: "Xuping Exclusive", categories: ["Xuping Earrings", "Xuping Neckpiece", "Xuping Bracelets", "Xuping Finger Rings"] },
  { label: "Korean Earrings",  categories: ["Korean Earrings"] },
  { label: "Neckpiece",        categories: ["Neckpiece"] },
  { label: "Bracelets",        categories: ["Bracelets"] },
  { label: "Finger Rings",     categories: ["Finger Rings"] },
  { label: "Hair Accessories", categories: ["Hair Accessories"] },
];

function HomeContent() {
  const [mounted, setMounted] = useState(false);
  const { products, syncWithInitial } = useProductStore();
  const settings = useSettingsStore();
  const router = useRouter();
  const searchParams = useSearchParams();

  // Read collection filter reactively from URL — this updates on back/forward navigation
  const collectionParam = searchParams.get("collection");
  const selectedCategory = collectionParam || null;

  const setSelectedCategory = (category: string | null) => {
    if (category) {
      router.replace(`/?collection=${encodeURIComponent(category)}`, { scroll: false });
    } else {
      router.replace("/", { scroll: false });
    }
  };

  const scrollToProducts = () => {
    const el = document.getElementById('all-products');
    if (el) {
      const yOffset = -100;
      const y = el.getBoundingClientRect().top + window.scrollY + yOffset;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  };

  const filteredProducts = products;

  // Sort products: Uncategorized at the last
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    if ((!a.category || a.category === "Uncategorized") && (b.category && b.category !== "Uncategorized")) return 1;
    if ((a.category && a.category !== "Uncategorized") && (!b.category || b.category === "Uncategorized")) return -1;
    return 0;
  });

  // Products for the ALL COLLECTIONS slider — filter by selected category group
  const displayProducts = selectedCategory
    ? (() => {
        const filter = CATEGORY_FILTERS.find(f => f.label === selectedCategory);
        if (filter) {
          const lowerFilterCategories = filter.categories.map(c => c.toLowerCase());
          return sortedProducts.filter(p => lowerFilterCategories.includes((p.category ?? "").toLowerCase()));
        }
        return sortedProducts;
      })()
    : sortedProducts;

  let newArrivals = sortedProducts.filter(p => {
    if (!p.createdAt) return false;
    const diffTime = Math.abs(new Date().getTime() - new Date(p.createdAt).getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
    return diffDays <= 30;
  });

  // Fallback: If no products were added in the last 30 days, show the 8 most recently created products
  if (newArrivals.length === 0 && sortedProducts.length > 0) {
    newArrivals = [...sortedProducts]
      .filter(p => p.createdAt)
      .sort((a, b) => new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime())
      .slice(0, 8);
  }

  const showNewArrivals = newArrivals.length > 0 && settings.newBadgeEnabled;

  useEffect(() => {
    setMounted(true);
    syncWithInitial();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Scroll to ALL COLLECTIONS section when collection param is present (including on back navigation)
  useEffect(() => {
    if (!mounted) return;
    if (collectionParam) {
      setTimeout(() => {
        const el = document.getElementById("all-products");
        if (el) {
          el.scrollIntoView({ behavior: "smooth" });
        }
      }, 100);
    }
  }, [collectionParam, mounted]);

  if (!mounted) {
    return <div className="min-h-screen bg-alabaster" />;
  }

  return (
    <div className="flex flex-col min-h-screen bg-alabaster">
      <HeroSection 
        onStartShopping={scrollToProducts} 
        hasNewArrivals={showNewArrivals} 
        productCount={products.length}
      />

      {/* New Arrivals Section */}
      {showNewArrivals && (
        <section id="new-arrivals" className="py-8 md:py-16 px-0 md:px-12 bg-[#0A0A0A] overflow-hidden">
          <div className="container mx-auto px-4 md:px-0">
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 md:mb-16 gap-6 md:gap-8 border-b border-obsidian/10 pb-6 md:pb-8">
              <div className="w-full md:w-auto overflow-hidden">
                <h2 className="text-3xl md:text-5xl font-sans font-bold tracking-tighter uppercase mb-2" style={{
                  background: "linear-gradient(to right, #BF953F 0%, #FCF6BA 30%, #B38728 55%, #FBF5B7 80%, #BF953F 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}>NEW ARRIVALS</h2>
                <div className="flex flex-col md:flex-row md:items-center gap-4 mt-4 w-full">
                   <p className="text-sm font-sans text-obsidian/60 tracking-wider">Discover our latest pieces, sparkling for the first time.</p>
                </div>
              </div>
            </div>
            <ProductSlider products={newArrivals} mobileSwipe={true} autoPlay={true} />
          </div>
        </section>
      )}

      {/* All Products Section - Horizontal Swipe on Mobile */}
      <section id="all-products" className="py-8 md:py-16 px-0 md:px-12 bg-alabaster overflow-hidden">
        <div className="container mx-auto px-4 md:px-0">
          
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 md:mb-16 gap-6 md:gap-8 border-b border-obsidian/10 pb-6 md:pb-8">
            <div className="w-full md:w-auto overflow-hidden">
              <h2 className="text-3xl md:text-5xl font-sans font-bold tracking-tighter uppercase mb-2" style={{
                background: "linear-gradient(to right, #BF953F 0%, #FCF6BA 30%, #B38728 55%, #FBF5B7 80%, #BF953F 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}>ALL COLLECTIONS</h2>
              <div className="flex flex-col md:flex-row md:items-center gap-4 mt-4 w-full">
                
                {/* Scrollable Category Filters & Imported Toggle */}
                <div className="flex items-center overflow-x-auto pb-4 md:pb-0 -mb-4 md:mb-0 scrollbar-hide w-full gap-2 snap-x">
                  {/* ALL */}
                  <button 
                    onClick={() => setSelectedCategory(null)}
                    className={`shrink-0 snap-start text-[10px] px-4 py-2 rounded-full border transition-all uppercase tracking-widest ${
                      !selectedCategory 
                      ? "bg-[#D4AF37] text-black border-[#D4AF37]" 
                      : "bg-[#111] text-white/60 border-transparent hover:border-[#D4AF37] hover:text-[#D4AF37]"
                    }`}
                  >
                    All
                  </button>

                  {/* Fixed category pills from menu */}
                  {CATEGORY_FILTERS.map(filter => (
                    <button 
                      key={filter.label}
                      onClick={() => setSelectedCategory(filter.label)}
                      className={`shrink-0 snap-start text-[10px] px-4 py-2 rounded-full border transition-all uppercase tracking-widest ${
                        selectedCategory === filter.label
                        ? "bg-[#D4AF37] text-black border-[#D4AF37]" 
                        : "bg-[#111] text-[#FAFAFA]/70 border-transparent hover:border-[#D4AF37] hover:text-[#D4AF37]"
                      }`}
                    >
                      {filter.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Item count — shown on mobile below filters, on desktop inline */}
            <p className="text-[10px] font-mono text-obsidian/40 uppercase tracking-widest shrink-0 mt-2 md:hidden">
              {displayProducts.length} items
            </p>
            <p className="text-[10px] md:text-xs font-mono text-obsidian/40 uppercase tracking-widest shrink-0 hidden md:block">
              {displayProducts.length} ITEMS TOTAL
            </p>
          </div>

          {selectedCategory ? (
            <div className="grid grid-cols-2 sm:grid-cols-[repeat(auto-fill,minmax(175px,1fr))] gap-x-4 md:gap-x-4 gap-y-8 md:gap-y-7 px-0 transition-opacity duration-500 ease-in-out">
              {displayProducts.map((product, index) => (
                <div
                  key={product.id}
                  className="animate-reveal"
                  style={{ animationDelay: `${index * 40}ms` }}
                >
                  <ProductCard product={product} />
                </div>
              ))}
            </div>
          ) : (
            <ProductSlider products={displayProducts} />
          )}
        </div>
      </section>


      {/* Brand Journal Section - Premium Dark Theme */}
      <section id="about" className="bg-[#121212] text-[#FAFAFA] py-16 md:py-24 overflow-hidden mt-12 border-t border-white/5">
        <div className="container mx-auto px-6 md:px-12">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-24 items-center">
            <div className="animate-reveal">

              <h2 className="text-3xl md:text-5xl font-serif leading-tight italic max-w-lg" style={{
                background: "linear-gradient(to right, #BF953F 0%, #FCF6BA 30%, #B38728 55%, #FBF5B7 80%, #BF953F 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}>
                &quot;Trendyglitterz – Where every sparkle tells a story.&quot;
              </h2>
            </div>
            <div className="space-y-8 animate-reveal delay-200">
              <p className="font-sans font-light text-sm md:text-base leading-relaxed text-[#FAFAFA]/70 max-w-md">
                At Trendyglitterz, we&apos;ve been crafting stylish and elegant jewellery since 2021, bringing you pieces that blend trend and timeless beauty. Our passion lies in helping you shine with confidence through unique, high-quality designs made for every occasion.
              </p>
              <div className="pt-4 flex flex-col gap-4">
                <a href="https://wa.me/919884110778?text=Hi%20Trendy%20Glitterz!%20I'm%20reaching%20out%20from%20the%20website%20regarding%20some%20of%20your%20jewelry%20products." target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-3 text-sm font-sans font-medium text-[#25D366] hover:text-[#128C7E] transition-colors w-fit border border-[#25D366]/30 px-5 py-2.5 rounded-full hover:bg-[#25D366]/5">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 1.927 6.541L0 24l5.602-1.464A11.9 11.9 0 0 0 11.944 24c6.627 0 12-5.373 12-12S18.571 0 11.944 0zm6.208 17.202c-.237.669-1.391 1.25-1.95 1.341-.561.092-1.282.261-4.041-.884-3.32-1.378-5.46-4.786-5.626-5.008-.165-.224-1.343-1.785-1.343-3.407 0-1.623.844-2.427 1.144-2.738.297-.311.642-.39.856-.39.213 0 .428 0 .605.008.2.012.463-.075.725.556.264.634.856 2.086.936 2.247.076.161.127.351.018.572-.11.222-.165.35-.331.545-.164.195-.349.421-.493.571-.164.168-.344.351-.15.688.194.335.867 1.433 1.867 2.327 1.287 1.155 2.368 1.503 2.697 1.666.329.162.521.144.717-.08.196-.226.843-.984 1.07-1.32.228-.337.457-.282.75-.17.294.113 1.859.877 2.174 1.034.316.158.528.236.603.368.077.133.077.768-.16 1.437z"/>
                  </svg>
                  Connect on WhatsApp
                </a>
                
                <a href="https://www.instagram.com/trendyglitterz?igsh=MmRpanBnZ3NpOHhw" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-3 text-sm font-sans font-medium text-[#E4405F] hover:text-[#d62976] transition-colors w-fit border border-[#E4405F]/30 px-5 py-2.5 rounded-full hover:bg-[#E4405F]/5">
                  <Instagram size={18} />
                  Follow on Instagram
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Testimonials />
    </div>
  );
}

export default function Home() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-alabaster" />}>
      <HomeContent />
    </Suspense>
  );
}
