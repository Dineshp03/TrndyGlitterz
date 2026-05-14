import { create } from "zustand";
import { Product } from "@/data/products";
import { getSupabaseClient } from "@/lib/supabase";

interface ProductState {
  products: Product[];
  categories: string[];
  isLoading: boolean;
  
  fetchProducts: (params?: { category?: string; featured?: boolean; search?: string }) => Promise<void>;
  addProduct: (product: Partial<Product>, token: string) => Promise<void>;
  updateProduct: (product: Product, token: string) => Promise<void>;
  deleteProduct: (id: string, token: string) => Promise<void>;
  deleteAllProducts: () => Promise<void>;
  setProducts: (products: Product[]) => void;
  syncWithInitial: () => Promise<void>;
}

export const useProductStore = create<ProductState>((set, get) => ({
  products: [],
  categories: [],
  isLoading: false,

  fetchProducts: async (params = {}) => {
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
        oldPrice: p.old_price,
        createdAt: p.created_at,
      }));

      set({ 
        products: mappedProducts,
        categories: Array.from(new Set(mappedProducts.map(p => p.category).filter(Boolean))),
        isLoading: false,
      });
    } catch (e) {
      console.error("fetchProducts error:", e);
      set({ isLoading: false });
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
    categories: Array.from(new Set(products.map(p => p.category).filter(Boolean)))
  }),

  syncWithInitial: async () => {
    await get().fetchProducts();
  },
}));
