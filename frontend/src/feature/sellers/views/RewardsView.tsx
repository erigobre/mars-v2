import { useState } from "react";
import {
  MdTune,
  MdSearch,
  MdChevronLeft,
  MdChevronRight,
} from "react-icons/md";
import { useTableFilters } from "@/core/hooks/useTableFilters";

import FilterSidebar from "../components/rewards/FilterSidebar";
import MobileFilterSheet from "../components/rewards/MobileFilterSheet";
import RewardGrid from "../components/rewards/RewardGrid";

import { useRewardsQuery } from "@/feature/rewards/services/rewardServices";
import { useSellerDashboardQuery } from "../services/sellerServices";
import { useNavigate } from "react-router-dom";
import type { Reward } from "@/feature/rewards/schemas/reward";
import type { FilterState } from "@/core/types";
import { PerPageSelector } from "@/core/components/ui/PerPageSelector";

// Interfaz para los filtros específicos del vendedor
type SellerRewardFilters = {
  page?: number;
  per_page?: number;
  name?: string;
  category?: string;
  onlyAffordable?: string;
  minPoints?: string;
  maxPoints?: string;
};

export default function RewardsView() {
  const navigate = useNavigate();

  const { data: dashboard, isLoading: isDashboardLoading } =
    useSellerDashboardQuery();
  const isStoreOpen = dashboard?.storeStatus?.isOpen ?? false;
  const currentPoints = dashboard?.seller?.currentPoints ?? 0;

  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);
  const {
    page,
    perPage,
    filters,
    appliedFilters,
    setFilter,
    setFilters,
    setPage,
  } = useTableFilters<SellerRewardFilters>(12);

  const isOnlyAffordable = appliedFilters.onlyAffordable === "true";
  const calculatedMaxPoints = isOnlyAffordable
    ? appliedFilters.maxPoints
      ? Math.min(Number(appliedFilters.maxPoints), currentPoints).toString()
      : currentPoints.toString()
    : appliedFilters.maxPoints;

  const {
    data: paginatedData,
    isLoading: isRewardsLoading,
    isFetching,
  } = useRewardsQuery({
    page,
    perPage: perPage,
    filters: {
      status: "active",
      name: appliedFilters.name,
      category: appliedFilters.category,
      minPoints: appliedFilters.minPoints,
      maxPoints: calculatedMaxPoints,
    },
  });

  const categories = paginatedData?.categories ?? [];
  const rawItems = paginatedData?.items ?? [];

  const totalPages = paginatedData?.meta?.last_page || 1;

  const rewards = rawItems;

  const handleFilterChange = (newFilters: FilterState) => {
    setFilters({
      category: newFilters.categories.join(",") || undefined,
      onlyAffordable: newFilters.onlyAffordable ? "true" : undefined,
      minPoints: newFilters.minPoints || undefined,
      maxPoints: newFilters.maxPoints || undefined,
    });
  };

  const handleClearFilters = () => {
    setFilters({
      category: undefined,
      name: undefined,
      onlyAffordable: undefined,
      minPoints: undefined,
      maxPoints: undefined,
    });
  };

  const handleRedeem = (reward: Reward) => {
    navigate(`claim/${reward.id}`);
  };

  // Paginación handlers
  const handlePrevPage = () => {
    if (page > 1) setPage(page - 1);
  };

  const handleNextPage = () => {
    if (page < totalPages) setPage(page + 1);
  };

  const activeFiltersCount =
    (filters.category ? 1 : 0) +
    (isOnlyAffordable ? 1 : 0) +
    (filters.minPoints || filters.maxPoints ? 1 : 0);

  const currentFilterState = {
    categories: filters.category ? filters.category.split(",") : [],
    onlyAffordable: isOnlyAffordable,
    minPoints: filters.minPoints || "",
    maxPoints: filters.maxPoints || "",
  };

  return (
    <div className="space-y-5">
      {/* Buscador y Botón Filtros Mobile */}
      <div className="flex gap-3 ">
        <div className="relative">
          <MdSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-white text-xl" />
          <input
            placeholder="Buscar premio..."
            value={filters.name || ""}
            onChange={(e) => setFilter("name", e.target.value)} // Actualiza la URL directo
            className="w-full h-12 pl-11 pr-4 rounded-full border-2 border-white bg-transparent md:text-lg placeholder:text-white text-white focus:outline-none focus:ring transition-all"
          />
        </div>

        <button
          onClick={() => setMobileFilterOpen(true)}
          className="md:hidden flex items-center gap-2 px-4 py-2 bg-transparent border-2 border-white rounded-2xl text-sm font-semibold text-gray-700 shadow-sm"
        >
          <MdTune className="text-white text-2xl" />
          {activeFiltersCount > 0 && (
            <span className="text-xs bg-white font-bold w-5 h-5  rounded-full flex items-center justify-center">
              {activeFiltersCount}
            </span>
          )}
        </button>

        <div className="bg-theme-light-primary px-3 py-1.5 rounded-xl flex items-center gap-1.5 text-theme-text-dark">
          {/* <MdSavings className="text-sm" /> */}
          <span className="md:text-lg font-normal text-nowrap">
            {isDashboardLoading
              ? "Cargando..."
              : `Saldo: ${currentPoints.toLocaleString()} pts`}
          </span>
        </div>
      </div>

      <div className="flex gap-7 items-start">
        <div className="hidden md:block">
          <FilterSidebar
            categories={categories}
            filters={currentFilterState}
            onChange={handleFilterChange}
          />
        </div>

        {/* Catálogo Principal */}
        <div className="flex-1 min-w-0">
          <RewardGrid
            isLoading={isRewardsLoading || isFetching || isDashboardLoading}
            rewards={rewards}
            userPoints={currentPoints}
            isStoreOpen={isStoreOpen}
            onRedeem={handleRedeem}
            onClearFilters={handleClearFilters}
          />

          <div className="flex flex-col sm:flex-row items-center justify-between gap-5 mt-6 bg-transparent backdrop-blur-sm py-4 px-5 rounded-2xl border-2 border-white shadow-lg w-full">
            <PerPageSelector
              value={perPage || 12}
              onChange={(newPerPage) => {
                setFilter("per_page", newPerPage);
                setFilter("page", 1);
              }}
            />

            {!isRewardsLoading && totalPages > 1 && (
              <div className="flex items-center justify-center gap-3 self-center">
                <button
                  onClick={handlePrevPage}
                  disabled={page <= 1}
                  className="w-10 h-10 flex items-center justify-center rounded-xl bg-transparent hover:bg-white/20 text-white border border-white disabled:opacity-30 disabled:cursor-not-allowed transition-all active:scale-95"
                >
                  <MdChevronLeft className="text-2xl" />
                </button>

                <div className="flex items-center gap-1.5 px-3">
                  <span className="text-sm font-medium text-white">
                    Página
                  </span>
                  <span className="text-sm text-white font-bold px-2.5 py-1 rounded-lg border-2 border-swhite">
                    {page}
                  </span>
                  <span className="text-sm font-medium text-white">
                    de {totalPages}
                  </span>
                </div>

                <button
                  onClick={handleNextPage}
                  disabled={page >= totalPages}
                  className="w-10 h-10 flex items-center justify-center rounded-xl bg-transparent hover:bg-white/20 text-white border-2 border-white disabled:opacity-30 disabled:cursor-not-allowed transition-all active:scale-95"
                >
                  <MdChevronRight className="text-2xl" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <MobileFilterSheet
        categories={categories}
        open={mobileFilterOpen}
        filters={currentFilterState}
        onChange={handleFilterChange}
        onClose={() => setMobileFilterOpen(false)}
      />
    </div>
  );
}
