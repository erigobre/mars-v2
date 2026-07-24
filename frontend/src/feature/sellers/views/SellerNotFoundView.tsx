import { useNavigate } from "react-router-dom";
import { MdErrorOutline, MdHome } from "react-icons/md";
import { Button } from "@/core/components/ui";
import { FadeUpContainer, FadeUpItem } from "@/core/components/common/FadeUp";

export default function SellerNotFoundView() {
  const navigate = useNavigate();

  return (
    <div className="font-sans antialiased relative overflow-hidden flex flex-col justify-center h-full">
      <FadeUpContainer className="relative z-10 max-w-2xl mx-auto px-4 py-16 text-center space-y-8">
        <FadeUpItem className="flex justify-center">
          <div className="w-28 h-28 md:w-32 md:h-32 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center border-4 border-white/20 shadow-xl">
            <MdErrorOutline className="text-6xl md:text-7xl text-white opacity-90" />
          </div>
        </FadeUpItem>

        <FadeUpItem className="space-y-4">
          <h1 className="text-7xl md:text-9xl text-white font-black drop-shadow-lg">
            404
          </h1>
          <h2 className="text-2xl md:text-3xl font-bold text-white tracking-tight">
            ¡Página no encontrada!
          </h2>
          <p className="text-white/80 text-base md:text-lg max-w-md mx-auto leading-relaxed">
            Lo sentimos, la página que buscas no existe o ha sido movida.
            Regresa al inicio para seguir acumulando puntos y descubrir tus
            premios.
          </p>
        </FadeUpItem>

        <FadeUpItem className="pt-6 flex justify-center">
          <Button
            variant="secondary"
            size="lg"
            onClick={() => navigate("/home")}
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
