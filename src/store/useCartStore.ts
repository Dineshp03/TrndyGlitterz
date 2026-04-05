import { create } from "zustand";
import { fetchApi } from "@/lib/api";

// Product Interface
export interface Product {
  id: string;
  name: string;
  price: number;
  category: string;
  image: string;
  oldPrice?: number;
  stock?: number;
  images?: string[];
}

// Cart Item Interface
export interface CartItem {
  id: string; // The database row ID if it exists, otherwise the product ID
  productId: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
}

// Zustand Store
interface CartState {
  items: CartItem[];
  isCartOpen: boolean;
  isLoading: boolean;
  
  // State methods
  addItem: (product: Product, token?: string | null) => Promise<void>;
  removeItem: (productIdOrRowId: string, token?: string | null) => Promise<void>;
  updateQuantity: (productIdOrRowId: string, quantity: number, token?: string | null) => Promise<void>;
  
  // Cart management
  toggleCart: () => void;
  openCart: () => void;
  closeCart: () => void;
  clearCart: () => void;
  setItems: (items: CartItem[]) => void;
  
  // Calculation helpers
  getCartTotal: () => number;
  getCartCount: () => number;
  
  // Server-side fetching
  fetchCart: (token: string | null) => Promise<void>;
}

export const useCartStore = create<CartState>((set, get) => ({
  items: [],
  isCartOpen: false,
  isLoading: false,

  addItem: async (product, token) => {
    const { items } = get();
    const existingSyncItem = items.find((item) => item.productId === product.id);

    if (token) {
      set({ isLoading: true });
      try {
        const { cartItem: syncedItem } = await fetchApi("/api/cart", {
          method: "POST",
          body: JSON.stringify({ 
            productId: product.id, 
            quantity: existingSyncItem ? existingSyncItem.quantity + 1 : 1 
          }),
        }, token);

        if (existingSyncItem) {
          set((state) => ({
            items: state.items.map((item) =>
              item.productId === product.id ? { ...item, quantity: syncedItem.quantity } : item
            ),
            isCartOpen: true,
            isLoading: false,
          }));
        } else {
          set((state) => ({
            items: [
              ...state.items,
              {
                id: syncedItem.id,
                productId: product.id,
                name: product.name,
                price: product.price,
                quantity: 1,
                image: product.image,
              },
            ],
            isCartOpen: true,
            isLoading: false,
          }));
        }
      } catch (error) {
        console.error("Cart addItem error:", error);
        set({ isLoading: false });
      }
      return;
    }

    // Locale fallback for guests
    set((state) => {
      const existingItem = state.items.find((item) => item.productId === product.id);
      if (existingItem) {
        return {
          items: state.items.map((item) =>
            item.productId === product.id
              ? { ...item, quantity: item.quantity + 1 }
              : item
          ),
          isCartOpen: true,
        };
      }
      return {
        items: [
          ...state.items,
          {
            id: product.id,
            productId: product.id,
            name: product.name,
            price: product.price,
            quantity: 1,
            image: product.image,
          },
        ],
        isCartOpen: true,
      };
    });
  },

  removeItem: async (productIdOrRowId, token) => {
    if (token) {
      set({ isLoading: true });
      try {
        await fetchApi(`/api/cart/${productIdOrRowId}`, {
          method: "DELETE",
        }, token);
        set((state) => ({
          items: state.items.filter((item) => item.id !== productIdOrRowId),
          isLoading: false,
        }));
      } catch (error) {
        console.error("Cart removeItem error:", error);
        set({ isLoading: false });
      }
      return;
    }

    set((state) => ({
      items: state.items.filter((item) => item.id !== productIdOrRowId),
    }));
  },

  updateQuantity: async (productIdOrRowId, quantity, token) => {
    const qCount = Math.max(1, quantity);

    if (token) {
      set({ isLoading: true });
      try {
        await fetchApi(`/api/cart/${productIdOrRowId}`, {
          method: "PATCH",
          body: JSON.stringify({ quantity: qCount }),
        }, token);
        set((state) => ({
          items: state.items.map((item) =>
            item.id === productIdOrRowId ? { ...item, quantity: qCount } : item
          ),
          isLoading: false,
        }));
      } catch (error) {
        console.error("Cart updateQuantity error:", error);
        set({ isLoading: false });
      }
      return;
    }

    set((state) => ({
      items: state.items.map((item) =>
        item.id === productIdOrRowId ? { ...item, quantity: qCount } : item
      ),
    }));
  },

  toggleCart: () => set((state) => ({ isCartOpen: !state.isCartOpen })),
  openCart: () => set({ isCartOpen: true }),
  closeCart: () => set({ isCartOpen: false }),
  clearCart: () => set({ items: [] }),
  setItems: (items) => set({ items }),

  getCartTotal: () => {
    return get().items.reduce(
      (total, item) => total + item.price * item.quantity,
      0
    );
  },

  getCartCount: () => {
    return get().items.reduce((count, item) => count + item.quantity, 0);
  },

  fetchCart: async (token) => {
    if (!token) return;
    set({ isLoading: true });
    try {
      const { cart } = await fetchApi("/api/cart", {}, token);
      const mappedItems: CartItem[] = cart.map((row: any) => ({
        id: row.id,
        productId: row.product.id,
        name: row.product.name,
        price: row.product.price,
        quantity: row.quantity,
        image: row.product.image,
      }));
      set({ items: mappedItems, isLoading: false });
    } catch (error) {
      console.error("fetchCart error:", error);
      set({ isLoading: false });
    }
  },
}));

