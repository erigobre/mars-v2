import { useState } from "react";
import { MdAdd, MdSearch } from "react-icons/md";
import PageHeader from "@/core/components/common/PageHeader";
import { Button } from "@/core/components/ui";
import { usePageBreadcrumbs } from "@/core/hooks/usePageBreadcrumbs";
import DistributorFormDrawer from "../components/distributor/DistributorFormDrawer";
import DistributorsTable from "../components/distributor/DistributorTable";
import type { Distributor, DistributorFilters } from "../schemas/distributor";
import { useDistributorsQuery } from "../services/distributorServices";
import { useTableFilters } from "@/core/hooks/useTableFilters";

export default function DistributorsView() {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [selectedDistributor, setSelectedDistributor] =
    useState<Distributor | null>(null);

  usePageBreadcrumbs([{ label: "Distribuidores" }]);

  const {
    page,
    perPage,
    filters,
    appliedFilters,
    setFilter,
    setPage,
    setPerPage,
  } = useTableFilters<DistributorFilters>(10);

  const { data, isLoading, isPlaceholderData } = useDistributorsQuery(
    page,
    perPage,
    appliedFilters
  );

  const handleEdit = (distributor: Distributor) => {
    setSelectedDistributor(distributor);
    setIsDrawerOpen(true);
  };

  const handleCreate = () => {
    setSelectedDistributor(null);
    setIsDrawerOpen(true);
  };

  return (
    <div>
      <PageHeader
        title="Distribuidores"
        subtitle="Gestiona los distribuidores y sus cuentas."
      >
        <Button
          variant="primary"
          leftIcon={<MdAdd className="text-xl" />}
          className="shadow-sm rounded-lg"
          onClick={handleCreate}
        >
          Nuevo Distribuidor
        </Button>
      </PageHeader>

      <div className="mb-4">
        <div className="relative max-w-md">
          <MdSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-xl" />
          <input
            placeholder="Buscar por nombre o empresa..."
            value={filters.search || ""}
            onChange={(e) => setFilter("search", e.target.value)}
            className="w-full h-12 pl-11 pr-4 rounded-xl border border-gray-200 bg-gray-50 text-gray-900 text-sm font-medium placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
          />
        </div>
      </div>

      <DistributorsTable
        data={data?.items ?? []}
        isLoading={isLoading}
        isPlaceholderData={isPlaceholderData}
        meta={data?.meta}
        onPageChange={setPage}
        onPerPageChange={setPerPage}
        onEdit={handleEdit}
      />

      <DistributorFormDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        distributorToEdit={selectedDistributor}
      />
    </div>
  );
}
