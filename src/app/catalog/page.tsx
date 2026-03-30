"use client";

import { useSearchParams } from "next/navigation";
import { useProductStore } from "@/store/useProductStore";
import ProductCard from "@/components/ProductCard";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Suspense, useState, useMemo } from "react";

function CatalogContent() {
  const searchParams = useSearchParams();
  const initialCategory = searchParams.get("category");
  const initialImported = searchParams.get("imported") === "true";
  const [selectedCategory, setSelectedCategory] = useState<string | null>(initialCategory);
  const [showImportedOnly, setShowImportedOnly] = useState(initialImported);
  
  const { products, categories } = useProductStore();

  const filteredProducts = useMemo(() => {
    let items = products;
    if (selectedCategory) {
      items = items.filter(p => p.category === selectedCategory);
    }
    if (showImportedOnly) {
      items = items.filter(p => p.isImported);
    }
    return items;
  }, [selectedCategory, showImportedOnly, products]);

  return (
    <div className="min-h-screen bg-alabaster pt-32 pb-24 px-6 md:px-12">
      <div className="container mx-auto">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6 border-b border-obsidian/10 pb-8">
          <div>
            <Link 
              href="/" 
              className="inline-flex items-center gap-2 text-[10px] font-sans uppercase tracking-[0.2em] text-obsidian/40 hover:text-obsidian transition-colors mb-6 group"
            >
              <ArrowLeft className="w-3 h-3 group-hover:-translate-x-1 transition-transform" />
              Back to Home
            </Link>
            <h1 className="text-4xl md:text-6xl font-serif text-obsidian tracking-tighter">
              {selectedCategory || "Full Collection"}
            </h1>
            <p className="mt-4 text-xs md:text-sm text-obsidian/60 font-sans tracking-widest uppercase">
              {filteredProducts.length} Pieces found
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <button 
              onClick={() => setSelectedCategory(null)}
              className={`px-4 py-2 rounded-full text-[10px] font-sans uppercase tracking-[0.1em] border transition-all duration-300 ${!selectedCategory ? 'bg-dustyrose text-alabaster border-dustyrose' : 'bg-transparent text-obsidian/60 border-obsidian/10 hover:border-obsidian'}`}
            >
              All
            </button>
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-full text-[10px] font-sans uppercase tracking-[0.1em] border transition-all duration-300 ${selectedCategory === cat ? 'bg-dustyrose text-alabaster border-dustyrose' : 'bg-transparent text-obsidian/60 border-obsidian/10 hover:border-obsidian'}`}
              >
                {cat}
              </button>
            ))}
            <div className="w-px h-8 bg-obsidian/10 mx-1"></div>
            <button
                onClick={() => setShowImportedOnly(!showImportedOnly)}
                className={`px-4 py-2 rounded-full text-[10px] font-sans uppercase tracking-[0.1em] border transition-all duration-300 ${showImportedOnly ? 'bg-blue-500 text-white border-blue-500 shadow-md' : 'bg-transparent text-blue-500 border-blue-100 hover:border-blue-300'}`}
              >
                {showImportedOnly ? 'Showing Imported' : 'Imported Only'}
              </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-12">
          {filteredProducts.map((product, index) => (
            <div 
              key={product.id} 
              className="animate-reveal"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <ProductCard product={product} />
            </div>
          ))}
        </div>
        
        {filteredProducts.length === 0 && (
          <div className="py-24 text-center">
            <p className="font-serif text-2xl text-obsidian/30 italic">No products found in this category.</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default function CatalogPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-alabaster flex items-center justify-center font-serif text-2xl italic text-obsidian/20 animate-pulse">Loading Collection...</div>}>
      <CatalogContent />
    </Suspense>
  );
}
