import type { AnalyticsFilters } from "../types";
import { useOverviewMetrics } from "../services/analyticsServices";
import VentasMetaCard from "../components/overview/VentasMetaCard";
import PageHeader from "@/core/components/common/PageHeader";
import DeudaCirculanteCard from "../components/overview/DeudaCirculanteCard";
import TasaAdopcionCard from "../components/overview/TasaAdopcionCard";
import EmbudoReclamosCard from "../components/overview/EmbudoReclamosCard";
import VentasGlobalesChart from "../components/overview/VentasGlobalesChart";
import TopSellersLeaderboard from "../components/overview/TopSellersLeaderboard";
import OverviewSkeleton from "../components/overview/OverviewSkeleton";
import { useTableFilters } from "@/core/hooks/useTableFilters";
import GlobalAnalyticsFilters from "../components/GlobalAnalyticsFilters";

export default function OverviewView() {
  const {
    filters: localFilters,
    appliedFilters,
    setFilter,
  } = useTableFilters<AnalyticsFilters>();

  const { data, isLoading, isError } = useOverviewMetrics(appliedFilters);

  if (isLoading || !data) {
    return <OverviewSkeleton />;
  }

  if (isError) {
    return (
      <div className="p-4 text-red-500">Error al cargar las métricas.</div>
    );
  }

  return (
    <div>
      <PageHeader
        title="Resumen Ejecutivo"
        subtitle="Bienvenido de nuevo, esto es lo que está pasando hoy."
      >
        {/* <Button
          variant="ghost"
          className="bg-white hover:bg-gray-50 border border-gray-200 shadow-sm"
        >
          <MdFileDownload className="mr-2 text-lg" />
          Descargar Reporte
        </Button>
        <Button variant="primary">
          <MdAdd className="mr-2 text-lg" />
          Nueva Meta
        </Button> */}
      </PageHeader>

      <GlobalAnalyticsFilters filters={localFilters} setFilter={setFilter} />

      {/* Fila 1: KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2  xl:grid-cols-4 gap-6">
        <VentasMetaCard data={data.kpis.salesVsGoals} />
        <DeudaCirculanteCard data={data.kpis.circulatingDebt} />
        <TasaAdopcionCard data={data.kpis.adoptionRate} />
        <EmbudoReclamosCard data={data.kpis.claimsFunnel} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
        <VentasGlobalesChart data={data.charts.monthlyEvolution} />
        <TopSellersLeaderboard data={data.leaderboard} />
      </div>
    </div>
  );
}
