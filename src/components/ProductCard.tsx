"use client";

import Image from "next/image";
import Link from "next/link";
import { Product } from "@/data/products";

export default function ProductCard({ product }: { product: Product }) {
  return (
    <Link href={`/product/${product.id}`} className="group flex flex-col">
      {/* Image Container — image fills all the way to the rounded corners */}
      <div className="relative aspect-[3/4] w-full bg-sand mb-6 cursor-pointer rounded-3xl shadow-sm group-hover:shadow-md transition-all duration-500 overflow-hidden animate-glow-pink">
        <Image 
          src={product.image} 
          alt={product.name} 
          fill
          priority={product.id === "prod-1" || product.id === "prod-2" || product.id === "prod-3" || product.id === "prod-4"}
          quality={80}
          className="object-cover object-center transition-transform duration-[1.5s] ease-[cubic-bezier(0.25,1,0.5,1)] group-hover:scale-110"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
        {product.isImported && (
          <div className="absolute top-4 left-4 z-10">
            <span className="bg-white/90 backdrop-blur-md text-obsidian text-[8px] md:text-[9px] font-sans font-bold uppercase tracking-[0.2em] px-3 py-1.5 rounded-full shadow-sm border border-obsidian/5">
              Imported
            </span>
          </div>
        )}
      </div>
      
      {/* Product Details - Minimalist */}
      <div className="flex flex-col px-0 md:px-2">
        <div className="flex justify-between items-baseline mb-2">
          <h3 className="text-sm md:text-md font-sans font-medium text-obsidian truncate pr-4">
            {product.name}
          </h3>
          <span className="text-sm font-sans font-medium text-obsidian tabular-nums">
            ₹{product.price.toFixed(2)}
          </span>
        </div>
        <div className="text-[10px] font-sans text-obsidian/40 uppercase tracking-widest">
          Available Now
        </div>
      </div>
    </Link>
  );
}
