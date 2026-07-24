import { MdGroup, MdInfoOutline, MdVerifiedUser } from "react-icons/md";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/core/components/ui/tooltip";

type AdoptionData = {
  status: "excellent" | "good" | "fair" | "poor";
  activeUsers: number;
  totalUsers: number;
  percentage?: number | undefined;
};

export default function TasaAdopcionCard({ data }: { data: AdoptionData }) {
  return (
    <div className="bg-primary text-white p-6 rounded-xl relative overflow-hidden shadow-lg shadow-primary/20">
      <div className="absolute -right-4 -bottom-4 opacity-10">
        <MdGroup className="text-9xl" />
      </div>

      <div className="relative z-10">
        <div className="flex justify-between items-start mb-1">
          <div className="flex gap-1.5">
            <span className="text-xs font-bold text-blue-100 uppercase tracking-wider">
              Tasa de Adopción
            </span>
            <Tooltip>
              <TooltipTrigger asChild>
                <button className="outline-none">
                  <MdInfoOutline className="text-white hover:text-slate-200 cursor-help" />
                </button>
              </TooltipTrigger>
              <TooltipContent className="bg-slate-800 text-white border-slate-700">
                <p className="text-[10px]">
                  Porcentaje de vendedores con ventas o movimientos de puntos en los últimos 30 días.
                </p>
              </TooltipContent>
            </Tooltip>
          </div>
          <MdVerifiedUser className="text-blue-200 text-xl" />
        </div>
        <h3 className="text-4xl font-black mt-2">{data.percentage}%</h3>
        <p className="text-sm text-blue-100 mt-1">
          {data.activeUsers} Vendedores Activos
        </p>
      </div>

      <div className="relative z-10 mt-6 h-1.5 w-full bg-white/20 rounded-full">
        <div
          className="h-full bg-white rounded-full transition-all duration-500"
          style={{ width: `${data.percentage}%` }}
        />
      </div>
    </div>
  );
}
