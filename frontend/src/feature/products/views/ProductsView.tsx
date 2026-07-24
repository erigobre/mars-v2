import { useState } from "react";
import { MdAdd, MdSearch } from "react-icons/md";
import PageHeader from "@/core/components/common/PageHeader";
import { Button } from "@/core/components/ui";
import { usePageBreadcrumbs } from "@/core/hooks/usePageBreadcrumbs";
import ProductFormDrawer from "@/feature/products/components/ProductFormDrawer";
import ProductsTable from "@/feature/products/components/ProductsTable";
import type {
  Product,
  ProductFilters,
} from "@/feature/products/schemas/product";
import { useProductsQuery } from "@/feature/products/services/productServices";
import { useTableFilters } from "@/core/hooks/useTableFilters";

export default function ProductsView() {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  usePageBreadcrumbs([{ label: "Productos" }]);

  const {
    page,
    perPage,
    filters,
    appliedFilters,
    setFilter,
    setPage,
    setPerPage,
  } = useTableFilters<ProductFilters>(10);

  const { data, isLoading: isLoadingProducts , isPlaceholderData, isFetching: isFetchingProducts } = useProductsQuery(
    page,
    perPage,
    appliedFilters
  );

  const handleEdit = (product: Product) => {
    setSelectedProduct(product);
    setIsDrawerOpen(true);
  };

  const handleCreate = () => {
    setSelectedProduct(null);
    setIsDrawerOpen(true);
  };

  // Derive unique categories from current data for the filter
  const categories = Array.from(
    new Set(
      (data?.items ?? []).map((p) => p.category).filter((c): c is string => !!c)
    )
  );

  const isLoading = isLoadingProducts || isFetchingProducts;

  return (
    <div>
      <PageHeader
        title="Productos"
        subtitle="Gestiona el catálogo de productos del sistema."
      >
        <Button
          variant="primary"
          leftIcon={<MdAdd className="text-xl" />}
          className="shadow-sm rounded-lg"
          onClick={handleCreate}
        >
          Nuevo Producto
        </Button>
      </PageHeader>

      {/* Filters */}
      <div className="flex gap-3 mb-4 flex-wrap">
        <div className="relative flex-1 min-w-52 max-w-md">
          <MdSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-xl" />
          <input
            placeholder="Buscar por nombre o SKU..."
            value={filters.search || ""}
            onChange={(e) => setFilter("search", e.target.value)}
            className="w-full h-12 pl-11 pr-4 rounded-xl border border-gray-200 bg-gray-50 text-gray-900 text-sm font-medium placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
          />
        </div>

        {categories.length > 0 && (
          <select
            className="h-12 px-4 rounded-xl border border-gray-200 bg-white text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary/20"
            value={filters.category || ""}
            onChange={(e) => setFilter("category", e.target.value)}
          >
            <option value="">Todas las categorías</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        )}
      </div>

      <ProductsTable
        data={data?.items ?? []}
        isLoading={isLoading}
        isPlaceholderData={isPlaceholderData}
        meta={data?.meta}
        onPageChange={setPage}
        onPerPageChange={(pp) => {
          setPerPage(pp);
          setPage(1);
        }}
        onEdit={handleEdit}
      />

      <ProductFormDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        productToEdit={selectedProduct}
      />
    </div>
  );
}
