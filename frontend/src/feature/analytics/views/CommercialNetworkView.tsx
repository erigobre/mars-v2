
import { SkeletonCard } from "@/core/components/ui/Skeleton/SkeletonCard";
import { useDistributorCommercialMetrics } from "../services/analyticsServices";
import TeamRankingTable from "../components/commercial/TeamRankingTable";
import CommercialKpis from "../components/commercial/CommercialKpis";
import TopProductsList from "../components/commercial/TopProductsList";
import PageHeader from "@/core/components/common/PageHeader";

export default function CommercialNetworkView() {
  const { data, isLoading, isError } =
    useDistributorCommercialMetrics();

  if (isLoading) {
    return (
      <div className="p-6 lg:p-10 space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <SkeletonCard className="h-32" />
          <SkeletonCard className="h-32" />
          <SkeletonCard className="h-32" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <SkeletonCard className="h-96" />
          </div>
          <div>
            <SkeletonCard className="h-96" />
          </div>
        </div>
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="p-6 lg:p-10 text-center text-slate-500">
        Error al cargar los datos comerciales.
      </div>
    );
  }

  return (
    <div className="">
      <PageHeader
        title="Red Comercial"
        subtitle="Análisis de desempeño comercial, ranking de equipos y productos más vendidos."
      />

      <CommercialKpis kpis={data.kpis} />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <TeamRankingTable ranking={data.teamRanking} />
        <TopProductsList products={data.topProducts} />
      </div>
    </div>
  );
};
