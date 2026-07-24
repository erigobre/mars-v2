import {
  MdEdit,
  MdImage,
  MdInventory,
  MdVisibility,
  MdRestore,
} from "react-icons/md";
import Swal from "sweetalert2";
import { DataTable } from "@/core/components/ui/DataTable";
import { Button } from "@/core/components/ui";
import type { DataTableColumn, PaginationMeta } from "@/core/types";
import type { Product } from "../schemas/product";
import { formatCurrency } from "@/core/utils/formatDate";

type DistributorProductsTableProps = {
  data: Product[];
  isLoading: boolean;
  isPlaceholderData: boolean;
  meta?: PaginationMeta;
  onPageChange: (page: number) => void;
  onPerPageChange: (perPage: number) => void;
  onCustomize: (product: Product) => void;
  onViewDetails: (product: Product) => void;
  onReset?: (product: Product) => void; // Función para llamar a tu API de restablecer
};

export default function DistributorProductsTable({
  data,
  isLoading,
  isPlaceholderData,
  meta,
  onPageChange,
  onPerPageChange,
  onCustomize,
  onViewDetails,
  onReset,
}: DistributorProductsTableProps) {

  const checkIsCustomized = (product: Product) => {
    return product.isCustomized ?? false;
  };

  const columns: DataTableColumn<Product>[] = [
    {
      label: "Imagen",
      mobileHidden: true,
      render: (product) => (
        <div className="w-14 h-14 rounded-lg border border-gray-200 bg-gray-50 overflow-hidden flex items-center justify-center shrink-0">
          {product.imageThumb || product.image ? (
            <img
              src={product.imageThumb ?? product.image ?? ""}
              alt={product.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <MdImage className="text-gray-300 text-2xl" />
          )}
        </div>
      ),
    },
    {
      label: "Producto",
      primary: true,
      render: (product) => (
        <div>
          <p className="font-bold text-gray-900">{product.name}</p>
          <p className="text-xs text-gray-400 font-mono mt-0.5">
            {product.sku}
          </p>
        </div>
      ),
    },
    {
      label: "Tipo",
      render: (product) => {
        const isCustomized = checkIsCustomized(product);
        return isCustomized ? (
          <span className="inline-flex items-center px-3 py-1 rounded-lg text-xs font-bold bg-emerald-100 text-emerald-700 uppercase border border-emerald-200 shadow-sm">
            Personalizado
          </span>
        ) : (
          <span className="inline-flex items-center px-3 py-1 rounded-lg text-xs font-bold bg-slate-100 text-slate-600 uppercase border border-slate-200 shadow-sm">
            Catálogo Maestro
          </span>
        );
      },
    },
    {
      label: "SKU",
      primary: true,
      render: (product) => (
        <div>
          <p className="text-sm text-nowrap text-gray-600 font-mono mt-0.5">
            {product.isCustomized ? product.customization?.customSku : product.sku}
          </p>
        </div>
      ),
    },
    {
      label: "Display",
      mobileHidden: true,
      render: (product) => (
        <span className="text-xs font-semibold bg-primary/20 text-primary px-2 py-1 rounded-lg">
          {product.display?.name ?
            <span className="text-nowrap">{product.display.name}, {product.display.valuePoints} pts</span>
          : (
            <span className="text-gray-300 italic">—</span>
          )}
        </span>
      ),
    },
    {
      label: "Precio",
      render: (product) => {
        // const price = product.isCustomized ? product.customization?.customPrice : product.defaultPrice ?? 0;
        // Si esta customizado
        const price = product.isCustomized ?
          product.customization?.customPrice ?? 0 :
          product.price ?? 0;
        return (
          <span className="font-bold text-sm text-gray-800">
            {formatCurrency(price)}
          </span>
        );
      },
    },
    {
      label: "Unidad",
      mobileHidden: true,
      render: (product) => (
        <span className="text-xs font-medium text-gray-600 bg-gray-100 px-2 py-1 rounded">
          {product.customUnitType ?? product.unitType}
        </span>
      ),
    },
    {
      label: "Estado",
      render: (product) =>
        product.isActive ? (
          <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-bold bg-emerald-100 text-emerald-700 uppercase">
            Activo
          </span>
        ) : (
          <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-bold bg-gray-200 text-gray-600 uppercase">
            Inactivo
          </span>
        ),
    },
    {
      label: "Acciones",
      alignRight: true,
      render: (product) => {
        const isCustomized = checkIsCustomized(product);

        return (
          <div className="flex justify-end gap-1 sm:gap-2">
            <Button
              variant="ghost"
              className="w-9 h-9 p-0! flex items-center justify-center text-gray-500 hover:bg-gray-100"
              onClick={() => onViewDetails(product)}
              title="Ver detalles"
            >
              <MdVisibility className="text-xl" />
            </Button>

            <Button
              variant="ghost"
              className="w-9 h-9 p-0! flex items-center justify-center text-primary hover:bg-blue-50"
              onClick={() => onCustomize(product)}
              title={isCustomized ? "Editar valores" : "Personalizar"}
            >
              <MdEdit className="text-xl" />
            </Button>

            {isCustomized && onReset && (
              <Button
                variant="danger"
                className="w-9 h-9 p-0! flex items-center justify-center border-none shadow-none"
                title="Restablecer al original"
                onClick={() => {
                  Swal.fire({
                    title: "¿Restablecer producto?",
                    text: "Se eliminarán tus precios y puntos personalizados, volviendo a los valores del catálogo maestro. Esta acción no se puede deshacer.",
                    icon: "warning",
                    showCancelButton: true,
                    confirmButtonColor: "#ef4444",
                    cancelButtonColor: "#64748b",
                    confirmButtonText: "Sí, restablecer",
                    cancelButtonText: "Cancelar",
                    reverseButtons: true,
                  }).then((result) => {
                    if (result.isConfirmed) onReset(product);
                  });
                }}
              >
                <MdRestore className="text-xl" />
              </Button>
            )}
          </div>
        );
      },
    },
  ];

  return (
    <DataTable<Product>
      title="Catálogo"
      titleIcon={<MdInventory />}
      columns={columns}
      data={data}
      isLoading={isLoading}
      isPlaceholderData={isPlaceholderData}
      emptyMessage="No se encontraron productos en el catálogo."
      meta={meta}
      onPageChange={onPageChange}
      onPerPageChange={onPerPageChange}
      perPageOptions={[5, 10, 25, 50]}
    />
  );
}
