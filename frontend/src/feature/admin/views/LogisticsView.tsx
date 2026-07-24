import { useState } from "react";
import { MdAdd, MdSearch } from "react-icons/md";
import PageHeader from "@/core/components/common/PageHeader";
import { Button } from "@/core/components/ui";
import { usePageBreadcrumbs } from "@/core/hooks/usePageBreadcrumbs";
import { useTableFilters } from "@/core/hooks/useTableFilters";
import type { Logistic, LogisticFilters } from "../schemas/logistic";
import { useLogisticsQuery } from "../services/logisticServices";
import { LogisticFormDrawer } from "../components/logistics/LogisticFormDrawer";
import LogisticsTable from "../components/logistics/LogisticsTable";

export default function LogisticsView() {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [selectedLogistic, setSelectedLogistic] = useState<Logistic | null>(
    null
  );

  usePageBreadcrumbs([{ label: "Logística" }]);

  const {
    page,
    perPage,
    filters,
    appliedFilters,
    setFilter,
    setPage,
    setPerPage,
  } = useTableFilters<LogisticFilters>(10);

  const { data, isLoading, isPlaceholderData } = useLogisticsQuery(
    page,
    perPage,
    appliedFilters
  );

  const handleEdit = (logistic: Logistic) => {
    setSelectedLogistic(logistic);
    setIsDrawerOpen(true);
  };

  const handleCreate = () => {
    setSelectedLogistic(null);
    setIsDrawerOpen(true);
  };

  return (
    <div>
      <PageHeader
        title="Logística"
        subtitle="Gestiona los perfiles del personal de logística y entregas."
      >
        <Button
          variant="primary"
          leftIcon={<MdAdd className="text-xl" />}
          className="shadow-sm rounded-lg"
          onClick={handleCreate}
        >
          Nuevo Perfil
        </Button>
      </PageHeader>

      <div className="mb-4 flex flex-col md:flex-row gap-4">
        <div className="relative flex-1 max-w-md">
          <MdSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-xl" />
          <input
            placeholder="Buscar por nombre, correo o teléfono..."
            value={filters.search || ""}
            onChange={(e) => setFilter("search", e.target.value)}
            className="w-full h-12 pl-11 pr-4 rounded-xl border border-gray-200 bg-gray-50 text-gray-900 text-sm font-medium placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
          />
        </div>
      </div>

      <LogisticsTable
        data={data?.items ?? []}
        isLoading={isLoading}
        isPlaceholderData={isPlaceholderData}
        meta={data?.meta}
        onPageChange={setPage}
        onPerPageChange={setPerPage}
        onEdit={handleEdit}
      />

      <LogisticFormDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        logisticToEdit={selectedLogistic}
      />
    </div>
  );
}
