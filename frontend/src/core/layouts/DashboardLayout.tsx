// src/core/layouts/DashboardLayout.tsx
import { Suspense, useState } from "react";
import { Outlet } from "react-router-dom";
import { useAuthStore } from "@/core/stores/authStore";
import { useUIStore } from "../stores/uiStore";
import Sidebar from "../components/dashboard/Sidebar";
import DashboardHeader from "../components/dashboard/DashboardHeader";
import type { NavItem } from "../types";

type DashboardLayoutProps = {
  navItems: NavItem[];
};

export default function DashboardLayout({ navItems }: DashboardLayoutProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const { breadcrumbs } = useUIStore();

  return (
    <div className="flex h-screen bg-gray-50 font-sans antialiased overflow-hidden">
      <Sidebar
        navItems={navItems}
        user={user}
        logout={logout}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      <div className="flex-1 flex flex-col min-w-0">
        <DashboardHeader
          breadcrumbs={breadcrumbs}
          user={user}
          onOpenMenu={() => setIsSidebarOpen(true)}
        />

        <main className="flex-1 overflow-y-auto p-4 lg:p-8">
          <div className="mx-auto">
            <Suspense
              fallback={
                <div className="flex items-center justify-center h-full min-h-[50vh]">
                  <span className="text-slate-400">Cargando módulo...</span>
                </div>
              }
            >
              <Outlet />
            </Suspense>
          </div>
        </main>
      </div>
    </div>
  );
}
