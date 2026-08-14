import { create } from "zustand";
import { fetchApi } from "@/lib/api";

// ─── Types ─────────────────────────────────────────────────────────────────────

export interface OrderItem {
  id: string;
  product_id?: string;
  product_name: string;
  product_image?: string;
  price: number;
  quantity: number;
}

export interface GlobalOrder {
  id: string;
  user_id?: string;
  clerk_user_id?: string;
  customer_name: string;
  customer_email: string;
  customer_phone?: string;
  address: string;
  city?: string;
  state?: string;
  pincode?: string;
  total: number;
  payment_method?: string;
  razorpay_payment_id?: string;
  razorpay_order_id?: string;
  status: "pending" | "processing" | "shipped" | "delivered" | "cancelled";
  notes?: string;
  created_at: string;
  items?: OrderItem[];
  // Convenience aliases for admin dashboard display
  customer?: string;   // alias for customer_name
  amount?: string;     // alias for formatted total
  date?: string;       // alias for created_at
  qty?: number;        // total item count
  product?: string;    // first product name or summary
}

export interface PlaceOrderPayload {
  user_id?: string; // Legacy
  clerk_user_id?: string;
  customer_name: string;
  customer_email: string;
  customer_phone?: string;
  address: string;
  city?: string;
  state?: string;
  pincode?: string;
  total: number;
  notes?: string;
  payment_method?: string;
  razorpay_payment_id?: string;
  razorpay_order_id?: string;
  razorpay_signature?: string;
  items: Omit<OrderItem, "id">[];
}

// ─── Store Interface ────────────────────────────────────────────────────────────

interface OrderState {
  orders: GlobalOrder[];
  isLoading: boolean;
  // Admin: fetch all orders
  fetchOrders: (token: string) => Promise<void>;
  // User: fetch own orders
  fetchUserOrders: (token: string) => Promise<GlobalOrder[]>;
  // Place a new order (from checkout)
  placeOrder: (payload: PlaceOrderPayload, token?: string | null) => Promise<{ success: boolean; orderId?: string; error?: string }>;
  // Admin actions
  updateOrderStatus: (id: string, status: GlobalOrder["status"], token: string) => Promise<void>;
  deleteOrder: (id: string, token: string) => Promise<void>;
  deleteAllOrders: (token: string) => Promise<void>;
}

// ─── Helpers ────────────────────────────────────────────────────────────────────

function mapRow(row: any): GlobalOrder {
  const items = row.items || [];
  const firstItem = items && items.length > 0 ? items[0] : null;
  const productSummary = firstItem 
    ? (items.length > 1 ? `${firstItem.product_name} +${items.length - 1}` : firstItem.product_name)
    : "No items";

  return {
    ...row,
    customer: row.customer_name,
    amount: `₹${Number(row.total).toLocaleString("en-IN")}`,
    date: row.created_at,
    qty: items.reduce((acc: number, i: any) => acc + (i.quantity || 0), 0),
    product: productSummary,
  };
}

// ─── Store ──────────────────────────────────────────────────────────────────────

export const useOrderStore = create<OrderState>((set, get) => ({
  orders: [],
  isLoading: false,

  // ── Fetch all orders (admin) ───────────────────────────────────────────────
  fetchOrders: async (token) => {
    set({ isLoading: true });
    try {
      const { orders: data } = await fetchApi("/api/admin/orders", {}, token);
      const orders = (data || []).map(mapRow);
      set({ orders, isLoading: false });
    } catch (error) {
      console.error("Error fetching orders:", error);
      set({ isLoading: false });
    }
  },

  // ── Fetch orders for a specific user ──────────────────────────────────────
  fetchUserOrders: async (token: string) => {
    try {
      const resp = await fetch("/api/orders", {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!resp.ok) throw new Error("Failed to fetch orders");
      const data = await resp.json();
      return (data || []).map(mapRow);
    } catch (e) {
      console.error(e);
      return [];
    }
  },

  // ── Place a new order ──────────────────────────────────────────────────────
  placeOrder: async (payload, token) => {
    try {
      const result = await fetchApi("/api/orders", {
        method: "POST",
        body: JSON.stringify(payload),
      }, token);
      
      // If admin was looking at orders, refresh list
      if (token) {
        await get().fetchOrders(token);
      }
      
      return result;
    } catch (error: any) {
      console.error("Error placing order:", error);
      return { success: false, error: error.message || "Failed to place order." };
    }
  },

  // ── Update order status ────────────────────────────────────────────────────
  updateOrderStatus: async (id, status, token) => {
    try {
      await fetchApi(`/api/admin/orders/${id}`, {
        method: "PATCH",
        body: JSON.stringify({ status }),
      }, token);
      
      set((state) => ({
        orders: state.orders.map((o) =>
          o.id === id ? { ...o, status } : o
        ),
      }));
    } catch (error) {
      console.error("Error updating order status:", error);
    }
  },

  // ── Delete a single order ──────────────────────────────────────────────────
  deleteOrder: async (id, token) => {
    try {
      await fetchApi(`/api/admin/orders/${id}`, {
        method: "DELETE",
      }, token);
      
      set((state) => ({
        orders: state.orders.filter((o) => o.id !== id),
      }));
    } catch (error) {
      console.error("Error deleting order:", error);
    }
  },

  deleteAllOrders: async (token) => {
    try {
      await fetchApi("/api/admin/orders", { method: "DELETE" }, token);
      set({ orders: [] });
    } catch (error) {
      console.error("Error deleting all orders:", error);
    }
  },
}));

