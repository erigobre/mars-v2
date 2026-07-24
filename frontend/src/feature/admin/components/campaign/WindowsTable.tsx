import Swal from "sweetalert2";
import { MdDelete, MdEdit, MdLockOpen, MdLockClock } from "react-icons/md";
import type { DataTableColumn } from "@/core/types";
import DataTable from "@/core/components/ui/DataTable/DataTable";
import type { RedemptionCycle, RedemptionWindow } from "../../schemas/campaign";
import { formatDateTime } from "@/core/utils/formatDate";
import { useDeleteWindowMutation } from "../../services/cycleServices";

type WindowsTableProps = {
  cycles: RedemptionCycle[];
  campaignId: number;
  onEdit: (
    window: RedemptionWindow,
    cycle: RedemptionCycle
  ) => void;
};

// Flat list with cycle context injected
type WindowRow = RedemptionWindow & { cycle: RedemptionCycle };

export function WindowsTable({
  cycles,
  campaignId,
  onEdit,
}: WindowsTableProps) {
  const { mutate: deleteWindow } = useDeleteWindowMutation(campaignId);

  const rows: WindowRow[] = cycles.flatMap((cycle) =>
    (cycle.windows ?? []).map((w) => ({ ...w, cycle }))
  );

  const handleDelete = (row: WindowRow) => {
    Swal.fire({
      title: "¿Eliminar ventana?",
      text: "Esta acción no se puede deshacer.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#64748b",
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
      reverseButtons: true,
    }).then((result) => {
      if (result.isConfirmed)
        deleteWindow({ cycleId: row.cycleId, windowId: row.id });
    });
  };

  const columns: DataTableColumn<WindowRow>[] = [
    {
      label: "Ciclo",
      render: (row) => (
        <span className="text-xs font-semibold text-primary bg-primary/10 px-2 py-1 rounded-full">
          {row.cycle.name}
        </span>
      ),
    },
    {
      label: "Apertura",
      render: (row) => (
        <span className="text-sm text-slate-700">
          {formatDateTime(row.opensAt)}
        </span>
      ),
    },
    {
      label: "Cierre",
      render: (row) => (
        <span className="text-sm text-slate-700">
          {formatDateTime(row.closesAt)}
        </span>
      ),
    },
    {
      label: "Estado",
      render: (row) =>
        row.isOpen ? (
          <span className="flex items-center gap-1 text-[10px] font-bold bg-orange-50 text-orange-500 px-2 py-1 rounded-full w-fit">
            <MdLockOpen className="text-sm" /> ABIERTA
          </span>
        ) : (
          <span className="flex items-center gap-1 text-[10px] font-bold bg-slate-100 text-slate-500 px-2 py-1 rounded-full w-fit">
            <MdLockClock className="text-sm" /> CERRADA
          </span>
        ),
    },
    {
      label: "",
      alignRight: true,
      render: (row) => (
        <div className="flex items-center justify-end gap-1">
          <button
            onClick={() => onEdit(row, row.cycle)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-primary hover:bg-blue-50 transition-colors"
            title="Editar ventana"
          >
            <MdEdit className="text-lg" />
          </button>
          <button
            onClick={() => handleDelete(row)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors"
            title="Eliminar ventana"
          >
            <MdDelete className="text-lg" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <DataTable
      columns={columns}
      data={rows}
      emptyMessage="No hay ventanas de canje registradas."
    />
  );
}
