import { create } from "zustand";
import api from "@/core/api/axios";

type ThemeMap = Record<string, string>;

type ThemeState = {
  theme: ThemeMap;
  loaded: boolean;
};

type ThemeActions = {
  fetchTheme: () => Promise<void>;
  applyToCss: (theme: ThemeMap) => void;
  update: (partial: ThemeMap) => void;
};

const CSS_MAP: Record<string, string> = {
  primary_color: "--theme-admin-primary",
  secondary_color: "--theme-admin-secondary",
  accent_color: "--theme-admin-accent",
  seller_card_bg: "--theme-seller-card-bg",
  button_radius: "--theme-button-radius",
};

export const useThemeStore = create<ThemeState & ThemeActions>()((set, get) => ({
  theme: {},
  loaded: false,

  applyToCss: (theme: ThemeMap) => {
    const root = document.documentElement;
    for (const [key, cssVar] of Object.entries(CSS_MAP)) {
      if (theme[key]) root.style.setProperty(cssVar, theme[key]);
    }
    if (theme.app_name) document.title = theme.app_name;
  },

  fetchTheme: async () => {
    try {
      const { data } = await api.get<{ data: ThemeMap }>("/public/theme");
      const theme = data.data ?? {};
      set({ theme, loaded: true });
      get().applyToCss(theme);
    } catch {
      set({ loaded: true });
    }
  },

  update: (partial: ThemeMap) => {
    const merged = { ...get().theme, ...partial };
    set({ theme: merged });
    get().applyToCss(merged);
  },
}));
