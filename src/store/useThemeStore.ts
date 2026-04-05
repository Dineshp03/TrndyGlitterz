import { create } from "zustand";
import { persist } from "zustand/middleware";

interface ThemeStore {
  isDarkMode: boolean;
  toggleTheme: () => void;
  setDarkMode: (dark: boolean) => void;
}

export const useThemeStore = create<ThemeStore>()(
  persist(
    (set) => ({
      isDarkMode: false,
      toggleTheme: () => set((s) => ({ isDarkMode: !s.isDarkMode })),
      setDarkMode: (dark) => set({ isDarkMode: dark }),
    }),
    { name: "trendy-glitterz-theme" }
  )
);
