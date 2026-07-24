import { useState } from "react";
import { MdAdd, MdSearch } from "react-icons/md";
import PageHeader from "@/core/components/common/PageHeader";
import { Button } from "@/core/components/ui";
import { usePageBreadcrumbs } from "@/core/hooks/usePageBreadcrumbs";
import { useTableFilters } from "@/core/hooks/useTableFilters";
import type { Display, DisplayFilters } from "../schemas/display";
import { useDisplaysQuery } from "../services/displayServices";
import DisplayFormDrawer from "../components/displays/DisplayFormDrawer";
import DisplaysTable from "../components/displays/DisplaysTable";

export default function DisplaysView() {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [selectedDisplay, setSelectedDisplay] = useState<Display | null>(null);

  usePageBreadcrumbs([{ label: "Displays" }]);

  const {
    page,
    perPage,
    filters,
    appliedFilters,
    setFilter,
    setPage,
    setPerPage,
  } = useTableFilters<DisplayFilters>(10);

  const { data, isLoading, isPlaceholderData } = useDisplaysQuery(
    page,
    perPage,
    appliedFilters
  );

  const handleEdit = (display: Display) => {
    setSelectedDisplay(display);
    setIsDrawerOpen(true);
  };

  const handleCreate = () => {
    setSelectedDisplay(null);
    setIsDrawerOpen(true);
  };

  return (
    <div>
      <PageHeader
        title="Displays"
        subtitle="Administra los displays y asiganción de puntos."
      >
        <Button
          variant="primary"
          leftIcon={<MdAdd className="text-xl" />}
          className="shadow-sm rounded-lg"
          onClick={handleCreate}
        >
          Nuevo Display
        </Button>
      </PageHeader>

      <div className="mb-4">
        <div className="relative max-w-md">
          <MdSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-xl" />
          <input
            placeholder="Buscar por nombre o slug..."
            value={filters.search || ""}
            onChange={(e) => setFilter("search", e.target.value)}
            className="w-full h-12 pl-11 pr-4 rounded-xl border border-gray-200 bg-gray-50 text-gray-900 text-sm font-medium placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
          />
        </div>
      </div>

      <DisplaysTable
        data={data?.items ?? []}
        isLoading={isLoading}
        isPlaceholderData={isPlaceholderData}
        meta={data?.meta}
        onPageChange={setPage}
        onPerPageChange={setPerPage}
        onEdit={handleEdit}
      />

      <DisplayFormDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        displayToEdit={selectedDisplay}
      />
    </div>
  );
}
