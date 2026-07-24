import { MdBolt, MdPointOfSale, MdRedeem } from "react-icons/md";
import type { z } from "zod";
import type { engagementScoreSchema } from "../../schemas/adoptionAnalytics";
import MetricCard from "../MetricCard";

type EngagementData = z.infer<typeof engagementScoreSchema>;

export default function EngagementKpiBar({ data }: { data: EngagementData }) {
  const statusLabels: Record<string, string> = {
    highly_engaged: "Altamente Comprometidos",
    engaged: "Comprometidos",
    healthy: "Saludable",
    moderately_engaged: "Moderado",
    low_engagement: "Bajo Engagement",
  };

  const statusColor =
    data.status === "highly_engaged" || data.status === "engaged"
      ? "text-tertiary bg-tertiary/10"
      : "text-amber-600 bg-amber-100";

  return (
    <div className="col-span-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-2">
      <MetricCard
        title="Nivel de Compromiso"
        value={<>{data.engagementScore}/100</>}
        subtitle={
          <span
            className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${statusColor}`}
          >
            {statusLabels[data.status] || "Desconocido"}
          </span>
        }
        icon={<MdBolt />}
        colorScheme="blue"
        tooltipInfo="Puntuación general basada en la frecuencia de ventas y canjes de los usuarios."
      />

      <MetricCard
        title="Vendedores Vendiendo"
        value={
          <>
            {data.breakdown.sellersWithSales.toLocaleString()}{" "}
            <span className="text-xs text-slate-400 font-normal">
              vendedores
            </span>
          </>
        }
        icon={<MdPointOfSale />}
        colorScheme="tertiary"
        tooltipInfo="Usuarios únicos que han registrado al menos una venta en el periodo."
      />

      <MetricCard
        title="Vendedores Canjeando"
        value={
          <>
            {data.breakdown.sellersWithClaims.toLocaleString()}{" "}
            <span className="text-xs text-slate-400 font-normal">
              vendedores
            </span>
          </>
        }
        icon={<MdRedeem />}
        colorScheme="emerald"
        tooltipInfo="Usuarios únicos que han canjeado puntos por premios en el periodo."
      />
    </div>
  );
}
