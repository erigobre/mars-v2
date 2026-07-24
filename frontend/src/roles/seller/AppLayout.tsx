import { AppHeader } from "@/feature/sellers/components/common/AppHeader";
import { useAuthStore } from "@/core/stores/authStore";
import {
  MdCardGiftcard,
  MdHome,
  MdLeaderboard,
  MdPerson,
} from "react-icons/md";
import { Outlet, useLocation, useMatches } from "react-router-dom";
import DesktopNavbar from "@/feature/sellers/components/common/DesktopNavbar";
import MobileBottomNavbar from "@/feature/sellers/components/common/MobileBottomNavbar";
import { useSellerDashboardQuery } from "@/feature/sellers/services/sellerServices";
import { useState, useMemo } from "react";
import { PendingClaimsModal } from "@/feature/sellers/components/home/PendingClaimsModal";
import BottomDecoration from "@/core/components/common/BottomDecoration";

const APP_ROUTES = [
  {
    to: "/home",
    label: "Inicio",
    icon: MdHome,
    showInMobile: true,
    header: { mode: "home" as const },
  },
  {
    to: "/rewards",
    label: "Premios",
    icon: MdCardGiftcard,
    showInMobile: true,
    header: {
      mode: "page" as const,
      title: "Premios",
      subtitle: "Canjea tus puntos por recompensas",
    },
  },
  {
    to: "/ranking",
    label: "Ranking",
    icon: MdLeaderboard,
    showInMobile: true,
    header: {
      mode: "page" as const,
      title: "Ranking",
      subtitle: "Top vendedores del periodo",
    },
  },
  {
    to: "/profile",
    label: "Mi Perfil",
    icon: MdPerson,
    showInMobile: false,
    header: {
      mode: "page" as const,
      title: "Mi Perfil",
      subtitle: "Gestiona tu información personal",
    },
  },
];

const EXTRA_HEADERS: Record<string, any> = {
  "/terms": { mode: "page", title: "Términos y Condiciones", subtitle: "" },
  "/privacy": { mode: "page", title: "Aviso de Privacidad", subtitle: "" },
  "/404": { mode: "page", title: "Página no encontrada", subtitle: "" },
};

export default function AppLayout() {
  const logout = useAuthStore((s) => s.logout);
  const location = useLocation();
  const matches = useMatches();
  const [isPendingModalOpen, setIsPendingModalOpen] = useState(false);

  const { data: dashboard } = useSellerDashboardQuery();

  const desktopNav = APP_ROUTES;
  const mobileNav = APP_ROUTES.filter((route) => route.showInMobile);

  const handleLogout = () => logout();

  const currentRoute = APP_ROUTES.find(
    (route) => route.to === location.pathname
  );
  const headerConfig = currentRoute?.header ??
    EXTRA_HEADERS[location.pathname] ?? { mode: "home" };

  const isClaimFlow = location.pathname.includes("/claim/");
  const hideHeader =
    isClaimFlow || matches.some((match) => (match.handle as any)?.hideHeader);
  const hideNav =
    isClaimFlow || matches.some((match) => (match.handle as any)?.hideNav);
  const pendingCount = dashboard?.storeStatus.pendingReservationsCount || 0;

  const currentBackgroundColor = useMemo(() => {
    if (location.pathname.includes("/home")) return "var(--theme-primary)";
    if (location.pathname.includes("/rewards")) return "var(--theme-secondary)";
    if (location.pathname.includes("/ranking")) return "var(--theme-accent)";
    return "var(--theme-primary)";
  }, [location.pathname]);

  return (
    <div
      className="h-dvh w-full relative overflow-hidden font-sans antialiased transition-colors duration-500"
      style={{ backgroundColor: currentBackgroundColor }}
    >
      <BottomDecoration className="bottom-15 md:-bottom-14" />

      <div className="absolute inset-0 overflow-y-auto flex flex-col z-10">
        {pendingCount > 0 && !isClaimFlow && (
          <div className="bg-orange-500 text-white px-4 py-2.5 text-center shadow-lg z-30 relative md:mt-20 md:-mb-20 animate-in slide-in-from-top duration-300">
            <p className="text-xs md:text-sm font-black leading-tight">
              Tienes {pendingCount}{" "}
              {pendingCount === 1 ? "canje pendiente" : "canjes pendientes"} de
              confirmar.
              <button
                onClick={() => setIsPendingModalOpen(true)}
                className="underline ml-2 hover:text-white/80 transition-colors"
              >
                [Ver y Confirmar]
              </button>
            </p>
          </div>
        )}

        {!hideNav && (
          <DesktopNavbar
            navItems={desktopNav}
            onLogout={handleLogout}
            currentBackgroundColor={currentBackgroundColor}
          />
        )}

        {!hideHeader && <AppHeader {...headerConfig} />}

        <main
          className={`w-full max-w-7xl mx-auto pb-32 px-4 md:px-6 md:py-8 grow`}
        >
          <Outlet />
        </main>

        {!hideNav && (
          <MobileBottomNavbar
            navItems={mobileNav}
            currentBackgroundColor={currentBackgroundColor}
          />
        )}

        <PendingClaimsModal
          open={isPendingModalOpen}
          onClose={() => setIsPendingModalOpen(false)}
          claims={dashboard?.storeStatus.pendingReservations || []}
        />
      </div>
    </div>
  );
}
