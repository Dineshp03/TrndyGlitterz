"use client";

import Image from "next/image";
import Link from "next/link";
import { Product } from "@/data/products";
import { Heart, Eye, ShoppingCart } from "lucide-react";
import { useCart } from "@/hooks/useCart";
import { useWishlistStore } from "@/store/useWishlistStore";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";

export default function ProductCard({ product }: { product: Product }) {
  const router = useRouter();
  const isOnSale = !!product.oldPrice;
  const { addItem } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlistStore();
  const activeWishlist = isInWishlist(product.id);
  const { isSignedIn } = useUser();

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isSignedIn) {
      router.push("/login");
      return;
    }
    addItem(product);
    toast.success(`${product.name} added to cart!`);
  };

  const handleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isSignedIn) {
      router.push("/login");
      return;
    }
    toggleWishlist(product.id);
    if (!activeWishlist) {
      toast.success(`${product.name} added to wishlist!`);
    } else {
      toast.info("Removed from wishlist");
    }
  };

  const handleQuickView = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    // For now, navigate to product, or could show a modal
    router.push(`/product/${product.id}`);
  };

  return (
    <div className="group flex flex-col relative w-full overflow-visible">
      {/* Image Container — clean and crisp */}
      <div className="relative aspect-[1/1] w-full bg-[#1A1A1A] mb-4 cursor-pointer overflow-hidden rounded-2xl border border-transparent group-hover:border-white/10 transition-all">
        <Link href={`/product/${product.id}`} className="block w-full h-full relative">
          <Image 
            src={product.image} 
            alt={product.name} 
            fill
            priority={product.id === "ear-1"}
            quality={80}
            className="object-cover object-center transition-transform duration-[1s] ease-out group-hover:scale-105"
            sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
          />
          <div className="absolute inset-0 ring-1 ring-inset ring-black/5 rounded-2xl pointer-events-none" />
        </Link>

        {/* Sale Badge */}
        {isOnSale && (
          <div className="absolute top-2 left-2 z-10">
            <span className="bg-[#ff4d4f] text-white text-[9px] font-bold uppercase px-2 py-0.5 rounded-sm shadow-sm pointer-events-none">
              Sale
            </span>
          </div>
        )}

        {/* Floating Icons */}
        <div className="absolute top-2 right-2 flex flex-col gap-2 z-10 sm:opacity-0 sm:group-hover:opacity-100 sm:translate-x-4 sm:group-hover:translate-x-0 transition-all duration-300">
          <button 
            onClick={handleWishlist}
            className={`w-8 h-8 rounded-full flex items-center justify-center shadow-md transition-all duration-300 ${activeWishlist ? 'bg-[#ff4d4f] text-white' : 'bg-white text-black hover:bg-[#111111] hover:text-white'}`} 
            title="Wishlist"
          >
            <Heart size={14} fill={activeWishlist ? "currentColor" : "none"} />
          </button>
          <button 
            onClick={handleQuickView}
            className="w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-md hover:bg-[#111111] hover:text-white transition-all duration-300 group/btn" 
            title="Quick View"
          >
            <Eye size={14} className="text-black group-hover/btn:text-white" />
          </button>
        </div>

        {/* Quick Add Bar */}
        <button 
          onClick={handleAddToCart}
          className="absolute bottom-0 left-0 w-full bg-[#111111] text-white py-3 text-[10px] font-bold uppercase tracking-[0.2em] translate-y-full group-hover:translate-y-0 transition-all duration-300 flex items-center justify-center gap-2 z-20 hover:bg-gradient-to-r hover:from-[#BF953F] hover:via-[#FCF6BA] hover:to-[#B38728] hover:text-[#111] border-t border-white/5 active:scale-95 origin-bottom"
        >
          <ShoppingCart size={12} />
          Quick Add
        </button>
      </div>
      
      {/* Details Container - Centered to match Image 3 */}
      <div className="flex flex-col items-center text-center px-1">
        <h3 className="text-[11px] md:text-xs font-sans text-obsidian/70 mb-1 group-hover:text-obsidian transition-colors truncate w-full tracking-tight">
          {product.name}
        </h3>
        
        <div className="flex items-center gap-2 font-sans">
          {isOnSale ? (
            <>
              <span className="text-[11px] md:text-[13px] font-bold text-[#ff4d4f]">
                Rs. {product.price.toFixed(2)}
              </span>
              <span className="text-[10px] md:text-[11px] text-obsidian/40 line-through tracking-tighter decoration-1">
                Rs. {product.oldPrice?.toFixed(2)}
              </span>
            </>
          ) : (
            <span className="text-[11px] md:text-[13px] font-bold text-obsidian">
              Rs. {product.price.toFixed(2)}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
