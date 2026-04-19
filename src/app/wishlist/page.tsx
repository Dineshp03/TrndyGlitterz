"use client";

import { useWishlistStore } from "@/store/useWishlistStore";
import { useProductStore } from "@/store/useProductStore";
import { useUser } from "@clerk/nextjs";
import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { Heart, ShoppingBag, Trash2, ArrowLeft, Star } from "lucide-react";
import ProductCard from "@/components/ProductCard";

export default function WishlistPage() {
  const { user, isLoaded, isSignedIn } = useUser();
  const { items, loadWishlist } = useWishlistStore();
  const { products, syncWithInitial } = useProductStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    syncWithInitial();
  }, [syncWithInitial]);

  useEffect(() => {
    if (isLoaded && isSignedIn && user?.id) {
      loadWishlist(user.id);
    }
  }, [isLoaded, isSignedIn, user?.id, loadWishlist]);

  const wishlistProducts = useMemo(() => {
    return products.filter((p) => items.includes(p.id));
  }, [products, items]);

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white selection:bg-dustyrose/30">
      <main className="container mx-auto px-6 pt-32 pb-24 md:px-12">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6 border-b border-white/10 pb-10">
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-dustyrose uppercase tracking-[0.3em] text-[10px] font-mono">
              <Star className="w-3 h-3 fill-current" />
              <span>Your Curated Selection</span>
            </div>
            <h1 className="text-4xl md:text-6xl font-serif font-light tracking-tight">
              Wishlist <span className="text-white/20 italic">({wishlistProducts.length})</span>
            </h1>
          </div>
          
          <Link 
            href="/catalog"
            className="group flex items-center gap-2 text-[11px] font-mono uppercase tracking-[0.2em] text-white/50 hover:text-white transition-all"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" strokeWidth={1.5} />
            Back to Catalog
          </Link>
        </div>

        {!isLoaded ? (
          <div className="h-64 flex items-center justify-center">
             <div className="w-8 h-8 rounded-full border-2 border-dustyrose/30 border-t-dustyrose animate-spin" />
          </div>
        ) : !isSignedIn ? (
          <div className="h-[40vh] flex flex-col items-center justify-center text-center space-y-6 bg-white/5 rounded-3xl border border-white/10 p-12">
            <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-2">
              <Heart className="w-8 h-8 text-white/20" strokeWidth={1} />
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-serif">Sign in to save your favorites</h2>
              <p className="text-white/40 text-sm max-w-sm mx-auto">
                Create an account to keep track of the pieces you love across all your devices.
              </p>
            </div>
            <Link 
              href="/login"
              className="px-8 py-3 bg-white text-black text-xs font-mono uppercase tracking-widest hover:bg-dustyrose hover:text-white transition-all rounded-full"
            >
              Log In / Sign Up
            </Link>
          </div>
        ) : wishlistProducts.length === 0 ? (
          <div className="h-[40vh] flex flex-col items-center justify-center text-center space-y-6 bg-white/5 rounded-3xl border border-white/10 p-12">
            <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-2">
              <Heart className="w-8 h-8 text-white/20" strokeWidth={1} />
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-serif">Your wishlist is empty</h2>
              <p className="text-white/40 text-sm max-w-sm mx-auto">
                Explore our collections and add items you love to see them here.
              </p>
            </div>
            <Link 
              href="/catalog"
              className="px-8 py-3 bg-white text-black text-xs font-mono uppercase tracking-widest hover:bg-dustyrose hover:text-white transition-all rounded-full"
            >
              Explore Collection
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-8 gap-y-12">
            {wishlistProducts.map((product) => (
              <div key={product.id} className="group relative">
                <ProductCard product={product} />
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
