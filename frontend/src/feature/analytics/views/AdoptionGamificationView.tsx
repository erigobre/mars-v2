// analytics/views/AdoptionGamificationView.tsx
import type { AnalyticsFilters } from "../types";
import { useAdoptionMetrics } from "../services/analyticsServices";
import PageHeader from "@/core/components/common/PageHeader";

// Componentes
import EngagementKpiBar from "../components/adoption/EngagementKpiBar";
import UserActivityChart from "../components/adoption/UserActivityChart";
import CampaignParticipationCard from "../components/adoption/CampaignParticipationCard";
import TopEngagedSellersTable from "../components/adoption/TopEngagedSellersTable";
import AdoptionGamificationSkeleton from '../components/adoption/AdoptionGamificationSkeleton';
import GlobalAnalyticsFilters from "../components/GlobalAnalyticsFilters";
import { useTableFilters } from "@/core/hooks/useTableFilters";

export default function AdoptionGamificationView() {
  const {
    filters: localFilters,
    appliedFilters,
    setFilter,
  } = useTableFilters<AnalyticsFilters>();
  const { data, isLoading, isError } = useAdoptionMetrics(appliedFilters);

  if (isLoading || !data) {
    return <AdoptionGamificationSkeleton />;
  }

  if (isError) {
    return (
      <div className="p-4 text-rose-500 font-bold">
        Error al cargar las métricas de adopción.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Adopción y Gamificación"
        subtitle="Métricas de penetración del programa, engagement de usuarios y participación en campañas."
      />

      <GlobalAnalyticsFilters filters={localFilters} setFilter={setFilter} />

      <div className="grid grid-cols-12 gap-6">
        <EngagementKpiBar data={data.engagement} />

        <UserActivityChart data={data.activityRate} />
        <CampaignParticipationCard data={data.campaignParticipation} />
        <TopEngagedSellersTable data={data.topEngagedSellers} />
      </div>
    </div>
  );
}
