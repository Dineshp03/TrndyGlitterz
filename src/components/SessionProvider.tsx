"use client";
import { useEffect } from "react";
import { useUser, useAuth } from "@clerk/nextjs";
import { useUserStore } from "@/store/useUserStore";
import { useCartStore } from "@/store/useCartStore";

/**
 * Syncs the Clerk session with our Zustand store and Supabase backend.
 */
export default function SessionProvider({ children }: { children: React.ReactNode }) {
  const { user: clerkUser, isLoaded: isUserLoaded } = useUser();
  const { getToken, isLoaded: isAuthLoaded } = useAuth();
  
  const syncUserWithClerk = useUserStore((s) => s.syncUserWithClerk);
  const logout = useUserStore((s) => s.logout);
  const fetchCart = useCartStore((s) => s.fetchCart);

  useEffect(() => {
    async function sync() {
      if (isUserLoaded && isAuthLoaded) {
        if (clerkUser) {
          const token = await getToken();
          if (token) {
            await syncUserWithClerk(clerkUser, token);
            await fetchCart(token);
          }
        } else {
          // User signed out
          logout();
        }
      }
    }
    sync();
  }, [clerkUser, isUserLoaded, isAuthLoaded, getToken, syncUserWithClerk, logout, fetchCart]);

  return <>{children}</>;
}

