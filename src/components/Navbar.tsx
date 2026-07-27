"use client";

import Link from "next/link";
import { ShoppingBag, Menu, X, UserCircle, Heart, ChevronDown } from "lucide-react";
import { useCart } from "@/hooks/useCart";
import { useSettingsStore } from "@/store/useSettingsStore";
import { useWishlistStore } from "@/store/useWishlistStore";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect, useCallback } from "react";
import { useUser, Show } from "@clerk/nextjs";

const ADMIN_EMAILS = ["trendyglitterzz@gmail.com", "admin@trendyglitterz.com"];

interface MenuCategoryItem {
  label: string;
  param: string;
}

interface MenuCategorySection {
  label: string;
  items?: MenuCategoryItem[];
  param?: string;
}

// ── Categories configuration (matching image 3) ──────────────────────────────
const MENU_CATEGORIES: MenuCategorySection[] = [
  {
    label: "Xuping Exclusive",
    items: [
      { label: "Earrings", param: "Xuping Earrings" },
      { label: "Neckpiece", param: "Xuping Neckpiece" },
      { label: "Bracelets", param: "Xuping Bracelets" },
      { label: "Finger Rings", param: "Xuping Finger Rings" },
    ],
  },
  { label: "Earrings", param: "Earrings" },
  { label: "Korean Earrings", param: "Korean Earrings" },
  { label: "Traditional Earrings", param: "Traditional Earrings" },
  { label: "Neckpiece", param: "Neckpiece" },
  { label: "Bracelets", param: "Bracelets" },
  { label: "Finger Rings", param: "Finger Rings" },
  { label: "Hair Accessories", param: "Hair Accessories" },
  {
    label: "Price Based",
    items: [
      { label: "Under ₹99", param: "price=under-99" },
      { label: "Under ₹299", param: "price=under-299" },
      { label: "Under ₹499", param: "price=under-499" },
      { label: "Premium Range", param: "price=premium-500" },
    ],
  },
  {
    label: "Offer Zone",
    param: "offer=true",
  },
];

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

  if (pathname === "/login" || pathname === "/signup" || pathname?.startsWith("/admin")) return null;

  const isAdmin =
    isSignedIn &&
    user?.primaryEmailAddress?.emailAddress &&
    ADMIN_EMAILS.includes(user.primaryEmailAddress.emailAddress);

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
        <div className="px-6 pb-20 space-y-2">
          {MENU_CATEGORIES.map((section) => (
            <div key={section.label}>
              {"items" in section && section.items && section.items.length > 0 ? (
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
                  <div
                    className={`overflow-hidden transition-all duration-300 ease-in-out ${
                      expandedSection === section.label ? "max-h-64 opacity-100" : "max-h-0 opacity-0"
                    }`}
                  >
                    <div className="pl-4 pb-2 space-y-0.5 border-l border-white/10 ml-2">
                      {section.items.map((item) => {
                        let href = "/catalog";
                        if (item.param.startsWith("price=")) href = `/catalog?price=${item.param.split("=")[1]}`;
                        else if (item.param.startsWith("offer=")) href = `/catalog?offer=true`;
                        else href = `/catalog?category=${encodeURIComponent(item.param)}`;

                        return (
                          <Link
                            key={item.label}
                            href={href}
                            onClick={closeMenu}
                            className="block w-full text-left text-sm text-white/50 hover:text-white/90 py-1.5 transition-colors tracking-wide"
                          >
                            {item.label}
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                </>
              ) : (
                (() => {
                  let href = "/catalog";
                  if ("param" in section && section.param) {
                    if (section.param.startsWith("price=")) href = `/catalog?price=${section.param.split("=")[1]}`;
                    else if (section.param.startsWith("offer=")) href = `/catalog?offer=true`;
                    else href = `/catalog?category=${encodeURIComponent(section.param)}`;
                  }
                  return (
                    <Link
                      href={href}
                      onClick={closeMenu}
                      className={`block w-full text-left py-2.5 text-sm font-sans font-semibold tracking-wide transition-colors ${
                        section.label === "Offer Zone" ? "text-[#D4AF37] hover:text-[#FBF5B7]" : "text-white/70 hover:text-white"
                      }`}
                    >
                      {section.label === "Offer Zone" ? `🏷️ ${section.label}` : section.label}
                    </Link>
                  );
                })()
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
