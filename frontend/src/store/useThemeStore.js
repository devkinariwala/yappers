import { create } from "zustand";

export const useThemeStore = create((set) => ({
  theme: localStorage.getItem("yappers-theme") || "forest",
  setTheme: (theme) => {
    localStorage.setItem("yappers-theme", theme), set({ theme });
  },
}));
