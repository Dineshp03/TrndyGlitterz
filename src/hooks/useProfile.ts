"use client";
import { useAuth } from "@clerk/nextjs";
import { useUserStore } from "@/store/useUserStore";

/**
 * Custom hook for interacting with the user profile and orders.
 * Automatically handles Clerk tokens.
 */
export function useProfile() {
  const { getToken } = useAuth();
  const store = useUserStore();

  const updateProfile = async (data: any) => {
    const token = await getToken();
    if (!token) return { success: false, error: "No token found" };
    return store.updateProfile(data, token);
  };

  const addOrder = async (orderData: any) => {
    const token = await getToken();
    if (!token) return { success: false, error: "No token found" };
    return store.addOrder(orderData, token);
  };

  const fetchOrders = async () => {
    const token = await getToken();
    if (!token) return;
    return store.fetchOrders(token);
  };

  return {
    ...store,
    updateProfile,
    addOrder,
    fetchOrders,
  };
}
