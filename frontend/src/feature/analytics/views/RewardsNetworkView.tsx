import { SkeletonCard } from "@/core/components/ui/Skeleton/SkeletonCard";
import { useDistributorRewardsMetrics } from "../services/analyticsServices";
import RecentClaimsTable from "../components/economy/RecentClaimsTable";
import RewardsKpis from "../components/rewards/RewardsKpis";
import ShippingFunnel from "../components/rewards/ShippingFunnel";
import PageHeader from "@/core/components/common/PageHeader";

export default function RewardsNetworkView() {
  const { data, isLoading, isError } = useDistributorRewardsMetrics();

  if (isLoading) {
    return (
      <div className="p-8 space-y-8">
        <SkeletonCard className="h-20" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <SkeletonCard className="h-32" />
          <SkeletonCard className="h-32" />
          <SkeletonCard className="h-32" />
          <SkeletonCard className="h-32" />
        </div>
        <SkeletonCard className="h-32" />
        <SkeletonCard className="h-96" />
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="p-8 flex justify-center items-center h-64 text-slate-500">
        <p>No se pudo cargar la información de recompensas.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 min-h-screen">
      <PageHeader
        title="Seguimiento de Premios"
        subtitle="Monitorea el progreso y canjes de tu red de distribuidores."
      />

      <RewardsKpis kpis={data.kpis} />

      <ShippingFunnel data={data.shippingStatus} />

      <RecentClaimsTable claims={data.recentClaims || []} />
    </div>
  );
};
