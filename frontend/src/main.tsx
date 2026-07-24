import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import { RouterProvider } from "react-router-dom";
import router from "./router.tsx";
import { ToastContainer } from "react-toastify";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { TooltipProvider } from "@radix-ui/react-tooltip";
import { useThemeStore } from "@/core/stores/themeStore";

export const queryClient = new QueryClient();

// Cargar tema en background (no bloquea render)
useThemeStore.getState().fetchTheme();

const rootElement = document.getElementById("root")!;

if (!(window as any)._reactRoot) {
  (window as any)._reactRoot = createRoot(rootElement);
}

(window as any)._reactRoot.render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <RouterProvider router={router} />
        <ToastContainer />
      </TooltipProvider>
    </QueryClientProvider>
  </StrictMode>
);
