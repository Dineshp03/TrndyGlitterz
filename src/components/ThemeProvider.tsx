"use client";

import { useEffect } from "react";
import { useThemeStore } from "@/store/useThemeStore";

/**
 * ThemeProvider — syncs the global zustand theme state
 * to CSS custom properties on document.documentElement.
 * Renders nothing visible.
 */
export default function ThemeProvider() {
  const isDarkMode = useThemeStore((s) => s.isDarkMode);

  useEffect(() => {
    const root = document.documentElement;

    if (isDarkMode) {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
  }, [isDarkMode]);

  return null;
}
