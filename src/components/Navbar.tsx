"use client";

import Link from "next/link";
import { ShoppingBag, Menu, X, UserCircle, LogOut } from "lucide-react";
import { useCartStore } from "@/store/useCartStore";
import { useUserStore } from "@/store/useUserStore";
import { useSettingsStore } from "@/store/useSettingsStore";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect } from "react";

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { getCartCount, openCart } = useCartStore();
  const { isLoggedIn, logout } = useUserStore();
  const { shippingDetails } = useSettingsStore();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    requestAnimationFrame(() => setMounted(true));
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  if (pathname === "/login" || pathname === "/signup") {
    return null;
  }

  const navLinks = [
    { name: "Collections", href: "/#all-products" },
    { name: "Editorial", href: "/#about" },
    { name: "Journal", href: "#" },
  ];

  return (
    <>
      {/* Top Notification Bar */}
      <div className="bg-dustyrose text-alabaster text-center py-2 text-[10px] font-sans tracking-widest uppercase md:block hidden relative z-50">
        <p className="opacity-90">{shippingDetails}</p>
      </div>
      <nav
        className={`fixed w-full z-50 transition-all duration-700 ease-in-out border-b ${
          isScrolled 
            ? "top-0 bg-alabaster/90 backdrop-blur-xl border-obsidian/5 py-4 shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07),0_4px_6px_-2px_rgba(0,0,0,0.02)]" 
            : "top-0 md:top-8 bg-alabaster/95 border-transparent py-6"
        }`}
      >
      <div className="container mx-auto px-6 md:px-12 flex items-center justify-between">
        
        {/* Mobile menu button */}
        <button 
          className="md:hidden p-2 text-obsidian"
          onClick={() => setMobileMenuOpen(true)}
        >
          <Menu className="w-5 h-5" strokeWidth={1} />
        </button>

        {/* Logo (Left) */}
        <Link 
          href="/" 
          className="text-lg sm:text-xl md:text-2xl font-sans font-bold tracking-[0.15em] text-obsidian flex-shrink-0 relative group"
        >
          TRENDY GLITTERZ
        </Link>

        {/* Desktop Navigation (Center) */}
        <div className="hidden md:flex flex-1 items-center justify-center space-x-12">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              href={link.href}
              className="text-[11px] font-sans text-obsidian/60 hover:text-obsidian transition-colors uppercase tracking-[0.1em]"
            >
              {link.name}
            </Link>
          ))}
        </div>

        {/* Desktop Navigation (Right) */}
        <div className="hidden md:flex flex-shrink-0 items-center justify-end space-x-6">
          <Link
            href={isLoggedIn ? "/profile" : "/login"}
            className="text-obsidian/60 hover:text-obsidian transition-colors"
            aria-label="Account"
          >
            <UserCircle className="w-5 h-5" strokeWidth={1.5} />
          </Link>
          
          {isLoggedIn && (
            <button
              onClick={() => { logout(); router.push("/"); }}
              className="text-obsidian/60 hover:text-obsidian transition-colors"
              aria-label="Logout"
            >
              <LogOut className="w-4 h-4" strokeWidth={1.5} />
            </button>
          )}
          <button 
            className="flex items-center gap-2 text-obsidian/60 hover:text-obsidian transition-colors group relative"
            onClick={openCart}
            aria-label="Open cart"
          >
            <ShoppingBag className="w-5 h-5" strokeWidth={1.5} />
            {mounted && getCartCount() > 0 && (
              <span className="absolute -top-1.5 -right-2 bg-dustyrose text-alabaster text-[9px] w-4 h-4 flex items-center justify-center rounded-full font-medium">
                {getCartCount()}
              </span>
            )}
          </button>
        </div>

        {/* Mobile Right Icons */}
        <div className="md:hidden flex items-center gap-1">
          <Link
            href={isLoggedIn ? "/profile" : "/login"}
            className="relative p-2 text-obsidian"
            aria-label="Account"
          >
            <UserCircle className="w-5 h-5" strokeWidth={1} />
          </Link>
          <button 
            className="relative p-2 text-obsidian"
            onClick={openCart}
          >
            <ShoppingBag className="w-5 h-5" strokeWidth={1} />
            {mounted && getCartCount() > 0 && (
              <span className="absolute top-1 right-0 bg-dustyrose text-alabaster text-[9px] w-3.5 h-3.5 flex items-center justify-center rounded-full">
                {getCartCount()}
              </span>
            )}
          </button>
        </div>

      </div>

      {/* Mobile Navigation Fullscreen Menu */}
      <div
        className={`fixed inset-0 bg-alabaster z-50 transform transition-transform duration-700 ease-[cubic-bezier(0.77,0,0.175,1)] ${
          mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        } md:hidden flex flex-col`}
      >
        <div className="flex justify-between items-center p-6 border-b border-obsidian/10">
          <span className="text-xl font-serif text-obsidian tracking-widest">MENU</span>
          <button onClick={() => setMobileMenuOpen(false)} className="p-2 text-obsidian">
            <X className="w-6 h-6" strokeWidth={1} />
          </button>
        </div>
        <div className="flex flex-col p-12 space-y-8 justify-center flex-1">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              href={link.href}
              className="text-3xl font-sans font-medium text-obsidian hover:text-obsidian/70 transition-colors uppercase tracking-[0.1em]"
              onClick={() => setMobileMenuOpen(false)}
            >
              {link.name}
            </Link>
          ))}
          
          {isLoggedIn && (
            <button
              onClick={() => { logout(); setMobileMenuOpen(false); router.push("/"); }}
              className="text-3xl font-sans font-medium text-obsidian hover:text-obsidian/70 transition-colors uppercase tracking-[0.1em] text-left"
            >
              Logout
            </button>
          )}
        </div>
      </div>
    </nav>
    </>
  );
}
