"use client";

import Link from "next/link";
import { ShoppingBag, Menu, X, UserCircle, LayoutDashboard } from "lucide-react";
import { useCart } from "@/hooks/useCart";
import { useSettingsStore } from "@/store/useSettingsStore";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { useUser, Show } from "@clerk/nextjs";

const ADMIN_EMAILS = ["trendyglitterzz@gmail.com", "admin@trendyglitterz.com"];

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isLoaded, isSignedIn } = useUser();
  const { getCartCount, openCart } = useCart();
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

  const isAdmin = isSignedIn && user?.primaryEmailAddress?.emailAddress && ADMIN_EMAILS.includes(user.primaryEmailAddress.emailAddress);

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
          {isAdmin && (
            <Link
              href="/admin"
              className="text-[11px] font-sans text-dustyrose hover:text-burgundy transition-colors uppercase tracking-[0.1em] font-medium border-b border-dustyrose/20"
            >
              Admin Dashboard
            </Link>
          )}
        </div>

        {/* Desktop Navigation (Right) */}
        <div className="hidden md:flex flex-shrink-0 items-center justify-end space-x-6">
          <Show when="signed-out">
            <Link
              href="/login"
              className="text-obsidian/60 hover:text-obsidian transition-colors"
              aria-label="Account"
            >
              <UserCircle className="w-5 h-5" strokeWidth={1.5} />
            </Link>
          </Show>
          
          <Show when="signed-in">
            <Link
              href="/profile"
              className="text-obsidian/60 hover:text-obsidian transition-colors"
              aria-label="Account"
            >
              <UserCircle className="w-5 h-5" strokeWidth={1.5} />
            </Link>
          </Show>
          
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
          <Show when="signed-out">
            <Link href="/login" className="relative p-2 text-obsidian" aria-label="Login">
              <UserCircle className="w-5 h-5" strokeWidth={1} />
            </Link>
          </Show>
          <Show when="signed-in">
            <Link href="/profile" className="relative p-2 text-obsidian" aria-label="Profile">
              <UserCircle className="w-5 h-5" strokeWidth={1} />
            </Link>
          </Show>
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

      {/* Mobile Navigation Drawer */}
      <div
        className={`fixed inset-0 bg-obsidian/40 backdrop-blur-sm z-[60] transition-opacity duration-500 ${
          mobileMenuOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        } md:hidden`}
        onClick={() => setMobileMenuOpen(false)}
      />
      
      <div
        className={`fixed top-0 right-0 h-full w-[280px] bg-alabaster z-[70] shadow-2xl transform transition-transform duration-500 ease-[cubic-bezier(0.23,1,0.32,1)] ${
          mobileMenuOpen ? "translate-x-0" : "translate-x-full"
        } md:hidden flex flex-col`}
      >
        <div className="flex justify-between items-center p-6 border-b border-obsidian/10">
          <span className="text-xl font-serif text-obsidian tracking-widest">MENU</span>
          <button onClick={() => setMobileMenuOpen(false)} className="p-2 text-obsidian">
            <X className="w-6 h-6" strokeWidth={1} />
          </button>
        </div>
        <div className="flex flex-col p-8 space-y-6 justify-center flex-1">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              href={link.href}
              className="text-2xl font-serif text-obsidian hover:text-obsidian/70 transition-colors uppercase tracking-[0.1em]"
              onClick={() => setMobileMenuOpen(false)}
            >
              {link.name}
            </Link>
          ))}
          {isAdmin && (
             <Link
               href="/admin"
               className="text-2xl font-serif text-dustyrose hover:text-burgundy transition-colors uppercase tracking-[0.1em]"
               onClick={() => setMobileMenuOpen(false)}
             >
               Admin Dashboard
             </Link>
          )}
          
          <Show when="signed-in">
             <Link
               href="/profile"
               className="text-2xl font-serif text-obsidian hover:text-obsidian/70 transition-colors uppercase tracking-[0.1em]"
               onClick={() => setMobileMenuOpen(false)}
             >
               My Profile
             </Link>
          </Show>
          <Show when="signed-out">
             <Link
               href="/login"
               className="text-2xl font-serif text-obsidian hover:text-obsidian/70 transition-colors uppercase tracking-[0.1em]"
               onClick={() => setMobileMenuOpen(false)}
             >
               Login / Join
             </Link>
          </Show>
        </div>
      </div>
    </nav>
    </>
  );
}
