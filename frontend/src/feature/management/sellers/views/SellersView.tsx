import { useEffect, useState } from "react";
import { MdAdd, MdSearch } from "react-icons/md";
import PageHeader from "@/core/components/common/PageHeader";
import { Button, Input, Select } from "@/core/components/ui";
import { usePageBreadcrumbs } from "@/core/hooks/usePageBreadcrumbs";
import { useTableFilters } from "@/core/hooks/useTableFilters";
import SellerFormDrawer from "@/feature/management/sellers/components/SellerFormDrawer";
import SellersTable from "@/feature/management/sellers/components/SellersTable";
import { useSellersQuery } from "@/feature/management/sellers/services/sellerServices";
import { useDistributorsQuery } from "../../../admin/services/distributorServices";
import type {
  Seller,
  SellerFilters,
} from "@/feature/management/sellers/schemas/seller";
import { useAuthStore } from "@/core/stores/authStore";
import { useNavigate } from "react-router-dom";

export default function SellersView() {
  const navigate = useNavigate();

  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const [selectedSeller, setSelectedSeller] = useState<Seller | null>(null);
  const user = useAuthStore((state) => state.user);
  const isAdmin = user?.role === "admin";

  usePageBreadcrumbs([{ label: "Vendedores" }]);

  const {
    page,
    perPage,
    filters,
    appliedFilters,
    setFilter,
    setPage,
    setPerPage,
  } = useTableFilters<SellerFilters>(10);

  useEffect(() => {
    if (!isAdmin && user?.id && !filters.distributorId) {
      setFilter("distributorId", user.id);
    }
  }, [isAdmin, user, filters.distributorId, setFilter]);

  const {
    data,
    isLoading: isQueryLoading,
    isPlaceholderData,
    isFetching: isQueryFetching,
  } = useSellersQuery(page, perPage, appliedFilters);

  const { data: distributorsData } = useDistributorsQuery(
    1,
    100,
    {},
    { enabled: isAdmin },
  );

  const handleEdit = (seller: Seller) => {
    setSelectedSeller(seller);
    setIsDrawerOpen(true);
  };

  const handleCreate = () => {
    setSelectedSeller(null);
    setIsDrawerOpen(true);
  };

  const handleView = (seller: Seller) => {
    navigate(`${seller.id}`);
  };

  const handleAssignSale = (seller: Seller) => {
    navigate(`/${user?.role}/sales?sellerId=${seller.id}&distributorId=${seller.distributor?.id}`)
  };

  const isLoading = isQueryLoading || isQueryFetching;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Vendedores"
        subtitle="Gestiona los vendedores y sus asignaciones."
      >
        <Button
          variant="primary"
          leftIcon={<MdAdd className="text-xl" />}
          onClick={handleCreate}
        >
          Nuevo Vendedor
        </Button>
      </PageHeader>

      {/* Barra de Filtros */}
      <div className="flex flex-col md:flex-row gap-4">
        {/* Búsqueda por Nombre o Código */}
        <div className="flex-1 max-w-md">
          <Input
            placeholder="Buscar por nombre o código..."
            leftIcon={<MdSearch />}
            value={filters.search || ""}
            onChange={(e) => setFilter("search", e.target.value)}
            className="bg-gray-50"
          />
        </div>

        {isAdmin && (
          <div className="w-64">
            <Select
              value={filters.distributorId || ""}
              onChange={(e) =>
                setFilter(
                  "distributorId",
                  e.target.value ? Number(e.target.value) : undefined,
                )
              }
              options={[
                { value: "", label: "Todos los distribuidores" },
                ...(distributorsData?.items ?? []).map((d) => ({
                  value: d.id,
                  label: d.companyName,
                })),
              ]}
            />
          </div>
        )}
      </div>

      <SellersTable
        data={data?.items ?? []}
        isLoading={isLoading}
        isPlaceholderData={isPlaceholderData}
        meta={data?.meta}
        onPageChange={setPage}
        onPerPageChange={setPerPage}
        onEdit={handleEdit}
        onView={handleView}
        onAssignSale={handleAssignSale}
      />

      <SellerFormDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        sellerToEdit={selectedSeller}
      />
    </div>
  );
}
