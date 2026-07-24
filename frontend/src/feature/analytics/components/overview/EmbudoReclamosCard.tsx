import { Tooltip, TooltipContent, TooltipTrigger } from "@/core/components/ui/tooltip";
import BaseCard from "../BaseCard";
import { MdInfoOutline } from "react-icons/md";

type FunnelData = {
  pending: number;
  approved: number;
  shipped: number;
  delivered: number;
};

export default function EmbudoReclamosCard({ data }: { data: FunnelData }) {
  const items = [
    { label: "Pendientes", value: data.pending, color: "bg-red-500" },
    { label: "Aprobados", value: data.approved, color: "bg-amber-400" },
    { label: "Enviados", value: data.shipped, color: "bg-emerald-500" },
  ];

  return (
    <BaseCard className="p-6">
      <div className="flex justify-start items-center gap-2 mb-4">
        <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
          Embudo de Reclamos
        </span>
        <Tooltip>
          <TooltipTrigger asChild>
            <button className="outline-none">
              <MdInfoOutline className="text-slate-400 hover:text-slate-600 cursor-help" />
            </button>
          </TooltipTrigger>
          <TooltipContent className="bg-slate-800 text-white border-slate-700">
            <p className="text-[10px]">
              Distribución de las solicitudes de premios según su etapa en el proceso de aprobación y envío.
            </p>
          </TooltipContent>
        </Tooltip>
      </div>
      <div className="space-y-4">
        {items.map((item) => (
          <div key={item.label} className="flex items-center justify-between">
            <div className="flex items-center">
              <div className={`w-2 h-2 rounded-full ${item.color} mr-3`} />
              <span className="text-sm font-medium text-slate-600">
                {item.label}
              </span>
            </div>
            <span className="text-sm font-bold text-slate-900">
              {item.value}
            </span>
          </div>
        ))}
      </div>
    </BaseCard>
  );
}
