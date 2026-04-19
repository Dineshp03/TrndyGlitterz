import { create } from "zustand";
import { Product } from "@/data/products";
import { fetchApi } from "@/lib/api";

interface ProductState {
  products: Product[];
  categories: string[];
  isLoading: boolean;
  
  fetchProducts: (params?: { category?: string; featured?: boolean; search?: string }) => Promise<void>;
  addProduct: (product: Product, token: string) => Promise<void>;
  updateProduct: (product: Product, token: string) => Promise<void>;
  deleteProduct: (id: string, token: string) => Promise<void>;
  deleteAllProducts: (token?: string) => Promise<void>;
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
      const query = new URLSearchParams();
      if (params.category) query.append("category", params.category);
      if (params.featured) query.append("featured", "true");
      if (params.search) query.append("search", params.search);

      const { products } = await fetchApi(`/api/products?${query.toString()}`);
      
      const mappedProducts: Product[] = products.map((p: any, index: number) => ({
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
      await fetchApi("/api/products", {
        method: "POST",
        body: JSON.stringify({
          name: product.name,
          price: product.price,
          oldPrice: product.oldPrice,
          category: product.category,
          image: product.image,
          images: product.images,
          description: product.description,
          stock: product.stock,
          featured: product.featured,
          isImported: product.isImported,
          // No id — Supabase auto-generates a UUID
        }),
      }, token);
      await get().fetchProducts();
    } catch (error) {
      console.error("addProduct error:", error);
      throw error; // Re-throw so the UI can show a toast
    }
  },

  updateProduct: async (product, token) => {
    try {
      await fetchApi(`/api/products/${product.id}`, {
        method: "PATCH",
        body: JSON.stringify({
          name: product.name,
          price: product.price,
          oldPrice: product.oldPrice,
          category: product.category,
          image: product.image,
          images: product.images,
          description: product.description,
          stock: product.stock,
          featured: product.featured,
          isImported: product.isImported,
        }),
      }, token);
      await get().fetchProducts();
    } catch (error) {
      console.error("updateProduct error:", error);
    }
  },

  deleteProduct: async (id, token) => {
    try {
      await fetchApi(`/api/products/${id}`, {
        method: "DELETE",
      }, token);
      await get().fetchProducts();
    } catch (error) {
      console.error("deleteProduct error:", error);
    }
  },

  deleteAllProducts: async (token) => {
    // Note: No explicit "delete all" route currently exists to prevent accidents.
    // This method would call a specific bulk delete if implemented.
    console.warn("deleteAllProducts not implemented in backend API for safety.");
  },

  setProducts: (products) => set({ 
    products, 
    categories: Array.from(new Set(products.map(p => p.category).filter(Boolean)))
  }),

  syncWithInitial: async () => {
    await get().fetchProducts();
  },
}));
