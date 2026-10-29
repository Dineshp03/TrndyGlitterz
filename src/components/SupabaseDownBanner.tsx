"use client";

import { useProductStore } from "@/store/useProductStore";

/**
 * Shows a slim banner when Supabase quota is exhausted.
 * Products still display from the local fallback/cache.
 */
export function SupabaseDownBanner() {
  const supabaseDown = useProductStore((s) => s.supabaseDown);

  if (!supabaseDown) return null;

  return (
    <div className="w-full bg-amber-500/90 text-black text-center text-xs sm:text-sm px-4 py-2 font-medium z-50">
      ⚠️ Live product data is temporarily unavailable (server quota reached). Showing cached products — prices &amp; stock may not reflect latest updates.
    </div>
  );
}

