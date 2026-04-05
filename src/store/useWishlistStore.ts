import { create } from "zustand";
import { persist } from "zustand/middleware";
import { getSupabaseClient } from "@/lib/supabase";

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

      // Load wishlist from Supabase for logged-in users
      loadWishlist: async (userId: string) => {
        const supabase = getSupabaseClient();
        const { data, error } = await supabase
          .from("wishlist")
          .select("product_id")
          .eq("user_id", userId);
        if (error) {
          console.error("Error loading wishlist:", error);
          return;
        }
        set({ items: (data ?? []).map((row: { product_id: string }) => row.product_id) });
      },

      // Toggle wishlist — syncs with Supabase if userId provided
      toggleWishlist: async (productId: string, userId?: string) => {
        const exists = get().items.includes(productId);

        // Always update local state immediately for snappy UI
        set((state) => ({
          items: exists
            ? state.items.filter((id) => id !== productId)
            : [...state.items, productId],
        }));

        if (!userId) return; // Guest: local-only

        const supabase = getSupabaseClient();
        if (exists) {
          await supabase
            .from("wishlist")
            .delete()
            .eq("user_id", userId)
            .eq("product_id", productId);
        } else {
          await supabase
            .from("wishlist")
            .insert([{ user_id: userId, product_id: productId }]);
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
