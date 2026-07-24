import type { AnalyticsFilters } from "../types";
import { useEconomyMetrics } from "../services/analyticsServices";
import PageHeader from "@/core/components/common/PageHeader";

import EconomyKpiBar from "../components/economy/EconomyKpiBar";
import EcosystemBalanceChart from "../components/economy/EcosystemBalanceChart";
import TopRewardsList from "../components/economy/TopRewardsList";
import ClaimsVolumeChart from "../components/economy/ClaimsVolumeChart";
import RecentClaimsTable from "../components/economy/RecentClaimsTable";
import EconomyRewardsSkeleton from "../components/economy/EconomyRewardsSkeleton";
import { useTableFilters } from "@/core/hooks/useTableFilters";
import GlobalAnalyticsFilters from "../components/GlobalAnalyticsFilters";

export default function EconomyRewardsView() {
  const {
    filters: localFilters,
    appliedFilters,
    setFilter,
  } = useTableFilters<AnalyticsFilters>();
  const { data, isLoading, isError } = useEconomyMetrics(appliedFilters);

  if (isLoading || !data) {
    return <EconomyRewardsSkeleton />;
  }

  if (isError) {
    return (
      <div className="p-4 text-rose-500">
        Error al cargar la economía y recompensas.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Economía y Recompensas"
        subtitle="Monitoreo de emisión de puntos, ciclos de canje y gestión de inventario de premios."
      />

      <GlobalAnalyticsFilters filters={localFilters} setFilter={setFilter} />

      <div className="grid grid-cols-12 gap-6">
        <EconomyKpiBar kpis={data.kpis} />

        <EcosystemBalanceChart data={data.ecosystemBalance} />
        <TopRewardsList data={data.topRewards} />

        <ClaimsVolumeChart data={data.claimsByCycle} />
        <RecentClaimsTable claims={data.recentClaims} />
      </div>
    </div>
  );
}
