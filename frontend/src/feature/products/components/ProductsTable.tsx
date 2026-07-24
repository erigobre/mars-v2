import { MdDelete, MdEdit, MdImage, MdInventory } from "react-icons/md";
import Swal from "sweetalert2";
import { DataTable } from "@/core/components/ui/DataTable";
import { Button } from "@/core/components/ui";
import type { DataTableColumn, PaginationMeta } from "@/core/types";
import { formatCurrency } from "@/core/utils/formatDate";
import type { Product } from "../schemas/product";
import { useDeleteProductMutation } from "../services/productServices";

type ProductsTableProps = {
  data: Product[];
  isLoading: boolean;
  isPlaceholderData: boolean;
  meta?: PaginationMeta;
  onPageChange: (page: number) => void;
  onPerPageChange: (perPage: number) => void;
  onEdit: (product: Product) => void;
};

export default function ProductsTable({
  data,
  isLoading,
  isPlaceholderData,
  meta,
  onPageChange,
  onPerPageChange,
  onEdit,
}: ProductsTableProps) {
  const { mutate: deleteProduct, isPending: isDeleting } =
    useDeleteProductMutation();

  const handleDeleteClick = (product: Product) => {
    Swal.fire({
      title: "¿Estás seguro?",
      text: `Vas a eliminar el producto "${product.name}". Esta acción no se puede deshacer.`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#64748b",
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
      reverseButtons: true,
    }).then((result) => {
      if (result.isConfirmed) deleteProduct(product.id);
    });
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
          {product.category && (
            <p className="text-xs text-primary font-medium mt-0.5">
              {product.category}
            </p>
          )}
        </div>
      ),
    },
    {
      label: "Display",
      mobileHidden: true,
      render: (product) => (
        <span className="text-sm text-gray-600">
          {product.display?.name ?? (
            <span className="text-gray-300 italic">—</span>
          )}
        </span>
      ),
    },
    {
      label: "Precio",
      render: (product) => {
        const price = product.price ?? product.defaultPrice ?? 0;
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
        <span className="text-xs font-medium text-gray-600 bg-gray-100 px-2 py-1 rounded uppercase">
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
      render: (product) => (
        <div className="flex justify-end gap-2">
          <Button
            variant="ghost"
            className="w-9 h-9 p-0! flex items-center justify-center text-primary hover:bg-blue-50"
            onClick={() => onEdit(product)}
            title="Editar"
          >
            <MdEdit className="text-lg" />
          </Button>
          <Button
            variant="danger"
            className="w-9 h-9 p-0! flex items-center justify-center"
            onClick={() => handleDeleteClick(product)}
            title="Eliminar"
          >
            <MdDelete className="text-lg" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <DataTable<Product>
      title="Productos"
      titleIcon={<MdInventory />}
      columns={columns}
      data={data}
      isLoading={isLoading || isDeleting}
      isPlaceholderData={isPlaceholderData}
      emptyMessage="No se encontraron productos registrados."
      meta={meta}
      onPageChange={onPageChange}
      onPerPageChange={onPerPageChange}
      perPageOptions={[5, 10, 25, 50]}
    />
  );
}
