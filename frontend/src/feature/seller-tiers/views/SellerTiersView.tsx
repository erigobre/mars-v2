import { useState } from "react";
import { MdAdd, MdRefresh, MdTableChart } from "react-icons/md";
import { useNavigate } from "react-router-dom";
import PageHeader from "@/core/components/common/PageHeader";
import { Button, Select } from "@/core/components/ui";
import { usePageBreadcrumbs } from "@/core/hooks/usePageBreadcrumbs";
import { useTableFilters } from "@/core/hooks/useTableFilters";
import type { SellerTier, SellerTierFilters } from "../schemas/sellerTier";
import {
  useSellerTiersQuery,
  useRecalculateTiersMutation,
} from "../services/sellerTierServices";
import { useDistributorsQuery } from "@/feature/admin/services/distributorServices";
import SellerTiersTable from "../components/SellerTiersTable";
import SellerTierFormDrawer from "../components/SellerTierFormDrawer";

export default function SellerTiersView() {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [selectedTier, setSelectedTier] = useState<SellerTier | null>(null);
  const navigate = useNavigate();

  usePageBreadcrumbs([
    { label: "Vendedores", to: "/admin/sellers" },
    { label: "Rangos" },
  ]);

  const { page, perPage, filters, appliedFilters, setPage, setPerPage, setFilters } =
    useTableFilters<SellerTierFilters>(10);

  const { data, isLoading, isPlaceholderData } = useSellerTiersQuery(
    page,
    perPage,
    appliedFilters,
  );

  const { data: distributorsData } = useDistributorsQuery(1, 100, {});
  const distributorOptions = [
    { value: "", label: "Todos los distribuidores" },
    ...(distributorsData?.items ?? []).map((d) => ({
      value: String(d.id),
      label: d.companyName,
    })),
  ];

  const { mutate: recalculate, isPending: isRecalculating } =
    useRecalculateTiersMutation();

  const handleEdit = (tier: SellerTier) => {
    setSelectedTier(tier);
    setIsDrawerOpen(true);
  };

  const handleCreate = () => {
    setSelectedTier(null);
    setIsDrawerOpen(true);
  };

  const handleDistributorChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFilters({ ...filters, distributor_id: e.target.value });
  };

  return (
    <div>
      <PageHeader
        title="Rangos de Vendedores"
        subtitle="Gestiona los niveles, metas requeridas y recalcula posiciones."
      >
        <div className="flex items-center gap-3">
          <div className="min-w-64">
            <Select
              options={distributorOptions}
              value={filters.distributor_id ?? ""}
              onChange={handleDistributorChange}
              className="!py-2 !text-sm"
            />
          </div>
          {filters.distributor_id && (
            <Button
              variant="ghost"
              leftIcon={<MdTableChart className="text-xl" />}
              className="shadow-sm rounded-lg border border-slate-200"
              onClick={() => navigate(`/admin/sellers/tiers/matrix?distributorId=${filters.distributor_id}`)}
            >
              Matriz de Precios
            </Button>
          )}
          <Button
            variant="ghost"
            leftIcon={<MdRefresh className="text-xl" />}
            className="shadow-sm rounded-lg border border-slate-200"
            onClick={() => recalculate()}
            loading={isRecalculating}
          >
            Recalcular
          </Button>
          <Button
            variant="primary"
            leftIcon={<MdAdd className="text-xl" />}
            className="shadow-sm rounded-lg"
            onClick={handleCreate}
          >
            Nuevo Rango
          </Button>
        </div>
      </PageHeader>

      <SellerTiersTable
        data={data?.items ?? []}
        isLoading={isLoading}
        isPlaceholderData={isPlaceholderData}
        meta={data?.meta}
        onPageChange={setPage}
        onPerPageChange={setPerPage}
        onEdit={handleEdit}
      />

      <SellerTierFormDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        tierToEdit={selectedTier}
        defaultDistributorId={filters.distributor_id}
      />
    </div>
  );
}
