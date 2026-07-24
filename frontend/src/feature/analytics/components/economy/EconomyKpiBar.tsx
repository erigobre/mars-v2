import {
  MdAccountBalanceWallet,
  MdCardGiftcard,
  MdPendingActions,
  MdTrendingUp,
} from "react-icons/md";
import type { AdminEconomyRewardsData } from "../../schemas/dashboardEndpoints";
import MetricCard from "../MetricCard";
import { formatNumber } from "@/core/utils/formatDate";

type EconomyKpis = AdminEconomyRewardsData["kpis"];

export default function EconomyKpiBar({ kpis }: { kpis: EconomyKpis }) {
  return (
    <div className="col-span-12 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 lg:gap-6 mb-2">
      <MetricCard
        title="Balance Total"
        tooltipInfo="Suma total de puntos emitidos que aún están disponibles para ser canjeados por los usuarios."
        value={
          <>
            {formatNumber(kpis.balanceTotal.value)}{" "}
            <span className="text-xs text-slate-400 font-normal">pts</span>
          </>
        }
        icon={<MdAccountBalanceWallet />}
        colorScheme="primary"
      />

      <MetricCard
        title="Canjes Hoy"
        tooltipInfo="Número total de solicitudes de premios realizadas por los vendedores en el día actual."
        value={
          <>
            {formatNumber(kpis.canjesHoy.value)}{" "}
            <span className="text-xs text-slate-400 font-normal">
              solicitudes
            </span>
          </>
        }
        icon={<MdCardGiftcard />}
        colorScheme="emerald"
      />

      <MetricCard
        title="Pendientes"
        tooltipInfo="Envíos de premios que han sido aprobados pero que aún se encuentran en proceso de logística."
        value={
          <>
            {formatNumber(kpis.pendientes.value)}{" "}
            <span className="text-xs text-slate-400 font-normal">envíos</span>
          </>
        }
        icon={<MdPendingActions />}
        colorScheme="orange"
      />

      <MetricCard
        title="Tasa de Quema"
        tooltipInfo="Porcentaje de puntos que han sido canjeados en relación con el total de puntos emitidos."
        value={<>{kpis.tasaQuema.percentage}%</>}
        subtitle={
          <span
            className={`text-xs font-medium flex items-center gap-1 ${
              kpis.tasaQuema.trend >= 0 ? "text-emerald-500" : "text-rose-500"
            }`}
          >
            <MdTrendingUp
              className={kpis.tasaQuema.trend < 0 ? "rotate-180" : ""}
            />
            {kpis.tasaQuema.trend >= 0 ? "+" : ""}
            {kpis.tasaQuema.trend}% vs mes pasado
          </span>
        }
        icon={<MdTrendingUp />}
        colorScheme="indigo"
      />
    </div>
  );
}
