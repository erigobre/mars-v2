// components/auth/ProtectedRoute.tsx
import { useAuthStore } from "@/core/stores/authStore";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { FullScreenLoader } from "../common/FullScreenLoader";

export default function ProtectedRoute({ allowed }: { allowed: string[] }) {
  const { user, token } = useAuthStore();
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

  if (!allowed.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}
