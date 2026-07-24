import type { AnalyticsFilters } from "../types";
import { useSalesMetrics } from "../services/analyticsServices";
import PageHeader from "@/core/components/common/PageHeader";

// Componentes
import SellersRankingTable from "../components/sales/SellersRankingTable";
import SalesByDistributorChart from "../components/sales/SalesByDistributorChart";
import TopProductsList from "../components/sales/TopProductsList";
import SalesPerformanceSkeleton from "../components/sales/SalesPerformanceSkeleton";
import { useTableFilters } from "@/core/hooks/useTableFilters";
import GlobalAnalyticsFilters from "../components/GlobalAnalyticsFilters";

export default function SalesPerformanceView() {
  const {
    filters: localFilters,
    appliedFilters,
    setFilter,
  } = useTableFilters<AnalyticsFilters>();
  const { data, isLoading, isError } = useSalesMetrics(appliedFilters);

  if (isLoading || !data) {
    return <SalesPerformanceSkeleton />;
  }

  if (isError) {
    return (
      <div className="p-4 text-rose-500">Error al cargar las métricas.</div>
    );
  }

  return (
    <div>
      <PageHeader
        title="Rendimiento y Ventas"
        subtitle="Analiza el desempeño por distribuidor, vendedores destacados y productos top."
      />

      <GlobalAnalyticsFilters filters={localFilters} setFilter={setFilter} />

      <div className="grid grid-cols-12 gap-8">
        <SellersRankingTable data={data.sellersRanking} />

        <SalesByDistributorChart data={data.salesByDistributor || []} />
      </div>

      <TopProductsList data={data.topProducts} />
    </div>
  );
}
