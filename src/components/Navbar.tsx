"use client";

import Link from "next/link";
import Image from "next/image";
import { ShoppingBag, Menu, X, UserCircle, LayoutDashboard, Heart } from "lucide-react";
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
      <nav
        className={`fixed w-full z-50 transition-all duration-700 ease-in-out border-b ${
          isScrolled 
            ? "top-0 bg-[#0A0A0A]/95 backdrop-blur-xl border-white/10 py-4 shadow-lg" 
            : "top-0 bg-transparent border-transparent py-6"
        }`}
      >
      <div className="container mx-auto px-6 md:px-12 flex items-center justify-between">
        
        {/* Mobile menu button */}
        <button 
          className="md:hidden p-2 text-white"
          onClick={() => setMobileMenuOpen(true)}
        >
          <Menu className="w-5 h-5" strokeWidth={1.5} />
        </button>

        {/* Logo (Left) */}
        <Link 
          href="/" 
          className="flex-shrink-0 transition-opacity hover:opacity-80"
        >
          <Image 
            src="/trendy_logo.png" 
            alt="TRENDY GLITTERZ" 
            width={180} 
            height={40} 
            className="h-10 w-auto object-contain brightness-0 invert" 
          />
        </Link>

        {/* Desktop Navigation (Center) */}
        <div className="hidden md:flex flex-1 items-center justify-center space-x-12">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              href={link.href}
              className="text-[11px] font-sans text-white/70 hover:text-white transition-colors uppercase tracking-[0.1em]"
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
            <button
              onClick={() => router.push('/login')}
              className="text-white/70 hover:text-white transition-colors"
              aria-label="Account"
            >
              <UserCircle className="w-5 h-5" strokeWidth={1.5} />
            </button>
            <button
              onClick={() => router.push('/login')}
              className="text-white/70 hover:text-[#ff4d4f] transition-colors"
              aria-label="Wishlist"
            >
              <Heart className="w-5 h-5" strokeWidth={1.5} />
            </button>
          </Show>
          
          <Show when="signed-in">
            <Link
              href="/profile"
              className="text-white/70 hover:text-white transition-colors"
              aria-label="Account"
            >
              <UserCircle className="w-5 h-5" strokeWidth={1.5} />
            </Link>
            <Link
              href="/wishlist" 
              className="text-white/70 hover:text-[#ff4d4f] transition-colors"
              aria-label="Wishlist"
            >
              <Heart className="w-5 h-5" strokeWidth={1.5} />
            </Link>
          </Show>
          
          <button 
            className="flex items-center gap-2 text-white/70 hover:text-white transition-colors group relative"
            onClick={() => isSignedIn ? openCart() : router.push('/login')}
            aria-label="Open cart"
          >
            <ShoppingBag className="w-5 h-5" strokeWidth={1.5} />
            {mounted && getCartCount() > 0 && (
              <span className="absolute -top-1.5 -right-2 bg-dustyrose text-white text-[9px] w-4 h-4 flex items-center justify-center rounded-full font-medium">
                {getCartCount()}
              </span>
            )}
          </button>
        </div>

        {/* Mobile Right Icons */}
        <div className="md:hidden flex items-center gap-3">
          <Show when="signed-out">
            <button onClick={() => router.push('/login')} className="text-white">
              <Heart className="w-5 h-5" strokeWidth={1.5} />
            </button>
            <button onClick={() => router.push('/login')} className="text-white" aria-label="Login">
              <UserCircle className="w-5 h-5" strokeWidth={1.5} />
            </button>
          </Show>
          <Show when="signed-in">
            <Link href="/wishlist" className="text-white">
              <Heart className="w-5 h-5" strokeWidth={1.5} />
            </Link>
            <Link href="/profile" className="text-white" aria-label="Profile">
              <UserCircle className="w-5 h-5" strokeWidth={1.5} />
            </Link>
          </Show>
          <button 
            className="relative text-white"
            onClick={() => isSignedIn ? openCart() : router.push('/login')}
          >
            <ShoppingBag className="w-5 h-5" strokeWidth={1.5} />
            {mounted && getCartCount() > 0 && (
              <span className="absolute -top-1.5 -right-2 bg-dustyrose text-white text-[9px] w-3.5 h-3.5 flex items-center justify-center rounded-full">
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
