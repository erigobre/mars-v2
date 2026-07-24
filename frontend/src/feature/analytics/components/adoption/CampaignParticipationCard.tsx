import { MdInfo, MdInfoOutline } from "react-icons/md";
import type { z } from "zod";
import type { campaignParticipationSchema } from "../../schemas/adoptionAnalytics";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/core/components/ui/tooltip";

type ParticipationData = z.infer<typeof campaignParticipationSchema>;

export default function CampaignParticipationCard({
  data,
}: {
  data: ParticipationData;
}) {
  const remaining = data.totalEligible - data.participants;

  return (
    <div className="col-span-12 lg:col-span-5 bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex flex-col h-full">
      <div className="mb-6">
        <div className="flex items-center gap-2">
          <h3 className="font-bold text-slate-900">
            Participación en Campañas
          </h3>
          <Tooltip>
            <TooltipTrigger asChild>
              <button className="outline-none">
                <MdInfoOutline className="text-slate-400 hover:text-slate-600 cursor-help" />
              </button>
            </TooltipTrigger>
            <TooltipContent className="bg-slate-800 text-white border-slate-700 max-w-xs">
              <p className="text-[10px] leading-relaxed">
                Muestra cuántos vendedores elegibles se han sumado a la campaña
                activa frente a las ventas normales. Es el indicador principal
                para medir el Retorno de Inversión (ROI) de los esfuerzos de
                marketing.
              </p>
            </TooltipContent>
          </Tooltip>
        </div>
        <p className="text-xs text-slate-500">
          Usuarios inscritos vs. universo elegible
        </p>
      </div>

      <div className="flex-1 flex flex-col justify-center">
        <div className="py-2">
          <div className="flex justify-between items-end mb-4">
            <div>
              <p className="text-sm font-bold text-slate-900 truncate max-w-40">
                {data.campaignName || "Campaña General"}
              </p>
              <p className="text-xs text-slate-500 mt-0.5">
                Progreso actual de inscripciones
              </p>
            </div>
            <div className="text-right">
              <p className="text-lg font-black text-primary">
                {data.participationRate}%
              </p>
              <p className="text-[10px] text-slate-500 font-medium">
                {data.participants.toLocaleString()} /{" "}
                {data.totalEligible.toLocaleString()} elegibles
              </p>
            </div>
          </div>

          <div className="h-4 w-full bg-slate-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-primary rounded-full transition-all duration-1000"
              style={{ width: `${data.participationRate}%` }}
            ></div>
          </div>

          <div className="mt-6 grid grid-cols-2 gap-4">
            <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
              <p className="text-[10px] text-slate-500 font-bold uppercase">
                Inscritos
              </p>
              <p className="text-lg font-bold text-slate-900 mt-1">
                {data.participants.toLocaleString()}
              </p>
            </div>
            <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
              <p className="text-[10px] text-slate-500 font-bold uppercase">
                Restantes
              </p>
              <p className="text-lg font-bold text-slate-900 mt-1">
                {remaining.toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Insight Box */}
      <div className="mt-6 bg-blue-50 p-4 rounded-xl border border-blue-100">
        <div className="flex items-center text-blue-700 space-x-2 mb-2">
          <MdInfo className="text-lg" />
          <p className="text-xs font-bold">Resumen de Participación</p>
        </div>
        <p className="text-[11px] text-blue-600 leading-relaxed">
          La participación actual muestra un comportamiento alineado a los
          objetivos. Considera enviar recordatorios automáticos al{" "}
          <strong>{100 - data.participationRate}%</strong> de la base que aún no
          participa.
        </p>
      </div>
    </div>
  );
}
