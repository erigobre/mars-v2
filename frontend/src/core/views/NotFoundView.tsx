import { useNavigate } from "react-router-dom";
import { MdErrorOutline, MdHome } from "react-icons/md";
import { Button } from "@/core/components/ui";
import { FadeUpContainer, FadeUpItem } from "@/core/components/common/FadeUp";
import { useAuthStore } from "@/core/stores/authStore";

export default function NotFoundView() {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);

  const getHomePath = () => {
    if (!user) return "/";
    switch (user.role) {
      case "admin":
        return "/admin/home";
      case "distributor":
        return "/distributor/home";
      case "logistics":
        return "/logistics/analytics/economy";
      case "seller":
      default:
        return "/home";
    }
  };

  return (
    <div className="font-sans antialiased relative overflow-hidden flex flex-col justify-center w-full">
      <FadeUpContainer className="relative z-10 max-w-2xl mx-auto px-4 py-16 text-center space-y-8">
        <FadeUpItem className="flex justify-center">
          <div className="w-28 h-28 md:w-32 md:h-32 bg-slate-900/5 backdrop-blur-md rounded-full flex items-center justify-center border-4 border-slate-900/10 shadow-xl">
            <MdErrorOutline className="text-6xl md:text-7xl text-slate-700 opacity-90" />
          </div>
        </FadeUpItem>

        <FadeUpItem className="space-y-4">
          <h1 className="text-7xl md:text-9xl text-slate-900 font-black drop-shadow-lg">
            404
          </h1>
          <h2 className="text-2xl md:text-3xl font-bold text-slate-800 tracking-tight">
            ¡Página no encontrada!
          </h2>
          <p className="text-slate-600 text-base md:text-lg max-w-md mx-auto leading-relaxed">
            Lo sentimos, la sección que buscas no existe, no tienes permisos
            para verla o ha sido movida.
          </p>
        </FadeUpItem>

        <FadeUpItem className="pt-6 flex justify-center">
          <Button
            variant="primary"
            size="lg"
            onClick={() => navigate(getHomePath(), { replace: true })}
            className="py-4 px-8 shadow-xl text-lg uppercase font-bold tracking-wider flex items-center gap-2"
          >
            <MdHome className="text-2xl" />
            Volver al Inicio
          </Button>
        </FadeUpItem>
      </FadeUpContainer>
    </div>
  );
}
