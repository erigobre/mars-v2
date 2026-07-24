import { Button } from "@/core/components/ui";
import { MdErrorOutline } from "react-icons/md";

export default function HomeError({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="max-w-6xl mx-auto px-4 md:px-6 py-16 flex flex-col items-center gap-4 text-center">
      <MdErrorOutline className="text-5xl text-red-400" />
      <h2 className="text-xl font-bold text-white">
        No se pudo cargar el dashboard
      </h2>
      <p className="text-gray-300 text-sm max-w-xs">
        Hubo un problema al obtener tu información. Verifica tu conexión e
        intenta de nuevo.
      </p>
      <Button variant="secondary" onClick={onRetry}>
        Reintentar
      </Button>
    </div>
  );
}
