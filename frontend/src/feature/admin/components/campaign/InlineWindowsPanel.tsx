import Swal from "sweetalert2";
import { MdDelete, MdEdit, MdLockClock, MdLockOpen } from "react-icons/md";
import type { RedemptionCycle, RedemptionWindow } from "../../schemas/campaign";
import { formatDateTime } from "@/core/utils/formatDate";
import { useDeleteWindowMutation } from "../../services/cycleServices";

type InlineWindowsPanelProps = {
  cycle: RedemptionCycle;
  campaignId: number;
  onEditWindow: (
    window: RedemptionWindow,
    cycle: RedemptionCycle
  ) => void;
};

export function InlineWindowsPanel({
  cycle,
  campaignId,
  onEditWindow,
}: InlineWindowsPanelProps) {
  const windows = cycle.windows ?? [];
  const { mutate: deleteWindow } = useDeleteWindowMutation(campaignId);

  const handleDelete = (w: RedemptionWindow) => {
    Swal.fire({
      title: "¿Eliminar ventana?",
      text: "Esta ventana de canje dejará de estar disponible para los vendedores.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
      reverseButtons: true,
    }).then((r) => {
      if (r.isConfirmed) deleteWindow({ cycleId: cycle.id, windowId: w.id });
    });
  };

  if (windows.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-6 text-slate-400">
        <MdLockClock size={32} className="opacity-20 mb-2" />
        <p className="text-xs italic">
          No hay ventanas. Usa el menú de acciones para generarlas.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      {windows.map((w) => (
        <div
          key={w.id}
          className="group flex items-center justify-between gap-3 bg-white border border-slate-200 rounded-xl px-4 py-3 hover:border-primary/30 hover:shadow-sm transition-all"
        >
          <div className="flex items-center gap-3 min-w-0">
            <div
              className={`p-2 rounded-lg shrink-0 ${
                w.isOpen
                  ? "bg-orange-50 text-orange-500"
                  : "bg-slate-50 text-slate-400"
              }`}
            >
              {w.isOpen ? <MdLockOpen size={18} /> : <MdLockClock size={18} />}
            </div>

            <div className="flex flex-col min-w-0">
              <span className="text-[11px] font-bold text-slate-700 truncate">
                {formatDateTime(w.opensAt)}
              </span>
              <span className="text-[10px] text-slate-400 font-medium">
                Cierre: {formatDateTime(w.closesAt)}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={() => onEditWindow(w, cycle)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-primary hover:bg-blue-50 transition-colors"
              title="Editar ventana"
            >
              <MdEdit size={16} />
            </button>
            <button
              onClick={() => handleDelete(w)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors"
              title="Eliminar ventana"
            >
              <MdDelete size={16} />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
