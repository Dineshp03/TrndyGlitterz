import { create } from "zustand";
import { Product, products as initialProducts } from "@/data/products";
import { getSupabaseClient } from "@/lib/supabase";

// ─── Local cache helpers ────────────────────────────────────────────────────
const CACHE_KEY = "tg_products_cache";
const CACHE_TTL_MS = 10 * 60 * 1000; // 10 minutes

function readCache(): Product[] | null {
  try {
    if (typeof window === "undefined") return null;
    const raw = sessionStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const { ts, data } = JSON.parse(raw) as { ts: number; data: Product[] };
    if (Date.now() - ts > CACHE_TTL_MS) {
      sessionStorage.removeItem(CACHE_KEY);
      return null;
    }
    return data;
  } catch {
    return null;
  }
}

function writeCache(products: Product[]) {
  try {
    if (typeof window === "undefined") return;
    sessionStorage.setItem(CACHE_KEY, JSON.stringify({ ts: Date.now(), data: products }));
  } catch {
    // sessionStorage full – ignore
  }
}
// ────────────────────────────────────────────────────────────────────────────

interface ProductState {
  products: Product[];
  categories: string[];
  isLoading: boolean;
  supabaseDown: boolean;

  fetchProducts: (params?: { category?: string; featured?: boolean; search?: string }) => Promise<void>;
  addProduct: (product: Partial<Product>, token: string) => Promise<void>;
  updateProduct: (product: Product, token: string) => Promise<void>;
  deleteProduct: (id: string, token: string) => Promise<void>;
  deleteAllProducts: () => Promise<void>;
  setProducts: (products: Product[]) => void;
  syncWithInitial: () => Promise<void>;
}

function buildCategories(products: Product[]) {
  return Array.from(new Set(products.map((p) => p.category).filter(Boolean)));
}

export const useProductStore = create<ProductState>((set, get) => ({
  products: initialProducts,
  categories: buildCategories(initialProducts),
  isLoading: false,
  supabaseDown: false,

  fetchProducts: async (params = {}) => {
    // Only hit the network if no filters are applied AND fresh cache exists
    const isUnfiltered = !params.category && !params.featured && !params.search;
    if (isUnfiltered) {
      const cached = readCache();
      if (cached) {
        set({ products: cached, categories: buildCategories(cached), isLoading: false });
        return;
      }
    }

    set({ isLoading: true });
    try {
      const supabase = getSupabaseClient();
      let query = supabase.from("products").select("*").order("created_at", { ascending: false });

      if (params.category) query = query.eq("category", params.category);
      if (params.featured) query = query.eq("featured", true);
      if (params.search) query = query.ilike("name", `%${params.search}%`);

      const { data, error } = await query;

      if (error) throw error;

      const mappedProducts: Product[] = (data || []).map((p: {
        id: string;
        name: string;
        price: number;
        category: string;
        image: string;
        images?: string[];
        description?: string;
        stock?: number;
        featured?: boolean;
        is_imported?: boolean;
        is_sold_out?: boolean;
        isSoldOut?: boolean;
        soldOut?: boolean;
        old_price?: number;
        created_at: string;
      }) => ({
        id: p.id,
        name: p.name,
        price: p.price,
        category: p.category,
        image: p.image,
        images: p.images || [],
        description: p.description,
        stock: p.stock,
        featured: p.featured,
        isImported: p.is_imported,
        isSoldOut: Boolean(p.is_sold_out || p.isSoldOut || p.soldOut),
        is_sold_out: Boolean(p.is_sold_out),
        soldOut: Boolean(p.is_sold_out || p.isSoldOut || p.soldOut),
        oldPrice: p.old_price,
        createdAt: p.created_at,
      }));

      // Persist to session cache (unfiltered results only)
      if (isUnfiltered) writeCache(mappedProducts);

      set({
        products: mappedProducts,
        categories: buildCategories(mappedProducts),
        isLoading: false,
        supabaseDown: false,
      });
    } catch (e) {
      console.error("fetchProducts error:", e);
      // ── Graceful fallback ──────────────────────────────────────────────
      // Use stale session-cache if available, otherwise fall back to the
      // hardcoded initialProducts so the UI still renders something.
      const stale = (() => {
        try {
          if (typeof window === "undefined") return null;
          const raw = sessionStorage.getItem(CACHE_KEY);
          if (!raw) return null;
          return (JSON.parse(raw) as { ts: number; data: Product[] }).data;
        } catch { return null; }
      })();

      const fallback = stale ?? get().products ?? initialProducts;
      set({
        products: fallback,
        categories: buildCategories(fallback),
        isLoading: false,
        supabaseDown: true,
      });
    }
  },

  addProduct: async (product, token) => {
    try {
      const response = await fetch('/api/products', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(product),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Failed to add product');
      await get().fetchProducts();
    } catch (error) {
      console.error("addProduct error:", error);
      throw error;
    }
  },

  updateProduct: async (product, token) => {
    try {
      const response = await fetch('/api/products', {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(product),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Failed to update product');
      await get().fetchProducts();
    } catch (error) {
      console.error("updateProduct error:", error);
      throw error;
    }
  },

  deleteProduct: async (id, token) => {
    try {
      const response = await fetch(`/api/products?id=${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        },
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Failed to delete product');
      await get().fetchProducts();
    } catch (error) {
      console.error("deleteProduct error:", error);
      throw error;
    }
  },

  deleteAllProducts: async () => {
    console.warn("deleteAllProducts not implemented for safety.");
  },

  setProducts: (products) => set({
    products,
    categories: buildCategories(products),
  }),

  syncWithInitial: async () => {
    await get().fetchProducts();
  },
}));
