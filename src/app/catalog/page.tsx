"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useProductStore } from "@/store/useProductStore";
import ProductCard from "@/components/ProductCard";
import Link from "next/link";
import { ArrowLeft, SlidersHorizontal, X } from "lucide-react";
import { Suspense, useState, useMemo, useEffect } from "react";

const CATEGORY_GROUPS = [
  {
    label: "Xuping Exclusive",
    items: [
      { label: "Earrings", param: "Xuping Earrings" },
      { label: "Neckpiece", param: "Xuping Neckpiece" },
      { label: "Bracelets", param: "Xuping Bracelets" },
      { label: "Finger Rings", param: "Xuping Finger Rings" },
    ],
  },
  {
    label: "Browse Categories",
    items: [
      { label: "Earrings", param: "Earrings" },
      { label: "Korean Earrings", param: "Korean Earrings" },
      { label: "Traditional Earrings", param: "Traditional Earrings" },
      { label: "Neckpiece", param: "Neckpiece" },
      { label: "Bracelets", param: "Bracelets" },
      { label: "Finger Rings", param: "Finger Rings" },
      { label: "Hair Accessories", param: "Hair Accessories" },
      { label: "Chains", param: "Chains" },
      { label: "Rings", param: "Rings" },
      { label: "Bands", param: "Bands" },
    ],
  },
];

type PriceFilter = { label: string; param: string; min?: number; max?: number; };

const PRICE_FILTERS: PriceFilter[] = [
  { label: "Under ₹99",  param: "under-99",  max: 99 },
  { label: "Under ₹299", param: "under-299", max: 299 },
  { label: "Under ₹499", param: "under-499", max: 499 },
  { label: "Premium Range", param: "premium-500", min: 500 },
];

/* ─── Dark theme tokens ──────────────────────────────────────────────────────── */
const T = {
  bg:          "#0A0A0A",
  bgCard:      "#111111",
  border:      "rgba(255,255,255,0.08)",
  borderGold:  "rgba(212,175,55,0.35)",
  text:        "#FAFAFA",
  textMuted:   "rgba(250,250,250,0.45)",
  textDim:     "rgba(250,250,250,0.22)",
  gold:        "#D4AF37",
  goldDim:     "rgba(212,175,55,0.15)",
  active:      "#D4AF37",
  activeTxt:   "#0A0A0A",
  activeAlt:   "#FAFAFA",
  activeAltTxt:"#0A0A0A",
};

function FilterBtn({
  active, onClick, children, gold = false,
}: { active: boolean; onClick: () => void; children: React.ReactNode; gold?: boolean }) {
  return (
    <button
      onClick={onClick}
      style={{
        textAlign: "left",
        fontSize: "13px",
        padding: "7px 14px",
        borderRadius: "8px",
        width: "100%",
        border: active ? "none" : "none",
        cursor: "pointer",
        fontFamily: "sans-serif",
        transition: "all 0.2s",
        background: active
          ? gold ? T.gold : "rgba(250,250,250,0.12)"
          : "transparent",
        color: active
          ? gold ? T.activeTxt : T.text
          : T.textMuted,
      }}
    >
      {children}
    </button>
  );
}

function CatalogContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [selectedCategory, setSelectedCategory] = useState<string | null>(searchParams.get("category"));
  const [selectedPrice,    setSelectedPrice]    = useState<string | null>(searchParams.get("price"));
  const [showOfferOnly,    setShowOfferOnly]    = useState(searchParams.get("offer")    === "true");
  const [filterPanelOpen,  setFilterPanelOpen]  = useState(false);

  // Sync state with URL search params
  useEffect(() => {
    setSelectedCategory(searchParams.get("category"));
    setSelectedPrice(searchParams.get("price"));
    setShowOfferOnly(searchParams.get("offer") === "true");
  }, [searchParams]);

  const { products, categories, syncWithInitial } = useProductStore();

  useEffect(() => {
    if (products.length === 0) {
      syncWithInitial();
    }
  }, [products.length, syncWithInitial]);

  const allCategories = useMemo(() => {
    const known = ["Earrings","Neckpiece","Bracelets","Finger Rings","Hair Accessories","Korean Earrings","Traditional Earrings","Chains","Rings","Bands","Xuping Earrings","Xuping Neckpiece","Xuping Bracelets","Xuping Finger Rings"];
    return Array.from(new Set([...known, ...(categories || [])])).filter(Boolean);
  }, [categories]);

  const filteredProducts = useMemo(() => {
    let items = products;
    if (selectedCategory) {
      items = items.filter(p => p.category === selectedCategory);
    }
    if (showOfferOnly)     items = items.filter(p => p.featured);
    if (selectedPrice) {
      const rule = PRICE_FILTERS.find(f => f.param === selectedPrice);
      if (rule) {
        if (rule.min !== undefined) items = items.filter(p => p.price >= rule.min!);
        if (rule.max !== undefined) items = items.filter(p => p.price <= rule.max!);
      }
    }
    return items;
  }, [selectedCategory, showOfferOnly, selectedPrice, products]);

  // Scroll lock for mobile filter drawer
  useEffect(() => {
    if (filterPanelOpen && window.innerWidth < 768) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => { document.body.style.overflow = "unset"; };
  }, [filterPanelOpen]);

  const hasActiveFilters = selectedCategory || selectedPrice || showOfferOnly;

  const clearAll = () => {
    updateFilters(null, null, false);
  };

  const activeLabel = selectedCategory
    ? selectedCategory
    : selectedPrice
    ? (PRICE_FILTERS.find(f => f.param === selectedPrice)?.label ?? "Collection")
    : showOfferOnly ? "Offer Zone" : "All Collections";

  const updateFilters = (category: string | null, price: string | null, offer: boolean) => {
    const params = new URLSearchParams();
    if (category) params.set("category", category);
    if (price)    params.set("price", price);
    if (offer)    params.set("offer", "true");
    
    const query = params.toString();
    router.push(`/catalog${query ? `?${query}` : ""}`);
  };

  return (
    <div style={{ minHeight: "100vh", backgroundColor: T.bg, paddingTop: "100px", paddingBottom: "100px" }}>
      <div style={{ maxWidth: "1400px", margin: "0 auto", padding: "0 24px" }}>

        {/* ── Header ── */}
        <div style={{
          display: "flex", flexWrap: "wrap", alignItems: "flex-end",
          justifyContent: "space-between", marginBottom: "40px",
          paddingBottom: "32px", borderBottom: `1px solid ${T.border}`, gap: "16px",
        }}>
          <div>
            <Link
              href="/"
              style={{ display: "inline-flex", alignItems: "center", gap: "8px", fontSize: "10px", letterSpacing: "0.2em", textTransform: "uppercase", color: T.textMuted, textDecoration: "none", marginBottom: "16px" }}
            >
              <ArrowLeft style={{ width: "12px", height: "12px" }} />
              Back to Home
            </Link>

            {/* Gold gradient title */}
            <h1 style={{
              fontSize: "clamp(36px, 7vw, 80px)",
              fontFamily: "var(--font-bebas, Georgia, serif)",
              letterSpacing: "2px",
              textTransform: "uppercase",
              margin: 0,
              background: "linear-gradient(to right, #BF953F 0%, #FCF6BA 30%, #B38728 55%, #FBF5B7 80%, #BF953F 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
              backgroundSize: "200% auto",
            }}>
              {activeLabel}
            </h1>

            <p style={{ marginTop: "10px", fontSize: "11px", color: T.textMuted, letterSpacing: "0.25em", textTransform: "uppercase" }}>
              {filteredProducts.length} {filteredProducts.length === 1 ? "Piece" : "Pieces"} found
            </p>
          </div>

          {/* Mobile filter toggle */}
          <button
            onClick={() => setFilterPanelOpen(!filterPanelOpen)}
            style={{
              display: "flex", alignItems: "center", gap: "8px", fontSize: "10px",
              letterSpacing: "0.15em", textTransform: "uppercase",
              border: `1px solid ${T.border}`, color: T.textMuted, background: "transparent",
              padding: "10px 18px", borderRadius: "50px", cursor: "pointer",
            }}
          >
            <SlidersHorizontal style={{ width: "13px", height: "13px" }} />
            Filters
            {hasActiveFilters && (
              <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: T.gold, display: "inline-block" }} />
            )}
          </button>
        </div>

        <div style={{ display: "flex", gap: "48px", alignItems: "flex-start" }}>

          {/* ── Filter Drawer / Sidebar ── */}
          <>
            {/* Mobile Backdrop */}
            <div 
              className={`fixed inset-0 bg-black/70 backdrop-blur-md z-[100] transition-opacity duration-500 md:hidden ${
                filterPanelOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
              }`}
              onClick={() => setFilterPanelOpen(false)}
            />

            <aside
              className={`
                fixed top-0 right-0 h-full w-[300px] bg-[#0A0A0A] z-[101] shadow-2xl p-8
                transform transition-transform duration-500 ease-[cubic-bezier(0.23,1,0.32,1)]
                md:relative md:top-0 md:right-0 md:h-auto md:w-[210px] md:z-0 md:shadow-none md:transform-none md:p-0 md:block
                ${filterPanelOpen ? "translate-x-0" : "translate-x-full md:translate-x-0"}
                ${filterPanelOpen ? "block" : "hidden md:block"}
              `}
              style={{ 
                flexShrink: 0, 
                position: filterPanelOpen ? "fixed" : "sticky", 
                top: filterPanelOpen ? "0" : "112px",
                overflowY: filterPanelOpen ? "auto" : "visible"
              }}
            >
              <div style={{ display: "flex", flexDirection: "column", gap: "28px" }}>

                {/* Mobile Header for Filter Panel */}
                <div className="flex justify-between items-center mb-4 md:hidden">
                  <span className="text-xs font-serif text-white/90 tracking-[0.3em] uppercase">Filters</span>
                  <button onClick={() => setFilterPanelOpen(false)} className="p-2 -mr-2 text-white/40 hover:text-white transition-colors">
                    <X className="w-5 h-5" strokeWidth={1.5} />
                  </button>
                </div>

                {hasActiveFilters && (
                  <button
                    onClick={clearAll}
                    style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "10px", letterSpacing: "0.15em", textTransform: "uppercase", color: T.gold, background: "rgba(212,175,55,0.1)", border: `1px solid ${T.borderGold}`, cursor: "pointer", padding: "8px 12px", borderRadius: "4px", width: "fit-content" }}
                  >
                    <X style={{ width: "12px", height: "12px" }} /> Clear All
                  </button>
                )}

                {/* Category groups */}
                {CATEGORY_GROUPS.map((group) => (
                  <div key={group.label}>
                    <p style={{ 
                      fontSize: "10px", 
                      fontFamily: "monospace", 
                      letterSpacing: "0.35em", 
                      textTransform: "uppercase", 
                      margin: "0 0 12px 0",
                      background: "linear-gradient(to right, #BF953F 0%, #B38728 50%, #BF953F 100%)",
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                      backgroundClip: "text",
                      fontWeight: "bold"
                    }}>
                      {group.label}
                    </p>
                    <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                      {group.items.map(cat => (
                        <FilterBtn 
                          key={cat.param} 
                          active={selectedCategory === cat.param} 
                          onClick={() => {
                            updateFilters(selectedCategory === cat.param ? null : cat.param, selectedPrice, showOfferOnly);
                            if (window.innerWidth < 768) setFilterPanelOpen(false);
                          }}
                        >
                          {cat.label}
                        </FilterBtn>
                      ))}
                    </div>
                  </div>
                ))}

                {/* Extra categories */}
                {allCategories.filter(c => !CATEGORY_GROUPS.flatMap(g => g.items).some(item => item.param === c)).length > 0 && (
                  <div>
                    <p style={{ 
                      fontSize: "10px", 
                      fontFamily: "monospace", 
                      letterSpacing: "0.35em", 
                      textTransform: "uppercase", 
                      margin: "0 0 12px 0",
                      background: "linear-gradient(to right, #BF953F 0%, #B38728 50%, #BF953F 100%)",
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                      backgroundClip: "text",
                      fontWeight: "bold"
                    }}>More</p>
                    <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                      {allCategories
                        .filter(c => !CATEGORY_GROUPS.flatMap(g => g.items).some(item => item.param === c))
                        .map(cat => (
                          <FilterBtn 
                            key={cat} 
                            active={selectedCategory === cat} 
                            onClick={() => {
                              updateFilters(selectedCategory === cat ? null : cat, selectedPrice, showOfferOnly);
                              if (window.innerWidth < 768) setFilterPanelOpen(false);
                            }}
                          >
                            {cat}
                          </FilterBtn>
                        ))
                      }
                    </div>
                  </div>
                )}

                {/* Price */}
                <div>
                  <p style={{ 
                    fontSize: "10px", 
                    fontFamily: "monospace", 
                    letterSpacing: "0.35em", 
                    textTransform: "uppercase", 
                    margin: "0 0 12px 0",
                    background: "linear-gradient(to right, #BF953F 0%, #B38728 50%, #BF953F 100%)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    backgroundClip: "text",
                    fontWeight: "bold"
                  }}>Price Based</p>
                  <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                    {PRICE_FILTERS.map(pf => (
                      <FilterBtn 
                        key={pf.param} 
                        active={selectedPrice === pf.param} 
                        onClick={() => {
                          updateFilters(selectedCategory, selectedPrice === pf.param ? null : pf.param, showOfferOnly);
                          if (window.innerWidth < 768) setFilterPanelOpen(false);
                        }} 
                        gold
                      >
                        {pf.label}
                      </FilterBtn>
                    ))}
                  </div>
                </div>

                {/* Offers */}
                <div>
                  <p style={{ 
                    fontSize: "10px", 
                    fontFamily: "monospace", 
                    letterSpacing: "0.35em", 
                    textTransform: "uppercase", 
                    margin: "0 0 12px 0",
                    background: "linear-gradient(to right, #BF953F 0%, #B38728 50%, #BF953F 100%)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    backgroundClip: "text",
                    fontWeight: "bold"
                  }}>Offers</p>
                  <FilterBtn 
                    active={showOfferOnly} 
                    onClick={() => {
                      updateFilters(selectedCategory, selectedPrice, !showOfferOnly);
                      if (window.innerWidth < 768) setFilterPanelOpen(false);
                    }} 
                    gold
                  >
                    Offer Zone
                  </FilterBtn>
                </div>

                {/* Divider + View Count */}
                <div style={{ borderTop: `1px solid ${T.border}`, paddingTop: "16px" }}>
                  <p style={{ fontSize: "10px", color: T.textDim, letterSpacing: "0.1em" }}>
                    {filteredProducts.length} results
                  </p>
                </div>
              </div>
            </aside>
          </>

          {/* ── Products Grid ── */}
          <div style={{ flex: 1, minWidth: 0 }}>

            {/* Active filter tags */}
            {hasActiveFilters && (
              <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginBottom: "24px" }}>
                {selectedCategory && (
                  <span style={{ display: "inline-flex", alignItems: "center", gap: "6px", fontSize: "10px", letterSpacing: "0.15em", textTransform: "uppercase", background: "rgba(250,250,250,0.1)", color: T.text, padding: "5px 14px", borderRadius: "50px", border: `1px solid ${T.border}` }}>
                    {selectedCategory}
                    <button onClick={() => updateFilters(null, selectedPrice, showOfferOnly)} style={{ background: "none", border: "none", cursor: "pointer", color: T.textMuted, padding: 0, display: "flex" }}><X style={{ width: "11px", height: "11px" }} /></button>
                  </span>
                )}
                {selectedPrice && (
                  <span style={{ display: "inline-flex", alignItems: "center", gap: "6px", fontSize: "10px", letterSpacing: "0.15em", textTransform: "uppercase", background: T.goldDim, color: T.gold, padding: "5px 14px", borderRadius: "50px", border: `1px solid ${T.borderGold}` }}>
                    {PRICE_FILTERS.find(f => f.param === selectedPrice)?.label}
                    <button onClick={() => updateFilters(selectedCategory, null, showOfferOnly)} style={{ background: "none", border: "none", cursor: "pointer", color: T.gold, padding: 0, display: "flex" }}><X style={{ width: "11px", height: "11px" }} /></button>
                  </span>
                )}
                {showOfferOnly && (
                  <span style={{ display: "inline-flex", alignItems: "center", gap: "6px", fontSize: "10px", letterSpacing: "0.15em", textTransform: "uppercase", background: T.goldDim, color: T.gold, padding: "5px 14px", borderRadius: "50px", border: `1px solid ${T.borderGold}` }}>
                    Offer Zone
                    <button onClick={() => updateFilters(selectedCategory, selectedPrice, false)} style={{ background: "none", border: "none", cursor: "pointer", color: T.gold, padding: 0, display: "flex" }}><X style={{ width: "11px", height: "11px" }} /></button>
                  </span>
                )}
              </div>
            )}

            {/* Product grid */}
            <div className="grid grid-cols-2 sm:grid-cols-[repeat(auto-fill,minmax(175px,1fr))] gap-x-4 md:gap-x-4 gap-y-8 md:gap-y-7 px-0">
              {filteredProducts.map((product, index) => (
                <div
                  key={product.id}
                  className="animate-reveal"
                  style={{ animationDelay: `${index * 40}ms` }}
                >
                  <ProductCard product={product} />
                </div>
              ))}
            </div>

            {filteredProducts.length === 0 && (
              <div style={{ padding: "96px 0", textAlign: "center" }}>
                <p style={{ fontFamily: "Georgia, serif", fontSize: "22px", color: T.textDim, fontStyle: "italic" }}>
                  No products found.
                </p>
                <button
                  onClick={clearAll}
                  style={{ marginTop: "16px", fontSize: "11px", letterSpacing: "0.2em", textTransform: "uppercase", color: T.gold, background: "none", border: "none", cursor: "pointer" }}
                >
                  Clear filters →
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CatalogPage() {
  return (
    <Suspense fallback={
      <div style={{ minHeight: "100vh", backgroundColor: "#0A0A0A", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "Georgia, serif", fontSize: "22px", fontStyle: "italic", color: "rgba(255,255,255,0.2)" }}>
        Loading Collection...
      </div>
    }>
      <CatalogContent />
    </Suspense>
  );
}
