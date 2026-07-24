import type { SessionUser } from "@/core/schemas/session";
import { logoutUser } from "@/feature/auth/api/AuthAPI";
import { queryClient } from "@/main";
import { toast } from "react-toastify";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { useUploadStore } from "./uploadStore";

type AuthState = {
  user: SessionUser | null;
  token: string | null;
  isAuthenticated: boolean;
};

type AuthActions = {
  setToken: (token: string) => void;
  setUser: (user: SessionUser) => void;
  updateUser: (data: Partial<SessionUser>) => void;
  logout: () => Promise<void>;
  clearSession: () => void;
};

export const useAuthStore = create<AuthState & AuthActions>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,

      setToken: (token) => set({ token, isAuthenticated: !!token }),
      setUser: (user) => set({ user, isAuthenticated: !!user }),
      updateUser: (data) =>
        set((state) => ({
          user: state.user ? { ...state.user, ...data } : null,
        })),
      clearSession: () => {
        set({ user: null, token: null, isAuthenticated: false });
        useUploadStore.getState().clearActiveUpload();
        setTimeout(() => queryClient.clear(), 0);
      },
      logout: async () => {
        try {
          await logoutUser();
        } catch (error) {
          console.error("Error during logout API call:", error);
        } finally {
          get().clearSession();
          toast.success("Cerrando sesión...");
        }
      },
    }),
    { name: "auth-storage" }
  )
);
