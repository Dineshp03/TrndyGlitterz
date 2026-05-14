"use client";
import { useAuth } from "@clerk/nextjs";
import { useCartStore, Product } from "@/store/useCartStore";

/**
 * Custom hook to interact with the cart store.
 * Automatically injects the Clerk authentication token into requests.
 */
export function useCart() {
  const { getToken } = useAuth();
  const store = useCartStore();

  const addItem = async (product: Product) => {
    const token = await getToken();
    return store.addItem(product, token);
  };

  const removeItem = async (productIdOrRowId: string) => {
    const token = await getToken();
    return store.removeItem(productIdOrRowId, token);
  };

  const updateQuantity = async (productIdOrRowId: string, quantity: number) => {
    const token = await getToken();
    return store.updateQuantity(productIdOrRowId, quantity, token);
  };

  return {
    ...store,
    addItem,
    removeItem,
    updateQuantity,
  };
}
