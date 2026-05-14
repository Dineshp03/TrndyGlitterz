import { create } from "zustand";
import { persist } from "zustand/middleware";

interface WishlistState {
  items: string[]; // List of product IDs
  toggleWishlist: (productId: string, userId?: string) => Promise<void>;
  loadWishlist: (userId: string) => Promise<void>;
  isInWishlist: (productId: string) => boolean;
}

export const useWishlistStore = create<WishlistState>()(
  persist(
    (set, get) => ({
      items: [],

      // Load wishlist from API for logged-in users
      loadWishlist: async (userId: string) => {
        try {
          const response = await fetch(`/api/wishlist?userId=${userId}`);
          const result = await response.json();
          if (!response.ok) throw new Error(result.error || "Failed to load wishlist");
          set({ items: result.items || [] });
        } catch (error) {
          console.error("Error loading wishlist:", error);
        }
      },

      // Toggle wishlist — syncs with Supabase via API if userId provided
      toggleWishlist: async (productId: string, userId?: string) => {
        const exists = get().items.includes(productId);

        // Always update local state immediately for snappy UI
        set((state) => ({
          items: exists
            ? state.items.filter((id) => id !== productId)
            : [...state.items, productId],
        }));

        if (!userId) return; // Guest: local-only

        try {
          const response = await fetch("/api/wishlist", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              userId,
              productId,
              action: exists ? "remove" : "add",
            }),
          });
          const result = await response.json();
          if (!response.ok) throw new Error(result.error || "Failed to sync wishlist");
        } catch (error) {
          console.error("Wishlist sync error:", error);
          // Rollback local state on failure
          set((state) => ({
            items: exists
              ? [...state.items, productId]
              : state.items.filter((id) => id !== productId),
          }));
        }
      },

      isInWishlist: (productId: string) => {
        return get().items.includes(productId);
      },
    }),
    {
      name: "trendy-wishlist",
    }
  )
);
