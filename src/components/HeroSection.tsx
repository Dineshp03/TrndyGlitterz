"use client";

import { useEffect, useState } from "react";

/* ─── reference photo (base64) ─────────────────────────────────────────── */
const IMG_SRC =
  "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEASABIAAD/4QtNaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wLwA8P3hwYWNrZXQgYmVnaW49J++7vycgaWQ9J1c1TTBNcENlaGlIenJlU3pOVGN6a2M5ZCc/Pgo8eDp4bXBtZXRhIHhtbG5zOng9J2Fkb2JlOm5zOm1ldGEvJyB4OnhtcHRrPSdJbWFnZTo6RXhpZlRvb2wgMTIuNzYnPgo8cmRmOlJERiB4bWxuczpyZGY9J2h0dHA6Ly93d3cudzMub3JnLzE5OTkvMDIvMjItcmRmLXN5bnRheC1ucyMnPgoKIDxyZGY6RGVzY3JpcHRpb24gcmRmOmFib3V0PScnCiAgeG1sbnM6ZGM9J2h0dHA6Ly9wdXJsLm9yZy9kYy9lbGVtZW50cy8xLjEvJz4KICA8ZGM6dGl0bGU+CiAgIDxyZGY6QWx0PgogICAgPHJkZjpsaSB4bWw6bGFuZz0neC1kZWZhdWx0Jz5pbWFnZS5qcGVnPC9yZGY6bGk+CiAgIDwvcmRmOkFsdD4KICA8L2RjOnRpdGxlPgogPC9yZGY6RGVzY3JpcHRpb24+CjwvcmRmOlJERj4KPC94OnhtcG1ldGE+CiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCjw/eHBhY2tldCBlbmQ9J3cnPz7/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wgARCARQAuADASIAAhEBAxEB/8QAGwABAQEBAQEBAQAAAAAAAAAAAAECAwQFBgf/xAAYAQEBAQEBAAAAAAAAAAAAAAAAAQIDBP/aAAwDAQACEAMQAAAB/lYsAAAqUAJRLAUlQqCgAAAAAAAAAAJSAFJQAAIKlAACUAIKBKJYLAoBAAABQiwAAAAAsABYAACgAAAAAAAAgshalCIoAAAoIAChUEKACKAAEogFgsAUgAAAAAKCLAAohSLAUAAAAAAAAIBJQACwWCkLLCpQlABCgErSEqUAAAAAAAAQAAABSAFIAABQlAlAAAAAAAAIFCEoigQAVCkABSKAEoLBFIUAWWwAAAAABLAsALAAAAqUAllIoIKAAAAAAAAQsJQAAAEBYLAUIoAAAEKAgoBBZRZLNoCwALABKJQQAAAACwoJULAUAAAAAAABBKllAAAQoIACgAAAAJSUJZRKAEsKlIsLYqpUAAAAAigQAAsUiwKEoAAAAAAAAEBFqWCCpQAAAAQoAABAUEKAAAABKAACE0KAAAAAgAAFgAWUAAAAFEUiiWVEFQlAAhSUAIBQJQBKAAABBQAAAAAAsAABYqhAAEolgssABSAAqUAAAAAoQFBJLFCUAABLAAUAlAQoCUAAigAAKAACAAAIUllKlsLAAAABLBYAKQoAAAACwoARLFglAAABEsVQAlAEBQAAAAAoAACwAgAKCBCgWLKAAAABLAsFlAJQALACyiFALBGbFliWgSwqAoSglCUiiAqCkFAAAqooiwAAAAACAAIoAqWwAAAABLBZQABYLAqUBJQsoi5WCVKJQAShKCUlAABKIoAAClAQoEolBAAAACAAAAFiqEWUSwAAAlAAAAoAFSKIBmxoIECgAACWUAASwWCgLKFIsCwWCgAIALAAFIoggAAAStJUVCwAAAAAAAFEALBQhCCaAllAEsFlEoASgAAAKAAWAABYAACwAFIAAAAIAAWLKogLAAAAAWUBFlCULACZsUJQAAAJQAAAAACgAAAALAoIACwBSWAAAAAICgANBAIAAAUgKApIolAsLmwkJoAAAAQoAAEolAKAAAAAAAoIUlgssKlJQgAAAAgKAJY0lsSiLCwAAFAEWUFAIBLlYJQAAAEsFgqUEKAAKAAABAUAAAAABYKgssBSLCwAABSAtlQCUAEolEBVlQBUixaiiZuVCUAQUEogCwWCygAKAABAUsSglBKUQLAAAAABZQBLACwAALVRAAAABAVRALKiWWksMxFolAAAlAACLCpQKAAAUJULLAEspUAAACoBSLAAUAQAAALKS2VEsAUBKAAKEAogShCZpQlAAAiiAoIUACgFlAACVIogAUCwACwAAFIUAARSKIABZU1YQCKIoSwBRUCAKirFJnWVgUIAAAgFQUAFgCiwKQgsollIogAAUAAUgAFgoQFllJQAAiiWVNKRKiCgEsAVZUCAoCgmdZWBQgABQFMtZoAUgKEAAlAAAAACKWAAAAWUBAACFsCwAALWkSpIKAAiwWUCAApZoixJjeGglAJQBYqiKmiTUsgAJQASgohRKIsACwSiFIAFAFSKAAJYAUICik2sAkgAoQsoAFiWCpaWAEznWWhJalEsKlFmjLQlgosiwLAtWCIoFIoKJNQzQSwCwBKIAolAAsABCyxQAKhNs00lkSwCoUCJSliKCUqgSjnLFCWUEoAtikCalFILEWUBRSLBVIUFljUqTUSSiTUJNKk1EiiBSxFlEoKJLFikgVvFCxJvOgWSAKIAAACgBFlouFwGggAACyylUzvNjTUiLKigoiiWpZVItXNujLZebpE5ukObYw0TDSszcMzRIujDVMXVjLel4zvDg64s5tZprNS3I1c6kAiwALACoqiARZaAY3hciaAAAFrUu45XQzNZN65dIssJSgFllpVLuXOunSa49O3SXz69VXyvZDx59uDxT1SzyT1ZTy59avG9OU87uTi7jje2zza9fWa8nf07msZ9KPneX6visAAAAA";

/* ─── particles config ──────────────────────────────────────────────────── */
const PARTICLES = [
  { id: 1,  size: 5, left: "7%",  delay: "0s",   dur: "7s",   color: "#B5456B" },
  { id: 2,  size: 3, left: "17%", delay: "1.5s", dur: "9s",   color: "#D4537E" },
  { id: 3,  size: 4, left: "29%", delay: "0.6s", dur: "6.5s", color: "#B5456B" },
  { id: 4,  size: 3, left: "41%", delay: "2.3s", dur: "8s",   color: "#E8A0B8" },
  { id: 5,  size: 5, left: "53%", delay: "1s",   dur: "10s",  color: "#B5456B" },
  { id: 6,  size: 3, left: "64%", delay: "1.8s", dur: "7s",   color: "#D4537E" },
  { id: 7,  size: 4, left: "74%", delay: "0.3s", dur: "8.5s", color: "#E8A0B8" },
  { id: 8,  size: 5, left: "83%", delay: "2.8s", dur: "9.5s", color: "#B5456B" },
  { id: 9,  size: 3, left: "91%", delay: "1.1s", dur: "6s",   color: "#D4537E" },
  { id: 10, size: 4, left: "3%",  delay: "3.3s", dur: "7.5s", color: "#E8A0B8" },
];

/* ─── scoped CSS ────────────────────────────────────────────────────────── */
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:ital,wght@0,300;0,400;0,500;1,300&display=swap');

.tg-hero-wrap {
  position: relative;
  background: #F8F5F7;
  font-family: 'DM Sans', sans-serif;
  overflow: hidden;
}

/* ── Particles ── */
.tg-dot {
  position: absolute;
  bottom: -8px;
  border-radius: 50%;
  opacity: 0;
  pointer-events: none;
  z-index: 2;
  will-change: transform, opacity;
  animation: tgFloat var(--tg-dur) var(--tg-delay) ease-in-out infinite;
}
@keyframes tgFloat {
  0%   { transform: translateY(0)      scale(1);    opacity: 0; }
  10%  {                                             opacity: 0.55; }
  50%  { transform: translateY(-46vh)  scale(1.25); opacity: 0.35; }
  90%  {                                             opacity: 0.1; }
  100% { transform: translateY(-94vh)  scale(0.8);  opacity: 0; }
}

/* ── 50/50 grid ── */
.tg-grid {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100svh;
  position: relative;
  z-index: 5;
}

/* ── Left pane ── */
.tg-left {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  text-align: center;
  padding: 130px 44px 80px 44px;
  max-width: 800px;
}
.tg-eyebrow {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  font-size: 10px;
  letter-spacing: 3.5px;
  text-transform: uppercase;
  color: #B5456B;
  margin-bottom: 20px;
  opacity: 0;
  transform: translateY(16px);
  will-change: transform, opacity;
  animation: tgUp 0.65s 0.1s ease forwards;
}
.tg-eyebrow::before, .tg-eyebrow::after {
  content: '';
  width: 24px; height: 1px;
  background: #B5456B;
  flex-shrink: 0;
}
.tg-h1 {
  font-family: 'Bebas Neue', sans-serif;
  font-size: clamp(72px, 12vw, 160px);
  line-height: 0.88;
  color: #2D1B2E;
  letter-spacing: 2px;
  margin-bottom: 22px;
  overflow: hidden;
}
.tg-h1-l {
  display: block;
  opacity: 0;
  transform: translateY(60px);
  will-change: transform, opacity;
}
.tg-h1-l:nth-child(1) { animation: tgSlide 0.75s 0.3s  cubic-bezier(.16,1,.3,1) forwards; }
.tg-h1-l:nth-child(2) { animation: tgSlide 0.75s 0.46s cubic-bezier(.16,1,.3,1) forwards; }
.tg-sub {
  font-size: 16px;
  font-weight: 300;
  color: #2D1B2E;
  line-height: 1.7;
  max-width: 420px;
  margin-bottom: 38px;
  opacity: 0;
  will-change: transform, opacity;
  animation: tgUp 0.65s 0.68s ease forwards;
}
.tg-ctas {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 20px;
  opacity: 0;
  will-change: transform, opacity;
  animation: tgUp 0.65s 0.88s ease forwards;
}
.tg-btn-fill {
  background: #B5456B;
  color: #fff;
  border: none;
  padding: 13px 36px;
  border-radius: 50px;
  font-family: 'DM Sans', sans-serif;
  font-size: 11px;
  font-weight: 500;
  letter-spacing: 2px;
  text-transform: uppercase;
  cursor: pointer;
  white-space: nowrap;
  transition: background 0.22s, transform 0.15s, box-shadow 0.22s;
}
.tg-btn-fill:hover {
  background: #9E3459;
  transform: translateY(-2px);
  box-shadow: 0 12px 30px rgba(181,69,107,0.32);
}
.tg-btn-ghost {
  background: none;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  font-family: 'DM Sans', sans-serif;
  font-size: 11px;
  letter-spacing: 2px;
  text-transform: uppercase;
  color: #2D1B2E;
  opacity: 0.45;
  white-space: nowrap;
  transition: opacity 0.2s;
}
.tg-btn-ghost:hover { opacity: 1; }
.tg-ghost-circle {
  width: 28px; height: 28px;
  border-radius: 50%;
  border: 1px solid rgba(45,27,46,0.22);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  transition: border-color 0.2s, transform 0.2s;
}
.tg-btn-ghost:hover .tg-ghost-circle {
  border-color: rgba(45,27,46,0.55);
  transform: translateX(3px);
}
.tg-stats {
  display: flex;
  justify-content: center;
  gap: 48px;
  margin-top: 46px;
  padding-top: 28px;
  border-top: 1px solid rgba(45,27,46,0.09);
  opacity: 0;
  width: 100%;
  will-change: transform, opacity;
  animation: tgUp 0.65s 1.08s ease forwards;
}
.tg-stat-num {
  font-family: 'Bebas Neue', sans-serif;
  font-size: 34px;
  letter-spacing: 1px;
  color: #2D1B2E;
  line-height: 1;
}
.tg-stat-num em { color: #B5456B; font-style: normal; }
.tg-stat-lbl {
  font-size: 10px;
  color: #2D1B2E;
  opacity: 0.38;
  letter-spacing: 0.4px;
  margin-top: 4px;
  font-weight: 300;
}

/* ── keyframes ── */
@keyframes tgUp {
  from { opacity: 0; transform: translateY(18px); }
  to   { opacity: 1; transform: translateY(0); }
}
@keyframes tgSlide {
  from { opacity: 0; transform: translateY(60px); }
  to   { opacity: 1; transform: translateY(0); }
}
@keyframes tgFade {
  from { opacity: 0; }
  to   { opacity: 1; }
}

/* ════════ MOBILE ≤ 640px ════════ */
@media (max-width: 640px) {
  .tg-left {
    padding: 120px 20px 60px;
  }
  .tg-eyebrow { 
    font-size: 9px; 
    margin-bottom: 14px; 
  }
  .tg-h1 { font-size: clamp(68px, 20vw, 92px); margin-bottom: 14px; }
  .tg-sub { 
    font-size: 14px; 
    max-width: 100%; 
    margin-bottom: 26px; 
  }
  .tg-ctas { 
    gap: 14px;
  }
  .tg-btn-fill { padding: 11px 26px; font-size: 10px; }
  .tg-btn-ghost { font-size: 10px; }
  .tg-stats { gap: 32px; margin-top: 30px; padding-top: 20px; }
  .tg-stat-num { font-size: 28px; }
  .tg-stat-lbl { font-size: 9px; }
}
`;

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
      <style>{CSS}</style>

      <div className="tg-hero-wrap">

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
            <div className="tg-eyebrow">SS 2025 Collection</div>

            <h1 className="tg-h1">
              <span className="tg-h1-l">TRENDY</span>
              <span className="tg-h1-l">GLITTERZ</span>
            </h1>

            <p className="tg-sub">
              Brand of functional accessories<br />
              crafted for an active lifestyle.
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
                <div className="tg-stat-num">2<em>K+</em></div>
                <div className="tg-stat-lbl">Products</div>
              </div>
              <div>
                <div className="tg-stat-num">50<em>K+</em></div>
                <div className="tg-stat-lbl">Customers</div>
              </div>
              <div>
                <div className="tg-stat-num">4.<em>9</em></div>
                <div className="tg-stat-lbl">Rating</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
