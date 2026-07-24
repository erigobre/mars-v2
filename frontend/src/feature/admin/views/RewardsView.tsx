import { useState } from "react";
import { MdAdd, MdSearch } from "react-icons/md";
import PageHeader from "@/core/components/common/PageHeader";
import { Button } from "@/core/components/ui";
import { usePageBreadcrumbs } from "@/core/hooks/usePageBreadcrumbs";
import type { Reward } from "../../rewards/schemas/reward";
import { useRewardsQuery } from "../../rewards/services/rewardServices";
import RewardsTable from "../components/reward/RewardsTable";
import RewardFormDrawer from "../components/reward/RewardFormDrawer";
import { useTableFilters } from "@/core/hooks/useTableFilters";
import type { RewardFilters } from "@/core/types/filters";

const FILTER_TABS = [
  { value: "", label: "Todos" },
  { value: "active", label: "Activos" },
  { value: "inactive", label: "Inactivos" },
  { value: "out_of_stock", label: "Sin Stock" },
];

export default function RewardsView() {
  const { page, perPage, filters, setFilter } =
    useTableFilters<RewardFilters>();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [selectedReward, setSelectedReward] = useState<Reward | null>(null);

  usePageBreadcrumbs([{ label: "Premios" }]);

  const {
    data: paginatedData,
    isLoading,
    isPlaceholderData,
  } = useRewardsQuery({ page, perPage, filters });

  const handleEdit = (reward: Reward) => {
    setSelectedReward(reward);
    setIsDrawerOpen(true);
  };

  return (
    <div>
      <PageHeader
        title="Gestión de Premios"
        subtitle="Administra el catálogo de recompensas para tus usuarios."
      >
        <Button
          variant="primary"
          leftIcon={<MdAdd className="text-xl" />}
          className="shadow-sm rounded-lg"
          onClick={() => {
            setSelectedReward(null);
            setIsDrawerOpen(true);
          }}
        >
          Nuevo Premio
        </Button>
      </PageHeader>

      {/* Search + Filters */}
      <div className="flex gap-4 mb-4">
        {/* Búsqueda */}
        <div className="relative flex-1 max-w-md">
          <MdSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-xl" />
          <input
            placeholder="Buscar por nombre..."
            value={filters.name || ""}
            onChange={(e) => setFilter("name", e.target.value)}
            className="w-full h-12 pl-11 pr-4 rounded-xl border border-gray-200 bg-gray-50 text-gray-900 text-sm font-medium placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
          />
        </div>

        {/* Filtro por Categoría */}
        <select
          className="h-12 px-4 rounded-xl border border-gray-200 bg-white text-sm"
          value={filters.category || ""}
          onChange={(e) => setFilter("category", e.target.value)}
        >
          <option value="">Todas las categorías</option>
          {paginatedData?.categories?.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>

        {/* Tabs de Estado */}
        <div className="flex gap-2 flex-wrap">
          {FILTER_TABS.map((tab) => (
            <button
              key={tab.label}
              onClick={() => setFilter("status", tab.value)}
              className={`h-12 px-5 rounded-xl text-sm font-semibold transition-colors ${
                (filters.status || "") === tab.value
                  ? "bg-primary text-white shadow-sm"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <RewardsTable
        data={paginatedData?.items ?? []}
        isLoading={isLoading}
        isPlaceholderData={isPlaceholderData}
        meta={paginatedData?.meta}
        onPageChange={(newPage) => setFilter("page", newPage)}
        onPerPageChange={(newPerPage) => setFilter("per_page", newPerPage)}
        onEdit={handleEdit}
      />

      <RewardFormDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        rewardToEdit={selectedReward}
      />
    </div>
  );
}
