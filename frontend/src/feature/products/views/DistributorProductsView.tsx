import { useState } from "react";
import { MdAdd, MdSearch } from "react-icons/md";
import PageHeader from "@/core/components/common/PageHeader";
import { Button, Input } from "@/core/components/ui";
import { usePageBreadcrumbs } from "@/core/hooks/usePageBreadcrumbs";
import { useTableFilters } from "@/core/hooks/useTableFilters";
import {
  useDistributorProductsQuery,
  useCustomizedProductsQuery,
  useDeleteCustomizedProductMutation,
} from "../services/distributorProductServices";
import type { Product, ProductFilters } from "../schemas/product";
import DistributorProductsTable from "../components/DistributorProductsTable";
import ProductCustomizationDrawer from "../components/ProductCustomizationDrawer";
import ProductDetailsModal from "../components/ProductDetailsModal";

export default function DistributorProductsView() {
  usePageBreadcrumbs([{ label: "Mi Catálogo" }]);

  const [isCustomizationDrawerOpen, setIsCustomizationDrawerOpen] =
    useState(false);
  const [productToCustomize, setProductToCustomize] = useState<Product | null>(
    null
  );
  const [showCustomizedOnly, setShowCustomizedOnly] = useState(false);

  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [productToView, setProductToView] = useState<Product | null>(null);

  const {
    page,
    perPage,
    filters,
    appliedFilters,
    setFilter,
    setPage,
    setPerPage,
  } = useTableFilters<ProductFilters>(10);

  // Hook del Catálogo Maestro
  const masterQuery = useDistributorProductsQuery(
    page,
    perPage,
    appliedFilters,
    { enabled: !showCustomizedOnly }
  );

  // Hook de Productos Personalizados
  const customizedQuery = useCustomizedProductsQuery(
    page,
    perPage,
    appliedFilters,
    { enabled: showCustomizedOnly }
  );

  const { mutate: deleteCustomization, isPending: isDeleting } =
    useDeleteCustomizedProductMutation();

  // Decidimos qué datos pasarle a la tabla
  const activeQuery = showCustomizedOnly ? customizedQuery : masterQuery;
  const {
    data,
    isLoading: activeIsLoading,
    isPlaceholderData,
    isFetching: activeIsFetching,
  } = activeQuery;

  const handleCustomize = (product: Product) => {
    setProductToCustomize(product);
    setIsCustomizationDrawerOpen(true);
  };

  const handleNewCustomize = () => {
    setProductToCustomize(null);
    setIsCustomizationDrawerOpen(true);
  };

  const handleViewDetails = (product: Product) => {
    setProductToView(product);
    setIsDetailsModalOpen(true);
  };

  const handleReset = (product: Product) => {
    deleteCustomization(product.customization?.id!);
  };

  const handleTabChange = (showCustomized: boolean) => {
    if (showCustomizedOnly !== showCustomized) {
      setShowCustomizedOnly(showCustomized);
      setPage(1); // Resetear a página 1 al cambiar de vista
    }
  };

  const isLoading = activeIsLoading || activeIsFetching || isDeleting;

  return (
    <div className="space-y-6">
      <PageHeader
        title={showCustomizedOnly ? "Mis Productos" : "Catálogo Maestro"}
        subtitle={
          showCustomizedOnly
            ? "Gestiona los productos que ya has personalizado con tus precios."
            : "Explora el catálogo general y selecciona productos para personalizar."
        }
      >
        <Button
          variant="primary"
          leftIcon={<MdAdd className="text-xl" />}
          className="shadow-sm rounded-lg"
          onClick={handleNewCustomize}
        >
          Nuevo Producto
        </Button>
      </PageHeader>

      <div className="flex flex-col xl:flex-row gap-4 xl:items-center justify-between">
        <div className="flex-1 max-w-md w-full">
          <Input
            placeholder="Buscar en el catálogo..."
            leftIcon={<MdSearch />}
            value={filters.search || ""}
            onChange={(e) => setFilter("search", e.target.value)}
            className="bg-gray-50"
          />
        </div>

        {/* Custom Segmented Control (Tabs) */}
        <div className="flex p-1 bg-slate-100 rounded-xl w-full xl:w-auto overflow-hidden shrink-0">
          <button
            onClick={() => handleTabChange(false)}
            className={`flex-1 sm:px-6 py-2.5 rounded-lg text-sm transition-all whitespace-nowrap ${
              !showCustomizedOnly
                ? "bg-white shadow-sm text-primary font-bold"
                : "text-slate-500 font-medium hover:text-slate-700"
            }`}
          >
            Todos los Productos
          </button>

          <button
            onClick={() => handleTabChange(true)}
            className={`flex-1 sm:px-6 py-2.5 rounded-lg text-sm transition-all whitespace-nowrap ${
              showCustomizedOnly
                ? "bg-white shadow-sm text-primary font-bold"
                : "text-slate-500 font-medium hover:text-slate-700"
            }`}
          >
            Solo mis Personalizados
          </button>
        </div>
      </div>

      <DistributorProductsTable
        data={data?.items ?? []}
        isLoading={isLoading}
        isPlaceholderData={isPlaceholderData}
        meta={data?.meta}
        onPageChange={setPage}
        onPerPageChange={setPerPage}
        onCustomize={handleCustomize}
        onViewDetails={handleViewDetails}
        onReset={handleReset}
      />

      <ProductCustomizationDrawer
        isOpen={isCustomizationDrawerOpen}
        onClose={() => setIsCustomizationDrawerOpen(false)}
        productToCustomize={productToCustomize}
      />

      <ProductDetailsModal
        isOpen={isDetailsModalOpen}
        onClose={() => setIsDetailsModalOpen(false)}
        product={productToView}
        onCustomize={handleCustomize}
        onReset={handleReset}
      />
    </div>
  );
}
