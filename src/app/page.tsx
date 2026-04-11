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

      {/* All Products Section - Horizontal Swipe on Mobile */}
      <section id="all-products" className="py-8 md:py-16 px-0 md:px-12 bg-alabaster overflow-hidden">
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
                      ? "bg-[#D4AF37] text-black border-[#D4AF37]" 
                      : "bg-[#111] text-white/60 border-transparent hover:border-[#D4AF37] hover:text-[#D4AF37]"
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
                      ? "bg-[#D4AF37] text-black border-[#D4AF37]" 
                      : "bg-[#111] text-white/60 border-transparent hover:border-[#D4AF37] hover:text-[#D4AF37]"
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
        <section key={category} className="py-8 md:py-16 px-6 md:px-12 bg-[#0A0A0A] border-t border-white/5">
          <div className="container mx-auto">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 md:mb-16 gap-6">
                <div>
                  <h2 className="text-2xl md:text-3xl font-sans font-bold tracking-tighter text-obsidian uppercase">{category}</h2>
                  <div className="h-0.5 w-12 bg-obsidian/20 mt-4"></div>
                </div>
                
                <div className="flex items-center gap-6">
                  <button 
                    onClick={() => setShowImportedOnly(!showImportedOnly)}
                    className={`shrink-0 text-[10px] px-4 py-2 rounded-full border transition-all uppercase tracking-widest ${
                      showImportedOnly 
                      ? "bg-[#ff4d4f] text-white border-[#ff4d4f]" 
                      : "bg-transparent text-[#ff4d4f] border-[#ff4d4f]/30 hover:border-[#ff4d4f]"
                    }`}
                  >
                    {showImportedOnly ? "Imported Only" : "Imported"}
                  </button>

                  <Link 
                    href={`/catalog?category=${encodeURIComponent(category)}${showImportedOnly ? '&imported=true' : ''}`}
                    className="group flex flex-col items-center gap-1.5 text-[10px] md:text-xs font-sans font-bold uppercase tracking-[0.2em] text-obsidian/60 hover:text-obsidian transition-colors"
                  >
                    <div className="w-10 h-10 rounded-full border border-obsidian/20 flex items-center justify-center group-hover:bg-obsidian group-hover:text-white transition-colors">
                      <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                    </div>
                    <span>View All</span>
                  </Link>
                </div>
              </div>

            <ProductSlider 
              products={filteredProducts.filter(p => p.category === category)} 
            />
          </div>
        </section>
      ))}

      {/* Brand Journal Section - B&W Minimalist (Moved here) */}
      <section id="about" className="bg-[#FAFAFA] text-[#0A0A0A] py-16 md:py-24 overflow-hidden mt-12 border-t border-obsidian/5">
        <div className="container mx-auto px-6 md:px-12">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-24 items-center">
            <div className="animate-reveal">
              <span className="text-[10px] uppercase tracking-[0.4em] text-[#0A0A0A]/40 block mb-6">The Journal — Issue 01</span>
              <h2 className="text-3xl md:text-5xl font-serif leading-tight italic max-w-lg">
                &quot;Modern elegance is not about what you add, but what you have the courage to leave behind.&quot;
              </h2>
            </div>
            <div className="space-y-8 animate-reveal delay-200">
              <p className="font-sans font-light text-sm md:text-base leading-relaxed text-[#0A0A0A]/70 max-w-md">
                Trendy Glitterz isn&apos;t just about jewelry. It&apos;s about the confidence that comes with feeling perfectly accessorized. Founded in 2024, Trendy Glitterz is more than an accessory brand—it&apos;s a dialogue between form and functionality.
              </p>
              <div className="flex flex-col gap-6">
                <div className="flex items-center gap-6">
                  <Link href="#" className="text-[11px] font-sans font-bold uppercase tracking-[0.2em] border-b border-[#0A0A0A] pb-1 hover:text-[#0A0A0A]/60 hover:border-[#0A0A0A]/60 transition-all">
                    Our Philosophy
                  </Link>
                  <div className="h-px w-8 bg-[#0A0A0A]/20"></div>
                  <span className="text-[10px] font-mono text-[#0A0A0A]/30 uppercase tracking-[0.2em]">Crafted with Intention</span>
                </div>
                
                <a href="https://wa.me/something" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-3 text-sm font-sans font-medium text-[#25D366] hover:text-[#128C7E] transition-colors w-fit border border-[#25D366]/30 px-5 py-2.5 rounded-full hover:bg-[#25D366]/5">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 1.927 6.541L0 24l5.602-1.464A11.9 11.9 0 0 0 11.944 24c6.627 0 12-5.373 12-12S18.571 0 11.944 0zm6.208 17.202c-.237.669-1.391 1.25-1.95 1.341-.561.092-1.282.261-4.041-.884-3.32-1.378-5.46-4.786-5.626-5.008-.165-.224-1.343-1.785-1.343-3.407 0-1.623.844-2.427 1.144-2.738.297-.311.642-.39.856-.39.213 0 .428 0 .605.008.2.012.463-.075.725.556.264.634.856 2.086.936 2.247.076.161.127.351.018.572-.11.222-.165.35-.331.545-.164.195-.349.421-.493.571-.164.168-.344.351-.15.688.194.335.867 1.433 1.867 2.327 1.287 1.155 2.368 1.503 2.697 1.666.329.162.521.144.717-.08.196-.226.843-.984 1.07-1.32.228-.337.457-.282.75-.17.294.113 1.859.877 2.174 1.034.316.158.528.236.603.368.077.133.077.768-.16 1.437z"/>
                  </svg>
                  Connect on WhatsApp
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
