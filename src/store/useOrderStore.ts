import { create } from "zustand";
import { getSupabaseClient } from "@/lib/supabase";

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
  customer_name: string;
  customer_email: string;
  customer_phone?: string;
  address: string;
  city?: string;
  state?: string;
  pincode?: string;
  total: number;
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
  user_id?: string;
  customer_name: string;
  customer_email: string;
  customer_phone?: string;
  address: string;
  city?: string;
  state?: string;
  pincode?: string;
  total: number;
  notes?: string;
  items: Omit<OrderItem, "id">[];
}

// ─── Store Interface ────────────────────────────────────────────────────────────

interface OrderState {
  orders: GlobalOrder[];
  isLoading: boolean;
  // Admin: fetch all orders
  fetchOrders: () => Promise<void>;
  // User: fetch own orders by user_id
  fetchUserOrders: (userId: string) => Promise<GlobalOrder[]>;
  // Place a new order (from checkout)
  placeOrder: (payload: PlaceOrderPayload) => Promise<{ success: boolean; orderId?: string; error?: string }>;
  // Admin actions
  updateOrderStatus: (id: string, status: GlobalOrder["status"]) => Promise<void>;
  deleteOrder: (id: string) => Promise<void>;
  deleteAllOrders: () => Promise<void>;
}

// ─── Helpers ────────────────────────────────────────────────────────────────────

function mapRow(row: Record<string, unknown>, items?: OrderItem[]): GlobalOrder {
  const firstItem = items && items.length > 0 ? items[0] : null;
  const productSummary = firstItem 
    ? (items!.length > 1 ? `${firstItem.product_name} +${items!.length - 1}` : firstItem.product_name)
    : "No items";

  return {
    ...(row as unknown as GlobalOrder),
    items,
    customer: row.customer_name as string,
    amount: `₹${Number(row.total).toLocaleString("en-IN")}`,
    date: row.created_at as string,
    qty: items?.reduce((acc, i) => acc + i.quantity, 0) ?? 0,
    product: productSummary,
  };
}

// ─── Store ──────────────────────────────────────────────────────────────────────

export const useOrderStore = create<OrderState>((set, get) => ({
  orders: [],
  isLoading: false,

  // ── Fetch all orders (admin) ───────────────────────────────────────────────
  fetchOrders: async () => {
    set({ isLoading: true });
    const supabase = getSupabaseClient();
    const { data: ordersData, error } = await supabase
      .from("orders")
      .select("*, order_items(*)")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching orders:", error);
      set({ isLoading: false });
      return;
    }

    const orders = (ordersData ?? []).map((row: Record<string, unknown>) =>
      mapRow(row, row.order_items as OrderItem[])
    );
    set({ orders, isLoading: false });
  },

  // ── Fetch orders for a specific user ──────────────────────────────────────
  fetchUserOrders: async (userId) => {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from("orders")
      .select("*, order_items(*)")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching user orders:", error);
      return [];
    }

    return (data ?? []).map((row: Record<string, unknown>) =>
      mapRow(row, row.order_items as OrderItem[])
    );
  },

  // ── Place a new order ──────────────────────────────────────────────────────
  placeOrder: async (payload) => {
    const supabase = getSupabaseClient();
    const { items, ...orderFields } = payload;

    // 1. Insert order
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .insert([orderFields])
      .select()
      .single();

    if (orderError || !order) {
      console.error("Error placing order:", orderError);
      return { success: false, error: orderError?.message ?? "Failed to place order." };
    }

    // 2. Insert order items
    const orderItems = items.map((item) => ({
      order_id: order.id,
      product_id: item.product_id ?? null,
      product_name: item.product_name,
      product_image: item.product_image ?? null,
      price: item.price,
      quantity: item.quantity,
    }));

    const { error: itemsError } = await supabase
      .from("order_items")
      .insert(orderItems);

    if (itemsError) {
      console.error("Error inserting order items:", itemsError);
      // Order was created — don't fail completely
    }

    // 3. Refresh local store
    await get().fetchOrders();

    return { success: true, orderId: order.id };
  },

  // ── Update order status ────────────────────────────────────────────────────
  updateOrderStatus: async (id, status) => {
    const supabase = getSupabaseClient();
    const { error } = await supabase
      .from("orders")
      .update({ status })
      .eq("id", id);

    if (error) {
      console.error("Error updating order status:", error);
      return;
    }
    set((state) => ({
      orders: state.orders.map((o) =>
        o.id === id ? { ...o, status } : o
      ),
    }));
  },

  // ── Delete a single order ──────────────────────────────────────────────────
  deleteOrder: async (id) => {
    const supabase = getSupabaseClient();
    const { error } = await supabase.from("orders").delete().eq("id", id);
    if (error) {
      console.error("Error deleting order:", error);
      return;
    }
    set((state) => ({
      orders: state.orders.filter((o) => o.id !== id),
    }));
  },

  // ── Delete all orders (admin nuclear option) ───────────────────────────────
  deleteAllOrders: async () => {
    const supabase = getSupabaseClient();
    const { error } = await supabase.from("orders").delete().neq("id", "00000000-0000-0000-0000-000000000000");
    if (error) {
      console.error("Error deleting all orders:", error);
      return;
    }
    set({ orders: [] });
  },
}));
