import { useNavigate, useSearchParams } from "react-router-dom";
import { MdAdd, MdCloudUpload, MdSearch } from "react-icons/md";
import { useTableFilters } from "@/core/hooks/useTableFilters";
import { Button, Input, Select } from "@/core/components/ui";
import PageHeader from "@/core/components/common/PageHeader";
import SalesTable from "../components/SalesTable";
import BulkSaleFormDrawer from "../components/BulkSaleFormDrawer";
import { useSalesQuery } from "../services/salesServices";
import { useDistributorsQuery } from "@/feature/admin/services/distributorServices";
import { useAuthStore } from "@/core/stores/authStore";
import type { Sale } from "../schemas/sale";
import { useEffect, useState } from "react";

type SaleFilters = {
  search: string;
  distributorId?: string;
};

export default function SalesView() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const user = useAuthStore((state) => state.user);
  const isAdmin = user?.role === "admin" || user?.role === "logistics";

  const {
    page,
    perPage,
    filters,
    appliedFilters,
    setFilter,
    setPage,
    setPerPage,
  } = useTableFilters<SaleFilters>(10);

  const parsedDistributorId = appliedFilters.distributorId 
    ? Number(appliedFilters.distributorId) 
    : undefined;

  const { data, isLoading, isPlaceholderData } = useSalesQuery(
    page,
    perPage,
    appliedFilters.search || "",
    parsedDistributorId
  );

  const { data: distributorsData } = useDistributorsQuery(
    1,
    100,
    {},
    { enabled: isAdmin }
  );
  const distributors = distributorsData?.items || [];

  useEffect(() => {
    if (searchParams.has("sellerId")) {
      setIsDrawerOpen(true);
    }
  }, [searchParams]);

  const handleViewDetails = (sale: Sale) => {
    navigate(`${sale.id}`);
  };

  const handleCloseDrawer = () => {
    setIsDrawerOpen(false);
    
    if (searchParams.has("sellerId") || searchParams.has("distributorId")) {
      const newParams = new URLSearchParams(searchParams);
      newParams.delete("sellerId");
      newParams.delete("distributorId");
      setSearchParams(newParams, { replace: true }); 
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Gestión de Ventas"
        subtitle="Administra y registra las ventas de tus distribuidores y vendedores"
      />

      <div className="bg-white border border-gray-200 rounded-xl p-4">
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto flex-1">
            <div className="w-full md:w-96">
              <Input
                placeholder="Buscar por folio, vendedor..."
                leftIcon={<MdSearch />}
                value={filters.search || ""}
                onChange={(e) => setFilter("search", e.target.value)}
                className="bg-gray-50"
              />
            </div>
            
            {isAdmin && (
              <div className="w-full md:w-64">
                <Select
                  value={filters.distributorId || ""}
                  onChange={(e) => setFilter("distributorId", e.target.value)}
                  options={[
                    { value: "", label: "Todos los distribuidores" },
                    ...distributors.map((d) => ({
                      value: d.id.toString(),
                      label: d.companyName || d.username,
                    })),
                  ]}
                  className="bg-gray-50"
                />
              </div>
            )}
          </div>

          <div className="flex gap-3 w-full md:w-auto">
            <Button
              variant="ghost"
              onClick={() => navigate("upload")}
              className="flex-1 md:flex-initial"
            >
              <MdCloudUpload className="mr-2" />
              Cargar Archivo
            </Button>
            <Button
              onClick={() => setIsDrawerOpen(true)}
              className="flex-1 md:flex-initial"
            >
              <MdAdd className="mr-2" />
              Registrar Ventas
            </Button>
          </div>
        </div>
      </div>

      <SalesTable
        onViewDetails={handleViewDetails}
        data={data?.items || []}
        isLoading={isLoading}
        isPlaceholderData={isPlaceholderData}
        meta={data?.meta}
        onPageChange={setPage}
        onPerPageChange={setPerPage}
      />

      <BulkSaleFormDrawer
        isOpen={isDrawerOpen}
        onClose={handleCloseDrawer}
      />
    </div>
  );
}
