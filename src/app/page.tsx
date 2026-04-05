"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useProductStore } from "@/store/useProductStore";
import ProductSlider from "@/components/ProductSlider";
import { Search, ShoppingBag, X, Menu, Gem, ArrowUpRight } from "lucide-react";
import HeroSection from "@/components/HeroSection";
import SmoothScroll from "@/components/SmoothScroll";
import { Testimonials } from "@/components/ui/demo";

export default function Home() {
  const [mounted, setMounted] = useState(false);
  const [showImportedOnly, setShowImportedOnly] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const { products, syncWithInitial } = useProductStore();

  const scrollToProducts = () => {
    const el = document.getElementById('all-products');
    if (el) {
      const yOffset = -100;
      const y = el.getBoundingClientRect().top + window.scrollY + yOffset;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  };

  const filteredProducts = showImportedOnly ? products.filter(p => p.isImported) : products;

  // Category Ordering: Earrings first, then rest
  const allCategories = Array.from(new Set(filteredProducts.map(p => p.category).filter(Boolean)));
  const sortedCategories = allCategories.sort((a, b) => {
    if (a.toLowerCase() === "earrings") return -1;
    if (b.toLowerCase() === "earrings") return 1;
    return a.localeCompare(b);
  });

  // Sort products: Uncategorized at the last
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    if ((!a.category || a.category === "Uncategorized") && (b.category && b.category !== "Uncategorized")) return 1;
    if ((a.category && a.category !== "Uncategorized") && (!b.category || b.category === "Uncategorized")) return -1;
    return 0;
  });

  // Products specifically for the ALL COLLECTIONS slider
  const displayProducts = selectedCategory 
    ? sortedProducts.filter(p => p.category === selectedCategory) 
    : sortedProducts;

  useEffect(() => {
    setMounted(true);
    if (products.length === 0) {
      syncWithInitial();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  
  if (!mounted) return null;

  return (
    <div className="flex flex-col min-h-screen bg-alabaster">
      <SmoothScroll />
      
      <HeroSection onStartShopping={scrollToProducts} />

      {/* Brand Journal Section - B&W Minimalist */}
      <section id="about" className="bg-obsidian text-alabaster py-16 md:py-24 overflow-hidden">
        <div className="container mx-auto px-6 md:px-12">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-24 items-center">
            <div className="animate-reveal">
              <span className="text-[10px] uppercase tracking-[0.4em] text-white/40 block mb-6">The Journal — Issue 01</span>
              <h2 className="text-3xl md:text-5xl font-serif leading-tight italic max-w-lg">
                &quot;Modern elegance is not about what you add, but what you have the courage to leave behind.&quot;
              </h2>
            </div>
            <div className="space-y-8 animate-reveal delay-200">
              <p className="font-sans font-light text-sm md:text-base leading-relaxed text-white/70 max-w-md">
                Trendy Glitterz isn&apos;t just about jewelry. It&apos;s about the confidence that comes with feeling perfectly accessorized. Founded in 2024, Trendy Glitterz is more than an accessory brand—it&apos;s a dialogue between form and functionality.
              </p>
              <div className="flex items-center gap-6">
                <Link href="#" className="text-[11px] font-sans font-bold uppercase tracking-[0.2em] border-b border-white pb-1 hover:text-white/60 hover:border-white/60 transition-all">
                  Our Philosophy
                </Link>
                <div className="h-px w-8 bg-white/20"></div>
                <span className="text-[10px] font-mono text-white/30 uppercase tracking-[0.2em]">Crafted with Intention</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* All Products Section - Horizontal Swipe on Mobile */}
      <section id="all-products" className="py-8 md:py-16 px-0 md:px-12 bg-white overflow-hidden">
        <div className="container mx-auto px-4 md:px-0">
          
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 md:mb-16 gap-6 md:gap-8 border-b border-obsidian/10 pb-6 md:pb-8">
            <div className="w-full md:w-auto overflow-hidden">
              <h2 className="text-3xl md:text-5xl font-sans font-bold tracking-tighter text-obsidian uppercase">ALL COLLECTIONS</h2>
              <div className="flex flex-col md:flex-row md:items-center gap-4 mt-4 w-full">
                
                {/* Scrollable Category Filters & Imported Toggle */}
                <div className="flex items-center overflow-x-auto pb-4 md:pb-0 -mb-4 md:mb-0 scrollbar-hide w-full gap-2 snap-x">
                  <button 
                    onClick={() => setSelectedCategory(null)}
                    className={`shrink-0 snap-start text-[10px] px-4 py-2 rounded-full border transition-all uppercase tracking-widest ${
                      !selectedCategory 
                      ? "bg-obsidian text-white border-obsidian" 
                      : "bg-[#f3f3f3] text-obsidian/60 border-transparent hover:border-obsidian/10"
                    }`}
                  >
                    All
                  </button>
                  
                  {sortedCategories.map(cat => (
                    <button 
                      key={cat}
                      onClick={() => setSelectedCategory(cat)}
                      className={`shrink-0 snap-start text-[10px] px-4 py-2 rounded-full border transition-all uppercase tracking-widest ${
                        selectedCategory === cat
                        ? "bg-obsidian text-white border-obsidian" 
                        : "bg-[#f3f3f3] text-obsidian/60 border-transparent hover:border-obsidian/10"
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                  
                  <div className="w-px h-6 bg-obsidian/10 mx-1 shrink-0"></div>
                  
                  <button 
                    onClick={() => setShowImportedOnly(!showImportedOnly)}
                    className={`shrink-0 snap-start text-[10px] px-4 py-2 rounded-full border transition-all uppercase tracking-widest ${
                      showImportedOnly 
                      ? "bg-[#ff4d4f] text-white border-[#ff4d4f]" 
                      : "bg-transparent text-[#ff4d4f] border-[#ff4d4f]/30 hover:border-[#ff4d4f]"
                    }`}
                  >
                    {showImportedOnly ? "Imported Only" : "Imported"}
                  </button>
                </div>
              </div>
            </div>
            <p className="text-[10px] md:text-xs font-mono text-obsidian/40 uppercase tracking-widest shrink-0 hidden md:block">
              {displayProducts.length} ITEMS TOTAL
            </p>
          </div>

          <ProductSlider products={displayProducts} />
        </div>
      </section>

      {/* Category Wise Sections - Dynamic from Admin */}
      {sortedCategories.map((category) => (
        <section key={category} className="py-8 md:py-16 px-6 md:px-12 bg-alabaster border-t border-obsidian/5">
          <div className="container mx-auto">
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 md:mb-16 gap-4">
              <div className="flex items-center gap-6">
                <div>
                  <h2 className="text-2xl md:text-4xl font-sans font-bold tracking-tighter text-obsidian uppercase">{category}</h2>
                  <div className="h-0.5 w-12 bg-obsidian/20 mt-4"></div>
                </div>
                <div className={`text-[9px] px-2 py-0.5 rounded-full border border-blue-100 text-blue-500 font-mono tracking-tighter uppercase ${showImportedOnly ? 'opacity-100' : 'opacity-0'}`}>
                  Imported Edition
                </div>
              </div>
              
              <div className="flex items-center gap-6">
                <Link 
                  href={`/catalog?category=${encodeURIComponent(category)}${showImportedOnly ? '&imported=true' : ''}`}
                  className="group flex items-center gap-2 text-[10px] md:text-xs font-sans font-bold uppercase tracking-[0.2em] text-obsidian/60 hover:text-obsidian transition-colors"
                >
                  <span>View All</span>
                  <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                </Link>
              </div>
            </div>

            <ProductSlider 
              products={filteredProducts.filter(p => p.category === category)} 
            />
          </div>
        </section>
      ))}

      <Testimonials />
    </div>
  );
}
