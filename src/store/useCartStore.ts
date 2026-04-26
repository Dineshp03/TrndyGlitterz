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
    const newQuantity = existingSyncItem ? existingSyncItem.quantity + 1 : 1;

    // --- OPTIMISTIC UPDATE: Update UI immediately ---
    if (existingSyncItem) {
      set((state) => ({
        items: state.items.map((item) =>
          item.productId === product.id ? { ...item, quantity: newQuantity } : item
        ),
        isCartOpen: true,
      }));
    } else {
      set((state) => ({
        items: [
          ...state.items,
          {
            id: product.id, // Temporary ID, will be updated by server if logged in
            productId: product.id,
            name: product.name,
            price: product.price,
            quantity: 1,
            image: product.image,
          },
        ],
        isCartOpen: true,
      }));
    }

    if (!token) return; // Guest: local only

    // --- BACKGROUND SYNC: Sync with server ---
    try {
      const { cartItem: syncedItem } = await fetchApi("/api/cart", {
        method: "POST",
        body: JSON.stringify({ 
          productId: product.id, 
          quantity: newQuantity 
        }),
      }, token);

      // Update the local item with the real database ID
      set((state) => ({
        items: state.items.map((item) =>
          item.productId === product.id ? { ...item, id: syncedItem.id } : item
        ),
      }));
    } catch (error) {
      console.error("Cart addItem background sync error:", error);
      // Optional: Rollback if desired, but for jewelry apps, we usually just want it to work.
    }
  },

  removeItem: async (productIdOrRowId, token) => {
    const { items } = get();
    const removedItem = items.find((item) => item.id === productIdOrRowId);

    // --- OPTIMISTIC UPDATE ---
    set((state) => ({
      items: state.items.filter((item) => item.id !== productIdOrRowId),
    }));

    if (!token) return;

    // --- BACKGROUND SYNC ---
    try {
      await fetchApi(`/api/cart/${productIdOrRowId}`, {
        method: "DELETE",
      }, token);
    } catch (error) {
      console.error("Cart removeItem background sync error:", error);
      // Rollback on failure
      if (removedItem) {
        set((state) => ({ items: [...state.items, removedItem] }));
      }
    }
  },

  updateQuantity: async (productIdOrRowId, quantity, token) => {
    const qCount = Math.max(1, quantity);
    const { items } = get();
    const originalItem = items.find((item) => item.id === productIdOrRowId);

    // --- OPTIMISTIC UPDATE ---
    set((state) => ({
      items: state.items.map((item) =>
        item.id === productIdOrRowId ? { ...item, quantity: qCount } : item
      ),
    }));

    if (!token) return;

    // --- BACKGROUND SYNC ---
    try {
      await fetchApi(`/api/cart/${productIdOrRowId}`, {
        method: "PATCH",
        body: JSON.stringify({ quantity: qCount }),
      }, token);
    } catch (error) {
      console.error("Cart updateQuantity background sync error:", error);
      // Rollback on failure
      if (originalItem) {
        set((state) => ({
          items: state.items.map((item) =>
            item.id === productIdOrRowId ? originalItem : item
          ),
        }));
      }
    }
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

