import {
  MdShoppingCartCheckout,
  MdTrendingUp,
  MdTrendingDown,
  MdCalendarViewWeek,
  MdCardGiftcard,
  MdCheckCircle,
  MdStar,
} from "react-icons/md";
import type { RewardsKpi } from "../../schemas/distributorDashboardSchema";
import MetricCard from "../MetricCard";

interface RewardsKpisProps {
  kpis?: RewardsKpi;
}

export default function RewardsKpis({ kpis }: RewardsKpisProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <MetricCard
        title="Canjes Hoy"
        value={kpis?.claimsToday?.value || 0}
        icon={<MdShoppingCartCheckout />}
        colorScheme="primary"
        subtitle={
          kpis?.claimsToday?.trend !== undefined && (
            <p className="text-xs text-primary font-medium flex items-center gap-1 mt-1">
              {kpis.claimsToday.trend > 0 ? (
                <MdTrendingUp className="text-xs" />
              ) : (
                <MdTrendingDown className="text-xs" />
              )}
              {kpis.claimsToday.trend > 0 ? "+" : ""}
              {kpis.claimsToday.trend}%{" "}
              {kpis.claimsToday.trendLabel || "vs ayer"}
            </p>
          )
        }
      />

      <MetricCard
        title="Canjes Semana"
        value={kpis?.claimsWeek?.value || 0}
        icon={<MdCalendarViewWeek />}
        colorScheme="secondary"
        subtitle={
          <p className="text-xs text-slate-400 mt-1">Objetivo: Semanal</p>
        }
      />

      <MetricCard
        title="Premios Entregados"
        value={kpis?.totalDelivered?.value || 0}
        icon={<MdCardGiftcard />}
        colorScheme="tertiary"
        subtitle={
          <p className="text-xs text-tertiary font-medium flex items-center gap-1 mt-1">
            <MdCheckCircle className="text-xs" />
            {kpis?.totalDelivered?.effectivenessPercentage || 0}% efectividad
          </p>
        }
      />

      <MetricCard
        title="Puntos Gastados"
        value={(kpis?.pointsSpent?.value || 0).toLocaleString()}
        icon={<MdStar />}
        colorScheme="orange"
        subtitle={<p className="text-xs text-slate-400 mt-1">Este mes</p>}
      />
    </div>
  );
}
