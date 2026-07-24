import { MdCardGiftcard, MdExpandMore, MdWarning } from "react-icons/md";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { DataTable } from "@/core/components/ui/DataTable";
import { Button } from "@/core/components/ui";
import type { DataTableColumn } from "@/core/types";
import type { Reward } from "../../../rewards/schemas/reward";
import { useDeleteRewardMutation } from "../../../rewards/services/rewardServices";
import { useState } from "react";
import TableActionsMenu from "@/core/components/common/TableActionsMenu";
import RewardExpandedRow from "./RewardExpandedRow";

type RewardsTableProps = {
  data: Reward[];
  isLoading: boolean;
  isPlaceholderData: boolean;
  meta?: any;
  onPageChange: (page: number) => void;
  onPerPageChange: (perPage: number) => void;
  onEdit: (reward: Reward) => void;
};

export default function RewardsTable({
  data,
  isLoading,
  isPlaceholderData,
  meta,
  onPageChange,
  onPerPageChange,
  onEdit,
}: RewardsTableProps) {
  const navigate = useNavigate();
  const [expandedIds, setExpandedIds] = useState<Set<number>>(new Set());

  const toggleExpand = (id: number) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const { mutate: deleteReward, isPending: isDeleting } =
    useDeleteRewardMutation();

  const handleDeleteClick = (reward: Reward) => {
    Swal.fire({
      title: "¿Estás seguro?",
      text: `Vas a eliminar el premio "${reward.name}". Esta acción no se puede deshacer.`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#64748b",
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
      reverseButtons: true,
    }).then((result) => {
      if (result.isConfirmed) deleteReward(reward.id);
    });
  };

  const columns: DataTableColumn<Reward>[] = [
    {
      label: "Imagen",
      mobileHidden: true,
      render: (reward) => (
        <div className="w-14 h-14 rounded-lg border border-gray-200 bg-gray-100 overflow-hidden shrink-0 flex items-center justify-center">
          {reward.imageThumb || reward.image ? (
            <img
              src={reward.imageThumb ?? reward.image ?? ""}
              alt={reward.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <MdCardGiftcard className="text-gray-400 text-2xl" />
          )}
        </div>
      ),
    },
    {
      label: "Nombre",
      primary: true,
      render: (reward) => (
        <div>
          <p className="font-bold text-gray-900">{reward.name}</p>
          {reward.category && (
            <p className="text-xs text-gray-400 font-medium mt-0.5">
              {reward.category}
            </p>
          )}
          {reward.isFeatured && (
            <span className="text-[10px] font-black bg-amber-50 px-2 py-1 rounded-2xl text-amber-500 uppercase tracking-tighter">
              Destacado
            </span>
          )}
        </div>
      ),
    },
    {
      label: "Puntos",
      render: (reward) => (
        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-bold bg-primary/10 text-primary">
          {reward.pointsRequired.toLocaleString()} pts
        </span>
      ),
    },
    {
      label: "Stock",
      render: (reward) => {
        const stock = reward.stock ?? 0;
        if (stock === 0) {
          return (
            <div className="flex items-center gap-1 text-red-500 font-semibold text-sm">
              <MdWarning className="text-base" />0 u.
            </div>
          );
        }
        return (
          <span className="text-gray-700 font-semibold text-sm text-nowrap">
            {stock} u.
          </span>
        );
      },
    },
    {
      label: "Canjes",
      render: (reward) => (
        <div className="flex flex-col">
          <span className="text-gray-900 font-bold text-sm">
            {reward.totalClaimed ?? 0}
          </span>
        </div>
      ),
    },
    {
      label: "Estado",
      render: (reward) =>
        reward.isActive ? (
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
      render: (reward) => {
        const isExpanded = expandedIds.has(reward.id);

        return (
          <div className="flex items-center justify-end gap-1">
            {/* Botón 1: Chevron para expansión rápida (Precios por Rango) */}
            <Button
              variant={isExpanded ? "primary" : "ghost"}
              size="sm"
              className="w-8 h-8 p-0! flex items-center justify-center rounded-full"
              onClick={() => toggleExpand(reward.id)}
              title="Ver y gestionar precios por rango"
            >
              <MdExpandMore
                className={`text-xl transition-transform duration-300 ${
                  isExpanded ? "rotate-180" : ""
                }`}
              />
            </Button>

            {/* Botón 2: Menú flotante mapeando directamente las funciones soportadas */}
            <TableActionsMenu
              onView={() => navigate(String(reward.id))} // Asumiendo que esta es tu ruta de detalles
              onEdit={() => onEdit(reward)}
              onDelete={() => handleDeleteClick(reward)}
            />
          </div>
        );
      },
    },
  ];

  return (
    <DataTable<Reward>
      title="Catálogo de Premios"
      titleIcon={<MdCardGiftcard />}
      columns={columns}
      data={data}
      isLoading={isLoading || isDeleting}
      isPlaceholderData={isPlaceholderData}
      emptyMessage="No se encontraron premios registrados."
      meta={meta}
      onPageChange={onPageChange}
      onPerPageChange={onPerPageChange}
      perPageOptions={[5, 10, 25, 50]}
      // Esto hace que funcione la lógica del Chevron para mostrar la fila extra abajo
      renderExpandedRow={(reward) =>
        expandedIds.has(reward.id) ? (
          <RewardExpandedRow reward={reward} />
        ) : null
      }
    />
  );
}
