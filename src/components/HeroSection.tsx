"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

/* ─── particles config ──────────────────────────────────────────────────── */
const PARTICLES = [
  { id: 1,  size: 3, left: "7%",  delay: "0s",   dur: "7s",   color: "#D4AF37" },
  { id: 2,  size: 5, left: "15%", delay: "1.5s", dur: "9s",   color: "#FFD700" },
  { id: 3,  size: 4, left: "29%", delay: "0.6s", dur: "6.5s", color: "#B8860B" },
  { id: 4,  size: 3, left: "41%", delay: "2.3s", dur: "8s",   color: "#F9A826" },
  { id: 5,  size: 5, left: "53%", delay: "1s",   dur: "10s",  color: "#D4AF37" },
  { id: 6,  size: 3, left: "64%", delay: "1.8s", dur: "7s",   color: "#B8860B" },
  { id: 7,  size: 4, left: "74%", delay: "0.3s", dur: "8.5s", color: "#FFDF00" },
  { id: 8,  size: 5, left: "83%", delay: "2.8s", dur: "9.5s", color: "#FFD700" },
  { id: 9,  size: 3, left: "91%", delay: "1.1s", dur: "6s",   color: "#D4AF37" },
];

/* ─── component ─────────────────────────────────────────────────────────── */
interface HeroSectionProps {
  onStartShopping?: () => void;
}

export default function HeroSection({ onStartShopping }: HeroSectionProps) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  const handleShop = () => {
    if (onStartShopping) {
      onStartShopping();
      return;
    }
    const el = document.getElementById("all-products") ?? document.getElementById("products-start");
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <>

      <div className="tg-hero-wrap">
        {/* Optimized background image for fast loading */}
        <Image
          src="/bgPart2.jpeg"
          alt="Trendy Glitterz Background"
          fill
          priority
          quality={95}
          className="object-cover object-center pointer-events-none transition-opacity duration-1000"
          sizes="100vw"
        />
        
        {/* Dark overlay for text readability */}
        <div className="absolute inset-0 bg-black/60 z-[1] pointer-events-none" />


        {/* floating particles — only after mount to avoid SSR mismatch */}
        {mounted && PARTICLES.map((p) => (
          <div
            key={p.id}
            className="tg-dot"
            style={{
              width: p.size,
              height: p.size,
              left: p.left,
              background: p.color,
              // @ts-expect-error custom CSS vars
              "--tg-dur": p.dur,
              "--tg-delay": p.delay,
            }}
          />
        ))}


        {/* ── Hero grid ── */}
        <div className="tg-grid">

          {/* CENTERED — copy */}
          <div className="tg-left">
            <div className="tg-eyebrow">
              <span className="gold-gradient-text">Since 2021</span>
            </div>

            <h1 className="tg-h1 relative">
              <span className="tg-h1-l relative inline-block">
                <span className="gold-gradient-text pb-2">TRENDY</span>
                <div className="tg-sparkle s1" />
                <div className="tg-sparkle s3" />
              </span>
              <span className="tg-h1-l relative inline-block">
                <span className="gold-gradient-text pb-2">GLITTERZ</span>
                <div className="tg-sparkle s2" />
                <div className="tg-sparkle s4" />
              </span>
            </h1>

            <p className="tg-sub uppercase tracking-[0.2em] font-medium">
              Stay Trendy, Shine Glittery
            </p>

            <div className="tg-ctas">
              <button className="tg-btn-fill" onClick={handleShop}>
                Start Shopping
              </button>
              <button className="tg-btn-ghost" onClick={handleShop}>
                Explore
                <span className="tg-ghost-circle">
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none"
                    stroke="currentColor" strokeWidth="2"
                    strokeLinecap="round" strokeLinejoin="round">
                    <line x1="5" y1="12" x2="19" y2="12" />
                    <polyline points="12 5 19 12 12 19" />
                  </svg>
                </span>
              </button>
            </div>

            <div className="tg-stats">
              <div>
                <div className="tg-stat-num gold-gradient-text">2K+</div>
                <div className="tg-stat-lbl">Products</div>
              </div>
              <div>
                <div className="tg-stat-num gold-gradient-text">50K+</div>
                <div className="tg-stat-lbl">Customers</div>
              </div>
              <div>
                <div className="tg-stat-num gold-gradient-text">4.9</div>
                <div className="tg-stat-lbl">Rating</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
