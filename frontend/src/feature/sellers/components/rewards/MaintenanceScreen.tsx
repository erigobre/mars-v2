import { Button } from "@/core/components/ui";
import { MdRedeem, MdStorefront } from "react-icons/md";

export default function MaintenanceScreen({
  onGoHome,
}: {
  onGoHome: () => void;
}) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center text-center gap-6 py-16 px-4">
      <div className="w-40 h-40 bg-gray-200 rounded-full flex items-center justify-center relative shadow-lg">
        <MdStorefront className="text-7xl text-gray-400" />
        <div className="absolute -bottom-4 bg-red-500 text-white px-4 py-1.5 rounded-lg shadow-md -rotate-6 border-2 border-white">
          <span className="font-bold tracking-wider text-sm">CERRADO</span>
        </div>
      </div>

      <div className="space-y-3 mt-4">
        <h2 className="text-3xl font-extrabold text-gray-900 leading-tight">
          Tienda en mantenimiento
        </h2>
        <p className="text-gray-500 text-base max-w-xs mx-auto">
          Estamos preparando nuevos premios para ti. Regresa más tarde.
        </p>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-start gap-3 text-left w-full max-w-sm">
        <div className="bg-blue-100 rounded-full p-2 shrink-0">
          <MdRedeem className="text-blue-600 text-2xl" />
        </div>
        <p className="text-sm font-medium text-blue-900 leading-snug pt-0.5">
          ¡Estamos recargando el stock con premios increíbles! Prepárate para
          canjear tus puntos.
        </p>
      </div>

      <Button
        variant="secondary"
        size="lg"
        fullWidth
        className="max-w-sm"
        onClick={onGoHome}
      >
        Volver al Inicio
      </Button>
    </div>
  );
}
