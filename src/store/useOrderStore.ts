import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface GlobalOrder {
  id: string;
  customer: string;
  product: string;
  amount: string;
  status: string; // "delivered" | "processing" | "pending" | "cancelled"
  date: string;
  qty: number;
}

interface OrderState {
  orders: GlobalOrder[];
  addOrder: (order: GlobalOrder) => void;
  updateOrderStatus: (id: string, status: string) => void;
  deleteOrder: (id: string) => void;
  deleteAllOrders: () => void;
}

export const useOrderStore = create<OrderState>()(
  persist(
    (set) => ({
      orders: [],
      addOrder: (order) => set((state) => ({ orders: [order, ...state.orders] })),
      updateOrderStatus: (id, status) => set((state) => ({
        orders: state.orders.map(o => o.id === id ? { ...o, status } : o)
      })),
      deleteOrder: (id) => set((state) => ({
        orders: state.orders.filter(o => o.id !== id)
      })),
      deleteAllOrders: () => set({ orders: [] }),
    }),
    {
      name: "trendy-orders",
    }
  )
);
