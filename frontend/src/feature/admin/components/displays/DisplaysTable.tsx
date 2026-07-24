import { MdDelete, MdEdit, MdViewModule } from "react-icons/md";
import Swal from "sweetalert2";
import { DataTable } from "@/core/components/ui/DataTable";
import { Button } from "@/core/components/ui";
import type { DataTableColumn, PaginationMeta } from "@/core/types";
import type { Display } from "../../schemas/display";
import { useDeleteDisplayMutation } from "../../services/displayServices";

type DisplaysTableProps = {
  data: Display[];
  isLoading: boolean;
  isPlaceholderData: boolean;
  meta?: PaginationMeta;
  onPageChange: (page: number) => void;
  onPerPageChange: (perPage: number) => void;
  onEdit: (display: Display) => void;
};

export default function DisplaysTable({
  data,
  isLoading,
  isPlaceholderData,
  meta,
  onPageChange,
  onPerPageChange,
  onEdit,
}: DisplaysTableProps) {
  const { mutate: deleteDisplay, isPending: isDeleting } =
    useDeleteDisplayMutation();

  const handleDeleteClick = (display: Display) => {
    Swal.fire({
      title: "¿Estás seguro?",
      text: `Vas a eliminar el display "${display.name}". Esta acción no se puede deshacer.`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#64748b",
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
      reverseButtons: true,
    }).then((result) => {
      if (result.isConfirmed) deleteDisplay(display.id!);
    });
  };

  const columns: DataTableColumn<Display>[] = [
    {
      label: "Nombre del Display",
      primary: true,
      render: (display) => (
        <div>
          <p className="font-bold text-gray-900">{display.name}</p>
          <p className="text-xs text-gray-400 font-mono mt-0.5">
            /{display.slug}
          </p>
        </div>
      ),
    },
    {
      label: "Puntos de Valor",
      render: (display) => (
        <span className="font-bold text-amber-500">
          {display.valuePoints.toLocaleString()} pts
        </span>
      ),
    },
    {
      label: "Productos",
      mobileHidden: true,
      render: (display) => (
        <span className="text-sm font-medium text-gray-600">
          {display.productsCount ?? 0} asignados
        </span>
      ),
    },
    {
      label: "Estado",
      render: (display) =>
        display.isActive ? (
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
      render: (display) => (
        <div className="flex justify-end gap-2">
          <Button
            variant="ghost"
            className="w-9 h-9 p-0! flex items-center justify-center text-primary hover:bg-blue-50"
            onClick={() => onEdit(display)}
            title="Editar"
          >
            <MdEdit className="text-lg" />
          </Button>
          <Button
            variant="danger"
            className="w-9 h-9 p-0! flex items-center justify-center"
            onClick={() => handleDeleteClick(display)}
            title="Eliminar"
          >
            <MdDelete className="text-lg" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <DataTable<Display>
      title="Gestión de Displays"
      titleIcon={<MdViewModule />}
      columns={columns}
      data={data}
      isLoading={isLoading || isDeleting}
      isPlaceholderData={isPlaceholderData}
      emptyMessage="No se encontraron displays registrados."
      meta={meta}
      onPageChange={onPageChange}
      onPerPageChange={onPerPageChange}
      perPageOptions={[5, 10, 25, 50]}
    />
  );
}
