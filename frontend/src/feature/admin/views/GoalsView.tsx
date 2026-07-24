import { useState } from "react";
import { MdAdd } from "react-icons/md";
import PageHeader from "@/core/components/common/PageHeader";
import { Button } from "@/core/components/ui";
import { usePageBreadcrumbs } from "@/core/hooks/usePageBreadcrumbs";
import { useTableFilters } from "@/core/hooks/useTableFilters";

// Servicios y Schemas
import {
  useCampaignsQuery,
  useCampaignDetailsQuery,
} from "@/feature/admin/services/campaignServices";
import { useGoalsQuery } from "../services/goalServices";
import type { AdminGoal, GoalFilters } from "../schemas/goal";
import GoalsTable from "../components/goal/GoalsTable";
import GoalFormDrawer from "../components/goal/GoalFormDrawer";

export default function GoalsView() {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState<AdminGoal | null>(null);

  const [selectedCampaignId, setSelectedCampaignId] = useState<number | "">("");

  usePageBreadcrumbs([{ label: "Metas" }]);

  const { 
    page, 
    perPage, 
    filters, 
    setFilter, 
    setPage, 
    setPerPage 
  } = useTableFilters<GoalFilters>();

  const { data: campaignsData } = useCampaignsQuery(1, 100);
  const campaigns = campaignsData?.items ?? [];

  const { data: campaignDetails, isLoading: isLoadingCycles } =
    useCampaignDetailsQuery(selectedCampaignId);
  const availableCycles = campaignDetails?.cycles ?? [];

  const {
    data: paginatedData,
    isLoading: isLoadingGoals,
    isPlaceholderData,
  } = useGoalsQuery(page, perPage, filters);

  const handleCampaignChange = (id: string) => {
    const campaignId = id ? Number(id) : "";
    setSelectedCampaignId(campaignId);

    // Al cambiar de campaña, reseteamos el filtro de ciclo en la tabla
    setFilter("cycleId", undefined);
  };

  const handleEdit = (goal: AdminGoal) => {
    setSelectedGoal(goal);
    setIsDrawerOpen(true);
  };

  const handleCreate = () => {
    setSelectedGoal(null);
    setIsDrawerOpen(true);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Gestión de Metas"
        subtitle="Administra las metas y objetivos de los vendedores."
      >
        <Button
          variant="primary"
          leftIcon={<MdAdd className="text-xl" />}
          className="shadow-sm rounded-lg"
          onClick={handleCreate}
        >
          Nueva Meta
        </Button>
      </PageHeader>

      {/* Barra de Filtros */}
      <div className="flex flex-col lg:flex-row flex-wrap gap-4 bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
        {/* Selector de Campaña */}
        <div className="flex flex-col gap-1.5 flex-1">
          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">
            Campaña
          </label>
          <select
            className="h-12 px-4 rounded-xl border border-gray-200 bg-white text-sm font-medium focus:ring-2 focus:ring-primary/20 outline-none transition-all"
            value={selectedCampaignId}
            onChange={(e) => handleCampaignChange(e.target.value)}
          >
            <option value="">Todas las campañas</option>
            {campaigns.map((camp) => (
              <option key={camp.id} value={camp.id}>
                {camp.name}
              </option>
            ))}
          </select>
        </div>

        {/* Selector de Ciclo (Dependiente de Campaña) */}
        <div className="flex flex-col gap-1.5 flex-1">
          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">
            Ciclo {isLoadingCycles && "— Cargando..."}
          </label>
          <select
            className="h-12 px-4 rounded-xl border border-gray-200 bg-white text-sm font-medium disabled:bg-gray-50 disabled:text-gray-400 transition-all"
            disabled={!selectedCampaignId || isLoadingCycles}
            value={filters.cycleId ?? ""}
            onChange={(e) =>
              setFilter(
                "cycleId",
                e.target.value ? Number(e.target.value) : undefined
              )
            }
          >
            <option value="">
              {selectedCampaignId
                ? "Todos los ciclos"
                : "Selecciona una campaña primero"}
            </option>
            {availableCycles.map((cycle) => (
              <option key={cycle.id} value={cycle.id}>
                {cycle.name}
              </option>
            ))}
          </select>
        </div>

        {/* Filtro por Tipo */}
        <div className="flex flex-col gap-1.5 flex-1">
          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">
            Tipo de Meta
          </label>
          <select
            className="h-12 px-4 rounded-xl border border-gray-200 bg-white text-sm font-medium"
            value={filters.type ?? ""}
            onChange={(e) => setFilter("type", e.target.value || undefined)}
          >
            <option value="">Todos los tipos</option>
            <option value="TOTAL_SALES_AMOUNT">Monto Total de Ventas</option>
            <option value="SPECIFIC_PRODUCT_QTY">Producto Específico</option>
            <option value="TOTAL_DISPLAY_QTY">Display</option>
          </select>
        </div>

        {/* Botones de Estado */}
        <div className="flex flex-col gap-1.5">
          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">
            Estado
          </label>
          <div className="flex gap-2">
            {[
              { label: "Todas", value: undefined },
              { label: "Activas", value: true },
              { label: "Inactivas", value: false },
            ].map((opt) => (
              <button
                key={String(opt.value)}
                onClick={() => setFilter("isActive", opt.value)}
                className={`h-12 px-5 rounded-xl text-sm font-bold transition-all ${
                  filters.isActive === opt.value
                    ? "bg-primary text-white shadow-md"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <GoalsTable
        data={paginatedData?.items ?? []}
        isLoading={isLoadingGoals}
        isPlaceholderData={isPlaceholderData}
        meta={paginatedData?.meta}
        onPageChange={(newPage) => setPage(newPage)}
        onPerPageChange={(newPerPage) => setPerPage(newPerPage)}
        onEdit={handleEdit}
      />

      <GoalFormDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        goalToEdit={selectedGoal}
      />
    </div>
  );
}
