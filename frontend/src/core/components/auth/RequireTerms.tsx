import { useAuthStore } from "@/core/stores/authStore";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { FullScreenLoader } from "../common/FullScreenLoader";

export default function RequireTerms() {
  const user = useAuthStore((s) => s.user);
  const token = useAuthStore((s) => s.token);
  const location = useLocation();

  if (!token) {
    return <Navigate to="/" replace state={{ from: location }} />;
  }

  if (!user) {
    return (
      <FullScreenLoader
        title="Cargando..."
        subtitle="Preparando el sistema..."
      />
    );
  }

  if (user?.role === "seller" && user.termsAccepted === false) {
    return (
      <Navigate
        to="/accept-terms"
        state={{ from: location }}
        replace
      />
    );
  }

  return <Outlet />;
}
