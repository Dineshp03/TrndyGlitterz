"use client";

import { useCart } from "@/hooks/useCart";
import { X, Minus, Plus, Trash2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import CartCheckoutModal from "./CartCheckoutModal";

export default function CartDrawer() {
  const { items, isCartOpen, closeCart, updateQuantity, removeItem, getCartTotal, getCartCount } = useCart();
  const [mounted, setMounted] = useState(false);
  const [showCheckout, setShowCheckout] = useState(false);

  useEffect(() => {
    requestAnimationFrame(() => setMounted(true));
  }, []);

  if (!mounted) return null;

  return (
    <>
      {/* Backdrop */}
      {isCartOpen && (
        <div 
          className="fixed inset-0 bg-obsidian/30 z-[100] transition-opacity backdrop-blur-md"
          onClick={closeCart}
        />
      )}

      {/* Drawer */}
      <div 
        className={`fixed top-0 right-0 h-full w-full sm:w-[450px] bg-alabaster z-[110] transform transition-transform duration-700 ease-[cubic-bezier(0.77,0,0.175,1)] flex flex-col ${
          isCartOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="absolute inset-0 noise-bg opacity-[0.03] pointer-events-none"></div>

        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-8 border-b border-obsidian/10 relative z-10">
          <h2 className="text-2xl font-serif text-obsidian tracking-wide">
            Cart <span className="text-obsidian/40 italic">({getCartCount()})</span>
          </h2>
          <button 
            onClick={closeCart}
            className="text-obsidian hover:rotate-90 transition-transform duration-500"
          >
            <X className="w-6 h-6" strokeWidth={1} />
          </button>
        </div>

        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-8 space-y-8 sm:space-y-10 relative z-10">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center text-obsidian/40 space-y-6">
              <p className="font-serif text-2xl italic">Your cart is empty.</p>
              <button 
                onClick={closeCart}
                className="text-[10px] font-sans uppercase tracking-[0.2em] border-b border-obsidian pb-1 hover:text-burgundy hover:border-burgundy transition-colors"
              >
                Continue Exploring
              </button>
            </div>
          ) : (
            (() => {
              const hasSoldOutItems = items.some(item => item.isSoldOut);
              return items.map((item) => (
                <div key={item.id} className="flex gap-6 group">
                  <Link 
                    href={`/product/${item.productId}`} 
                    onClick={closeCart}
                    className="relative w-28 h-36 bg-sand/30 overflow-hidden flex-shrink-0"
                  >
                    <Image 
                      src={item.image} 
                      alt={item.name} 
                      fill 
                      className="object-cover group-hover:scale-105 transition-transform duration-1000"
                    />
                  </Link>
                  
                  <div className="flex flex-col flex-1 justify-between py-2">
                    <div>
                      <div className="flex justify-between items-start mb-1">
                        <Link 
                          href={`/product/${item.productId}`}
                          onClick={closeCart}
                          className="hover:text-burgundy transition-colors"
                        >
                          <h3 className="font-serif text-lg text-obsidian leading-tight pr-4 flex flex-wrap gap-2 items-center">
                            {item.name}
                            {item.isSoldOut && (
                              <span className="bg-[#ff4d4f]/10 text-[#ff4d4f] text-[9px] font-sans font-bold uppercase tracking-wider px-2 py-0.5 rounded border border-[#ff4d4f]/20">
                                Sold Out
                              </span>
                            )}
                          </h3>
                        </Link>
                        <button 
                          onClick={() => removeItem(item.id)}
                          className="text-obsidian/40 hover:text-burgundy transition-colors"
                          aria-label="Remove item"
                        >
                          <Trash2 className="w-4 h-4" strokeWidth={1} />
                        </button>
                      </div>
                      <div className="text-[10px] uppercase font-sans tracking-[0.2em] text-dustyrose">
                        Quantity: {item.quantity}
                      </div>
                    </div>
                    
                    <div className="flex items-end justify-between mt-4">
                      <div className="flex items-center gap-4 border-b border-obsidian/20 pb-1">
                        <button 
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="text-obsidian/50 hover:text-obsidian disabled:opacity-30 transition-colors"
                          disabled={item.quantity <= 1}
                        >
                          <Minus className="w-3 h-3" strokeWidth={1.5} />
                        </button>
                        <span className="text-[11px] font-sans w-4 text-center text-obsidian tabular-nums">
                          {item.quantity}
                        </span>
                        <button 
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="text-obsidian/50 hover:text-obsidian transition-colors"
                        >
                          <Plus className="w-3 h-3" strokeWidth={1.5} />
                        </button>
                      </div>
                      <p className="text-sm font-sans font-medium text-obsidian tabular-nums tracking-wide">
                        ₹{(item.price * item.quantity).toFixed(2)}
                      </p>
                    </div>
                  </div>
                </div>
              ));
            })()
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="p-4 sm:p-8 border-t border-obsidian/10 bg-alabaster relative z-10 space-y-6 sm:space-y-8">
            <div className="flex justify-between items-end">
              <span className="text-[11px] font-sans uppercase tracking-[0.2em] text-obsidian/60">Estimated Total</span>
              <span className="text-3xl font-serif font-medium text-obsidian tracking-tighter tabular-nums">₹{getCartTotal().toFixed(2)}</span>
            </div>
            
            {items.some(item => item.isSoldOut) && (
              <p className="text-[10px] text-[#ff4d4f] text-center font-sans tracking-wide font-medium bg-[#ff4d4f]/5 py-2 px-3 rounded-lg border border-[#ff4d4f]/10">
                Please remove sold-out items to proceed to checkout.
              </p>
            )}

            <button 
              onClick={() => {
                const hasSoldOut = items.some(item => item.isSoldOut);
                if (!hasSoldOut) setShowCheckout(true);
              }}
              disabled={items.some(item => item.isSoldOut)}
              className={`w-full relative overflow-hidden group py-5 text-[11px] font-sans uppercase tracking-[0.2em] transition-colors ${
                items.some(item => item.isSoldOut)
                  ? "bg-obsidian/10 text-obsidian/30 cursor-not-allowed border border-obsidian/5"
                  : "bg-dustyrose text-alabaster"
              }`}
            >
              <span className={`relative z-10 transition-colors duration-500 ${!items.some(item => item.isSoldOut) && "group-hover:text-obsidian"}`}>
                Secure Payment
              </span>
              {!items.some(item => item.isSoldOut) && (
                <div className="absolute inset-0 bg-sand transform scale-x-0 origin-left transition-transform duration-500 ease-[cubic-bezier(0.77,0,0.175,1)] group-hover:scale-x-100 z-0"></div>
              )}
            </button>
          </div>
        )}
      </div>

      {showCheckout && <CartCheckoutModal onClose={() => setShowCheckout(false)} />}
    </>
  );
}
