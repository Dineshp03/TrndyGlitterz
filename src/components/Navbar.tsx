"use client";

import Link from "next/link";
import { ShoppingBag, Menu, X, UserCircle, Heart, ChevronDown } from "lucide-react";
import { useCart } from "@/hooks/useCart";
import { useSettingsStore } from "@/store/useSettingsStore";
import { useWishlistStore } from "@/store/useWishlistStore";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect, useCallback } from "react";
import { useUser, Show } from "@clerk/nextjs";
import Image from "next/image";

const ADMIN_EMAILS = ["trendyglitterzz@gmail.com", "admin@trendyglitterz.com"];

// ── Categories configuration (matching image 3) ──────────────────────────────
const MENU_CATEGORIES = [
  {
    label: "Xuping Exclusive",
    items: ["Earrings", "Neckpiece", "Bracelets", "Finger Rings"],
  },
  { label: "Korean Earrings", items: [] },
  { label: "Neckpiece ", items: [] },
  { label: "Bracelets ", items: [] },
  { label: "Finger Rings ", items: [] },
  { label: "Hair Accessories", items: [] },
  {
    label: "Price Based",
    items: ["Under ₹99", "Under ₹299", "Under ₹499", "Premium Range"],
  },
  {
    label: "Offer Zone",
    items: [],
  },
];

// Map display names → query params for catalog navigation
const CATEGORY_MAP: Record<string, string> = {
  "Earrings": "Earrings",
  "Korean Earrings": "Earrings",
  "Neckpiece": "Neckpiece",
  "Neckpiece ": "Neckpiece",
  "Bracelets": "Bracelets",
  "Bracelets ": "Bracelets",
  "Finger Rings": "Finger Rings",
  "Finger Rings ": "Finger Rings",
  "Hair Accessories": "Hair Accessories",
  "Under ₹99": "under-99",
  "Under ₹299": "under-299",
  "Under ₹499": "under-499",
  "Premium Range": "premium-500",
};

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isSignedIn } = useUser();
  const { getCartCount, openCart } = useCart();
  const wishlist = useWishlistStore();
  useSettingsStore();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [expandedSection, setExpandedSection] = useState<string | null>(null);

  // ── Robust Scroll Lock ──────────────────────────────────────────────────────
  useEffect(() => {
    if (mobileMenuOpen) {
      const scrollY = window.scrollY;
      document.body.style.position = "fixed";
      document.body.style.top = `-${scrollY}px`;
      document.body.style.width = "100%";
      document.body.style.overflowY = "scroll"; // Keep scrollbar space to avoid jump
    } else {
      const scrollY = document.body.style.top;
      document.body.style.position = "";
      document.body.style.top = "";
      document.body.style.width = "";
      document.body.style.overflowY = "";
      if (scrollY) {
        window.scrollTo(0, parseInt(scrollY || "0") * -1);
      }
    }
    return () => {
      document.body.style.position = "";
      document.body.style.top = "";
      document.body.style.width = "";
      document.body.style.overflowY = "";
    };
  }, [mobileMenuOpen]);

  useEffect(() => {
    requestAnimationFrame(() => setMounted(true));
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const closeMenu = useCallback(() => {
    setMobileMenuOpen(false);
    setExpandedSection(null);
  }, []);

  if (pathname === "/login" || pathname === "/signup") return null;

  const isAdmin =
    isSignedIn &&
    user?.primaryEmailAddress?.emailAddress &&
    ADMIN_EMAILS.includes(user.primaryEmailAddress.emailAddress);

  const navLinks = [
    { name: "Collections", href: "/#all-products" },
    { name: "Editorial", href: "/#about" },
    { name: "Journal", href: "#" },
  ];

  const handleCategoryNavigate = (displayName: string) => {
    const param = CATEGORY_MAP[displayName];
    if (param) {
      if (param.startsWith("under-") || param.includes("premium")) {
        router.push(`/catalog?price=${param}`);
      } else {
        router.push(`/catalog?category=${encodeURIComponent(param)}`);
      }
    } else {
      router.push("/catalog");
    }
    closeMenu();
  };

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
            aria-label="Open menu"
          >
            <Menu className="w-5 h-5" strokeWidth={1.5} />
          </button>

          <div className="flex-shrink-0" />

          {/* Desktop Nav (Center) */}
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

          {/* Desktop Nav (Right) */}
          <div className="hidden md:flex flex-shrink-0 items-center justify-end space-x-6">
            <Show when="signed-out">
              <button onClick={() => router.push("/login")} className="text-white/70 hover:text-white transition-colors" aria-label="Account">
                <UserCircle className="w-5 h-5" strokeWidth={1.5} />
              </button>
              <button onClick={() => router.push("/login")} className="text-white/70 hover:text-[#ff4d4f] transition-colors relative" aria-label="Wishlist">
                <Heart className="w-5 h-5" strokeWidth={1.5} />
                {mounted && wishlist.items.length > 0 && (
                  <span className="absolute -top-1.5 -right-2 bg-[#ff4d4f] text-white text-[9px] w-4 h-4 flex items-center justify-center rounded-full font-medium">
                    {wishlist.items.length}
                  </span>
                )}
              </button>
            </Show>
            <Show when="signed-in">
              <Link href="/profile" className="text-white/70 hover:text-white transition-colors" aria-label="Account">
                <UserCircle className="w-5 h-5" strokeWidth={1.5} />
              </Link>
              <Link href="/wishlist" className="text-white/70 hover:text-[#ff4d4f] transition-colors relative" aria-label="Wishlist">
                <Heart className="w-5 h-5" strokeWidth={1.5} />
                {mounted && wishlist.items.length > 0 && (
                  <span className="absolute -top-1.5 -right-2 bg-[#ff4d4f] text-white text-[9px] w-4 h-4 flex items-center justify-center rounded-full font-medium">
                    {wishlist.items.length}
                  </span>
                )}
              </Link>
            </Show>
            <button
              className="flex items-center gap-2 text-white/70 hover:text-white transition-colors group relative"
              onClick={() => (isSignedIn ? openCart() : router.push("/login"))}
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
              <button onClick={() => router.push("/login")} className="text-white">
                <Heart className="w-5 h-5" strokeWidth={1.5} />
              </button>
              <button onClick={() => router.push("/login")} className="text-white" aria-label="Login">
                <UserCircle className="w-5 h-5" strokeWidth={1.5} />
              </button>
            </Show>
            <Show when="signed-in">
              <Link href="/wishlist" className="relative text-white">
                <Heart className="w-5 h-5" strokeWidth={1.5} />
                {mounted && wishlist.items.length > 0 && (
                  <span className="absolute -top-1.5 -right-2 bg-[#ff4d4f] text-white text-[9px] w-3.5 h-3.5 flex items-center justify-center rounded-full">
                    {wishlist.items.length}
                  </span>
                )}
              </Link>
              <Link href="/profile" className="text-white" aria-label="Profile">
                <UserCircle className="w-5 h-5" strokeWidth={1.5} />
              </Link>
            </Show>
            <button
              className="relative text-white"
              onClick={() => (isSignedIn ? openCart() : router.push("/login"))}
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
      </nav>

      {/* ── Mobile Backdrop ── */}
      <div
        className={`fixed inset-0 bg-black/50 backdrop-blur-sm z-[60] transition-opacity duration-400 ${
          mobileMenuOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        } md:hidden`}
        onClick={closeMenu}
      />

      {/* ── Left Drawer ── */}
      <div
        className={`fixed top-0 left-0 h-full w-[300px] bg-[#0A0A0A] z-[70] shadow-2xl transform transition-transform duration-500 ease-[cubic-bezier(0.23,1,0.32,1)] ${
          mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        } md:hidden flex flex-col overflow-y-auto`}
        style={{ WebkitOverflowScrolling: "touch" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Drawer Header */}
        <div className="flex justify-between items-center px-6 py-5 border-b border-white/10 sticky top-0 bg-[#0A0A0A] z-10">
          <span className="text-sm font-serif text-white/90 tracking-[0.3em] uppercase">Menu</span>
          <button onClick={closeMenu} className="p-1.5 text-white/60 hover:text-white transition-colors rounded-full hover:bg-white/10">
            <X className="w-5 h-5" strokeWidth={1} />
          </button>
        </div>

        {/* Nav Links */}
        <div className="px-6 pt-6 pb-2 space-y-1">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              href={link.href}
              className="block text-lg font-serif text-white/80 hover:text-white hover:pl-2 transition-all uppercase tracking-[0.1em] py-2"
              onClick={closeMenu}
            >
              {link.name}
            </Link>
          ))}
          {isAdmin && (
            <Link
              href="/admin"
              className="block text-lg font-serif text-dustyrose hover:text-burgundy transition-colors uppercase tracking-[0.1em] py-2"
              onClick={closeMenu}
            >
              Admin Dashboard
            </Link>
          )}
          <Show when="signed-in">
            <Link href="/profile" className="block text-lg font-serif text-white/80 hover:text-white transition-all uppercase tracking-[0.1em] py-2" onClick={closeMenu}>
              My Profile
            </Link>
          </Show>
          <Show when="signed-out">
            <Link href="/login" className="block text-lg font-serif text-white/80 hover:text-white transition-all uppercase tracking-[0.1em] py-2" onClick={closeMenu}>
              Login / Join
            </Link>
          </Show>
        </div>

        {/* Divider */}
        <div className="h-px bg-white/10 mx-6 my-4" />

        {/* ── Categories Section ── */}
        <div className="px-6 pb-8 space-y-1">
          <p className="text-[9px] font-mono text-white/30 uppercase tracking-[0.3em] mb-4">Browse Categories</p>

          {MENU_CATEGORIES.map((section) => (
            <div key={section.label}>
              {section.items.length > 0 ? (
                <>
                  <button
                    className="w-full flex items-center justify-between py-2.5 text-left"
                    onClick={() =>
                      setExpandedSection(expandedSection === section.label ? null : section.label)
                    }
                  >
                    <span className="text-sm font-sans font-semibold text-white/70 tracking-wide">
                      {section.label}
                    </span>
                    <ChevronDown
                      className={`w-4 h-4 text-white/40 transition-transform duration-300 ${
                        expandedSection === section.label ? "rotate-180" : ""
                      }`}
                    />
                  </button>

                  {/* Accordion items */}
                  <div
                    className={`overflow-hidden transition-all duration-300 ease-in-out ${
                      expandedSection === section.label ? "max-h-64 opacity-100" : "max-h-0 opacity-0"
                    }`}
                  >
                    <div className="pl-4 pb-2 space-y-0.5 border-l border-white/10 ml-2">
                      {section.items.map((item) => (
                        <button
                          key={item}
                          onClick={() => handleCategoryNavigate(item)}
                          className="block w-full text-left text-sm text-white/50 hover:text-white/90 py-1.5 transition-colors tracking-wide"
                        >
                          {item}
                        </button>
                      ))}
                    </div>
                  </div>
                </>
              ) : (
                // Individual Category or Offer Zone
                <button
                  onClick={() => { 
                    if (section.label === "Offer Zone") {
                      router.push("/catalog?offer=true");
                    } else {
                      handleCategoryNavigate(section.label);
                    }
                    closeMenu(); 
                  }}
                  className={`w-full text-left py-2.5 text-sm font-sans font-semibold tracking-wide transition-colors ${
                    section.label === "Offer Zone" ? "text-[#D4AF37] hover:text-[#FBF5B7]" : "text-white/70 hover:text-white"
                  }`}
                >
                  {section.label === "Offer Zone" ? `🏷️ ${section.label}` : section.label}
                </button>
              )}
            </div>
          ))}

          {/* View All */}
          <div className="pt-4">
            <Link
              href="/catalog"
              onClick={closeMenu}
              className="flex items-center gap-2 text-[11px] font-mono uppercase tracking-[0.2em] text-white/40 hover:text-white/80 transition-colors"
            >
              View All Collections →
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
