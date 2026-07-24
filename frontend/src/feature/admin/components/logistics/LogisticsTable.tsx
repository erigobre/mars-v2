import { MdDelete, MdEdit, MdLocalShipping, MdPerson } from "react-icons/md";
import Swal from "sweetalert2";
import { DataTable } from "@/core/components/ui/DataTable";
import { Button } from "@/core/components/ui";
import type { DataTableColumn, PaginationMeta } from "@/core/types";
import type { Logistic } from "../../schemas/logistic";
import { useDeleteLogisticMutation } from "../../services/logisticServices";
import { formatDate } from "@/core/utils/formatDate";

type LogisticsTableProps = {
  data: Logistic[];
  isLoading: boolean;
  isPlaceholderData: boolean;
  meta?: PaginationMeta;
  onPageChange: (page: number) => void;
  onPerPageChange: (perPage: number) => void;
  onEdit: (logistic: Logistic) => void;
};

export default function LogisticsTable({
  data,
  isLoading,
  isPlaceholderData,
  meta,
  onPageChange,
  onPerPageChange,
  onEdit,
}: LogisticsTableProps) {
  const { mutate: deleteLogistic, isPending: isDeleting } =
    useDeleteLogisticMutation();

  const handleDeleteClick = (logistic: Logistic) => {
    Swal.fire({
      title: "¿Estás seguro?",
      text: `Vas a eliminar el perfil de logística "${logistic.username}". Esta acción no se puede deshacer.`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#64748b",
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
      reverseButtons: true,
    }).then((result) => {
      if (result.isConfirmed) deleteLogistic(logistic.id);
    });
  };

  const columns: DataTableColumn<Logistic>[] = [
    {
      label: "Usuario",
      primary: true,
      render: (logistic) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary/10 overflow-hidden flex items-center justify-center shrink-0 border border-primary/20">
            {logistic.avatarThumbnail ? (
              <img
                src={logistic.avatarThumbnail}
                alt={logistic.username}
                className="w-full h-full object-cover"
              />
            ) : (
              <MdPerson className="text-primary text-xl" />
            )}
          </div>
          <div>
            <p className="font-bold text-gray-900">{logistic.username}</p>
            {logistic.lastLoginAt && (
              <p className="text-xs text-gray-400">
                Último acceso: {formatDate(logistic.lastLoginAt)}
              </p>
            )}
          </div>
        </div>
      ),
    },
    {
      label: "Contacto",
      mobileHidden: true,
      render: (logistic) => (
        <div>
          <p className="text-sm font-medium text-gray-700">{logistic.email}</p>
          <p className="text-xs text-gray-400">{logistic.phone}</p>
        </div>
      ),
    },
    {
      label: "Estado",
      render: (logistic) =>
        logistic.isActive ? (
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
      render: (logistic) => (
        <div className="flex justify-end gap-2">
          <Button
            variant="ghost"
            className="w-9 h-9 p-0! flex items-center justify-center text-primary hover:bg-blue-50"
            onClick={() => onEdit(logistic)}
            title="Editar"
          >
            <MdEdit className="text-lg" />
          </Button>
          <Button
            variant="danger"
            className="w-9 h-9 p-0! flex items-center justify-center"
            onClick={() => handleDeleteClick(logistic)}
            title="Eliminar"
          >
            <MdDelete className="text-lg" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <DataTable<Logistic>
      title="Perfiles de Logística"
      titleIcon={<MdLocalShipping />}
      columns={columns}
      data={data}
      isLoading={isLoading || isDeleting}
      isPlaceholderData={isPlaceholderData}
      emptyMessage="No se encontraron perfiles de logística registrados."
      meta={meta}
      onPageChange={onPageChange}
      onPerPageChange={onPerPageChange}
      perPageOptions={[5, 10, 25, 50]}
    />
  );
}
