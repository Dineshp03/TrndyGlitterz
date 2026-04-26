"use client";

import { useEffect } from "react";
import { useAuth } from "@clerk/nextjs";
import { useCartStore } from "@/store/useCartStore";

export default function CartInitializer() {
  const { getToken, isLoaded, isSignedIn } = useAuth();
  const { fetchCart } = useCartStore();

  useEffect(() => {
    async function initCart() {
      if (isLoaded && isSignedIn) {
        const token = await getToken();
        if (token) {
          fetchCart(token);
        }
      }
    }
    initCart();
  }, [isLoaded, isSignedIn, getToken, fetchCart]);

  return null;
}
