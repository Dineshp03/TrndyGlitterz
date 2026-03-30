import { create } from "zustand";
import { persist } from "zustand/middleware";
import { Product, products as initialProducts } from "@/data/products";

interface ProductState {
  products: Product[];
  categories: string[];
  addProduct: (product: Product) => void;
  updateProduct: (product: Product) => void;
  deleteProduct: (id: string) => void;
  deleteAllProducts: () => void;
  setProducts: (products: Product[]) => void;
  syncWithInitial: () => void;
}

export const useProductStore = create<ProductState>()(
  persist(
    (set) => ({
      products: initialProducts,
      categories: Array.from(new Set(initialProducts.map(p => p.category).filter(Boolean))),
      addProduct: (product) => {
        set((state) => {
          const newProducts = [...state.products, product];
          return {
            products: newProducts,
            categories: Array.from(new Set(newProducts.map(p => p.category).filter(Boolean)))
          };
        });
      },
      updateProduct: (product) => {
        set((state) => {
          const newProducts = state.products.map((p) => (p.id === product.id ? product : p));
          return {
            products: newProducts,
            categories: Array.from(new Set(newProducts.map(p => p.category).filter(Boolean)))
          };
        });
      },
      deleteProduct: (id) => {
        set((state) => {
          const newProducts = state.products.filter((p) => String(p.id) !== String(id));
          return {
            products: newProducts,
            categories: Array.from(new Set(newProducts.map(p => p.category).filter(Boolean)))
          };
        });
      },
      deleteAllProducts: () => set({ products: [], categories: [] }),
      setProducts: (products) => set({ 
        products, 
        categories: Array.from(new Set(products.map(p => p.category).filter(Boolean)))
      }),
      syncWithInitial: () => {
        set({ 
          products: initialProducts,
          categories: Array.from(new Set(initialProducts.map(p => p.category).filter(Boolean)))
        });
      },
    }),
    {
      name: "trendy-products",
    }
  )
);
