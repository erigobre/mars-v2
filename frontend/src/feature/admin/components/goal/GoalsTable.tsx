import { MdDelete, MdEdit, MdEmojiEvents, MdVisibility } from "react-icons/md";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { DataTable } from "@/core/components/ui/DataTable";
import { Button } from "@/core/components/ui";
import type { DataTableColumn, PaginationMeta } from "@/core/types";
import { useDeleteGoalMutation } from "../../services/goalServices";
import type { AdminGoal } from "../../schemas/goal";
import { goalTypeLabels } from "@/core/schemas/goal";

type GoalsTableProps = {
  data: AdminGoal[];
  isLoading: boolean;
  isPlaceholderData: boolean;
  meta?: PaginationMeta;
  onPageChange: (page: number) => void;
  onPerPageChange: (perPage: number) => void;
  onEdit: (goal: AdminGoal) => void;
};

export default function GoalsTable({
  data,
  isLoading,
  isPlaceholderData,
  meta,
  onPageChange,
  onPerPageChange,
  onEdit,
}: GoalsTableProps) {
  const navigate = useNavigate();
  const { mutate: deleteGoal, isPending: isDeleting } = useDeleteGoalMutation();

  const handleDeleteClick = (goal: AdminGoal) => {
    Swal.fire({
      title: "¿Estás seguro?",
      text: `Vas a eliminar la meta "${goal.name}". Esta acción no se puede deshacer.`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#64748b",
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
      reverseButtons: true,
    }).then((result) => {
      if (result.isConfirmed) deleteGoal(goal.id);
    });
  };

  const columns: DataTableColumn<AdminGoal>[] = [
    {
      label: "Nombre de la Meta",
      primary: true,
      render: (goal) => (
        <div>
          <p className="font-bold text-gray-900">{goal.name}</p>
          {goal.cycle && (
            <p className="text-xs text-gray-400 font-medium mt-0.5">
              {goal.cycle.name}
            </p>
          )}
        </div>
      ),
    },
    {
      label: "Tipo",
      render: (goal) => (
        <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-bold bg-blue-50 text-primary border border-blue-100">
          {goalTypeLabels[goal.type]}
        </span>
      ),
    },
    {
      label: "Objetivo",
      mobileHidden: true,
      render: (goal) => (
        <span className="text-sm font-semibold text-gray-700">
          {goal.type === "TOTAL_SALES_AMOUNT"
            ? `$${goal.targetValue.toLocaleString()}`
            : `${goal.targetValue.toLocaleString()} u.`}
        </span>
      ),
    },
    {
      label: "Recompensa",
      render: (goal) => (
        <div className="flex items-center gap-1.5">
          <MdEmojiEvents className="text-amber-500 text-base" />
          <span className="text-sm font-bold text-gray-800">
            {goal.rewardPoints.toLocaleString()} pts
          </span>
        </div>
      ),
    },
    {
      label: "Progreso",
      mobileHidden: true,
      render: (goal) => (
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-500">
            {goal.progressesCount ?? 0} vendedor
            {(goal.progressesCount ?? 0) !== 1 ? "es" : ""}
          </span>
          {goal.reachedCount != null && goal.reachedCount > 0 && (
            <span className="text-xs font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded-full">
              {goal.reachedCount} completado{goal.reachedCount !== 1 ? "s" : ""}
            </span>
          )}
        </div>
      ),
    },
    {
      label: "Estado",
      render: (goal) =>
        goal.isActive ? (
          <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-bold bg-emerald-100 text-emerald-700 uppercase">
            Activa
          </span>
        ) : (
          <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-bold bg-gray-200 text-gray-600 uppercase">
            Inactiva
          </span>
        ),
    },
    {
      label: "Acciones",
      alignRight: true,
      render: (goal) => (
        <div className="flex justify-end gap-2">
          <Button
            variant="ghost"
            className="w-9 h-9 p-0! flex items-center justify-center text-gray-500 hover:text-primary hover:bg-blue-50"
            onClick={() => navigate(`${goal.id}`)}
            title="Ver Detalles"
          >
            <MdVisibility className="text-lg" />
          </Button>
          <Button
            variant="ghost"
            className="w-9 h-9 p-0! flex items-center justify-center text-primary hover:bg-blue-50"
            onClick={() => onEdit(goal)}
            title="Editar"
          >
            <MdEdit className="text-lg" />
          </Button>
          <Button
            variant="danger"
            className="w-9 h-9 p-0! flex items-center justify-center"
            onClick={() => handleDeleteClick(goal)}
            title="Eliminar"
          >
            <MdDelete className="text-lg" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <DataTable<AdminGoal>
      title="Metas Activas"
      titleIcon={<MdEmojiEvents />}
      columns={columns}
      data={data}
      isLoading={isLoading || isDeleting}
      isPlaceholderData={isPlaceholderData}
      emptyMessage="No se encontraron metas registradas."
      meta={meta}
      onPageChange={onPageChange}
      onPerPageChange={onPerPageChange}
      perPageOptions={[10, 25, 50, 100]}
    />
  );
}
