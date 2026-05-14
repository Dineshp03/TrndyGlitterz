"use client";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { fetchApi } from "@/lib/api";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface OrderItem {
  id: string;
  name: string;
  image?: string;
  price: number;
  quantity: number;
  productId: string;
}

export interface Order {
  id: string;
  date: string;
  items: OrderItem[];
  total: number;
  status: string;
  address: string;
  city?: string;
  state?: string;
  pincode?: string;
}

export interface User {
  id: string; // Internal DB ID
  clerkUserId: string; // Clerk user_id
  fullName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  avatar?: string;
  orders: Order[];
  joinedAt: string;
  role: "user" | "admin";
}

// ─── Store Interface ──────────────────────────────────────────────────────────

interface UserState {
  user: User | null;
  isLoggedIn: boolean;
  isAdmin: boolean;
  isLoading: boolean;
  
  // Account & Sync
  syncUserWithClerk: (clerkUser: { id: string; emailAddresses: { emailAddress: string }[]; fullName: string | null; imageUrl: string }, token: string) => Promise<void>;
  logout: () => void;
  
  // Profile
  updateProfile: (data: Partial<Omit<User, "id" | "orders" | "joinedAt" | "clerkUserId">>, token: string) => Promise<{ success: boolean; error?: string }>;
  
  // Orders
  fetchOrders: (token: string) => Promise<void>;
  addOrder: (orderData: Partial<Order>, token: string) => Promise<{ success: boolean; orderId?: string; error?: string }>;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function mapDbProfileToUser(profile: {
  id: string;
  clerk_user_id: string;
  full_name?: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  pincode?: string;
  avatar_url?: string;
  created_at?: string;
  role?: "user" | "admin";
}, orders: Order[] = []): User {
  return {
    id: profile.id,
    clerkUserId: profile.clerk_user_id,
    fullName: profile.full_name || "",
    email: profile.email || "",
    phone: profile.phone || "",
    address: profile.address || "",
    city: profile.city || "",
    state: profile.state || "",
    pincode: profile.pincode || "",
    avatar: profile.avatar_url || undefined,
    orders,
    joinedAt: profile.created_at || new Date().toISOString(),
    role: profile.role || "user",
  };
}

function mapDbOrderToOrder(dbOrder: {
  id: string;
  created_at: string;
  total: number;
  status: string;
  address: string;
  city?: string;
  state?: string;
  pincode?: string;
  order_items?: {
    id: string;
    product_id: string;
    product_name: string;
    product_image?: string;
    price: number;
    quantity: number;
  }[];
}): Order {
  return {
    id: dbOrder.id,
    date: dbOrder.created_at,
    total: dbOrder.total,
    status: dbOrder.status,
    address: dbOrder.address,
    city: dbOrder.city,
    state: dbOrder.state,
    pincode: dbOrder.pincode,
    items: (dbOrder.order_items || []).map((item) => ({
      id: item.id,
      productId: item.product_id,
      name: item.product_name,
      image: item.product_image,
      price: item.price,
      quantity: item.quantity,
    })),
  };
}

// ─── Store ────────────────────────────────────────────────────────────────────

export const useUserStore = create<UserState>()(
  persist(
    (set, get) => ({
      user: null,
      isLoggedIn: false,
      isAdmin: false,
      isLoading: false,

      syncUserWithClerk: async (clerkUser, token) => {
        if (!clerkUser) return;
        set({ isLoading: true });
        try {
          const { user: profile } = await fetchApi("/api/users", {
            method: "POST",
            body: JSON.stringify({
              clerkUserId: clerkUser.id,
              email: clerkUser.emailAddresses[0]?.emailAddress,
              fullName: clerkUser.fullName,
              avatarUrl: clerkUser.imageUrl,
            }),
          }, token);

          const isAdmin = profile.role === "admin";
          set({
            user: mapDbProfileToUser(profile),
            isLoggedIn: true,
            isAdmin,
            isLoading: false,
          });

          // Fetch orders immediately after syncing user
          get().fetchOrders(token);
        } catch (error) {
          console.error("syncUserWithClerk error:", error);
          set({ isLoading: false });
        }
      },

      logout: () => {
        set({ user: null, isLoggedIn: false, isAdmin: false });
      },

      updateProfile: async (data, token) => {
        const { user } = get();
        if (!user) return { success: false, error: "Not logged in" };

        set({ isLoading: true });
        try {
          const { user: updatedProfile } = await fetchApi(`/api/users/${user.clerkUserId}`, {
            method: "PATCH",
            body: JSON.stringify(data),
          }, token);

          set({
            user: mapDbProfileToUser(updatedProfile, user.orders),
            isLoading: false,
          });
          return { success: true };
        } catch (error: any) {
          console.error("updateProfile error:", error);
          set({ isLoading: false });
          return { success: false, error: error.message };
        }
      },

      fetchOrders: async (token) => {
        const { user } = get();
        if (!user) return;

        try {
          const { orders } = await fetchApi(`/api/orders/${user.clerkUserId}`, {}, token);
          const mappedOrders = orders.map(mapDbOrderToOrder);
          set((state) => ({
            user: state.user ? { ...state.user, orders: mappedOrders } : null,
          }));
        } catch (error) {
          console.error("fetchOrders error:", error);
        }
      },

      addOrder: async (orderData, token) => {
        set({ isLoading: true });
        try {
          const { order } = await fetchApi("/api/orders", {
            method: "POST",
            body: JSON.stringify(orderData),
          }, token);

          // Refresh orders after placing one
          await get().fetchOrders(token);
          
          set({ isLoading: false });
          return { success: true, orderId: order.id };
        } catch (error: any) {
          console.error("addOrder error:", error);
          set({ isLoading: false });
          return { success: false, error: error.message };
        }
      },
    }),
    {
      name: "trendy-user-session",
      partialize: (state) => ({
        user: state.user,
        isLoggedIn: state.isLoggedIn,
        isAdmin: state.isAdmin,
      }),
    }
  )
);
