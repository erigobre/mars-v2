import { useState } from "react";
import {
  MdFiberManualRecord,
  MdGroup,
  MdPersonAdd,
  MdToday,
} from "react-icons/md";
import PageHeader from "@/core/components/common/PageHeader";
import MetricCard from "../components/MetricCard";
import { useDailyUsage } from "../services/analyticsServices";
import { usePageBreadcrumbs } from "@/core/hooks/usePageBreadcrumbs";
import DailyUsageSkeleton from "../components/daily-usage/DailyUsageSkeleton";
import HourlyActivityChart from "../components/daily-usage/HourlyActivityChart";
import RecentLoginsPanel from "../components/daily-usage/RecentLoginsPanel";
import RoleDistributionDonut from "../components/daily-usage/RoleDistributionDonut";
import TopActionsPanel from "../components/daily-usage/TopActionsPanel";
import { ROLE_OPTIONS, type DailyUsageFilters } from "../types/dailyUsageFilters";
import DailyUsageFiltersBar from "../components/daily-usage/DailyUsageFiltersBar";
import { formatDateTime } from "@/core/utils/formatDate";

export default function DailyUsageView() {
  const [filters, setFilters] = useState<DailyUsageFilters>({});

  const handleFilterChange = (
    key: keyof DailyUsageFilters,
    value: string | number | undefined,
  ) => {
    setFilters((prev) => {
      const next = { ...prev };
      if (value === undefined || value === "") {
        delete next[key];
      } else {
        (next as any)[key] = value;
      }
      return next;
    });
  };

  const { data, isLoading, isError } = useDailyUsage(filters);

  usePageBreadcrumbs([{ label: "Uso Diario" }]);

  // Derive a human-readable description of the active filters
  const activeFilterLabel = (() => {
    const parts: string[] = [];
    if (filters.role) {
      const found = ROLE_OPTIONS.find((o) => o.value === filters.role);
      if (found) parts.push(found.label);
    }
    return parts.length ? `· Filtrando: ${parts.join(", ")}` : "";
  })();

  if (isLoading) return <DailyUsageSkeleton />;

  if (isError || !data) {
    return (
      <div className="p-4 text-rose-500 font-medium">
        Error al cargar las métricas de uso diario.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Uso Diario"
        subtitle={`Actividad en tiempo real · ${formatDateTime(data.date)} · ${data.timezone} ${activeFilterLabel}`}
      />

      <DailyUsageFiltersBar filters={filters} onChange={handleFilterChange} />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 lg:gap-6">
        <MetricCard
          title="Usuarios Únicos Hoy"
          value={data.kpiTotalToday.toLocaleString()}
          icon={<MdToday />}
          colorScheme="primary"
          tooltipInfo="Total de usuarios únicos que iniciaron sesión en el día de hoy (con los filtros aplicados)."
        />
        <MetricCard
          title="Sesiones Activas"
          value={
            <span className="flex items-center gap-2">
              {data.kpiActiveUsers.toLocaleString()}
              <MdFiberManualRecord className="text-emerald-500 text-sm animate-pulse" />
            </span>
          }
          icon={<MdGroup />}
          colorScheme="emerald"
          tooltipInfo="Usuarios con token de Sanctum vigente (proxy de sesión activa)."
        />
        <MetricCard
          title="Nuevos Usuarios"
          value={data.kpiNewUsers.toLocaleString()}
          icon={<MdPersonAdd />}
          colorScheme="indigo"
          tooltipInfo="Cuentas creadas en el día de hoy."
        />
      </div>

      <div className="grid grid-cols-12 gap-6">
        <HourlyActivityChart
          labels={data.chartData.labels}
          series={data.chartData.series}
        />
        <RoleDistributionDonut data={data.roleBreakdown} />
      </div>

      <div className="grid grid-cols-12 gap-6">
        <TopActionsPanel data={data.topActions} />
        <RecentLoginsPanel data={data.recentLogins} />
      </div>
    </div>
  );
}
