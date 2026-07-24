import { useState, useRef, useEffect } from "react";
import Swal from "sweetalert2";
import {
  MdAutoFixHigh,
  MdDelete,
  MdEdit,
  MdEmojiEvents,
  MdMoreVert,
  MdWindow,
} from "react-icons/md";
import type { RedemptionCycle } from "../../schemas/campaign";
import {
  useDeleteCycleMutation,
  useGenerateWindowsMutation,
} from "../../services/cycleServices";

type CycleActionsMenuProps = {
  cycle: RedemptionCycle;
  campaignId: number;
  onEditCycle: (cycle: RedemptionCycle) => void;
  onAddWindow: (cycle: RedemptionCycle) => void;
  onViewRanking: (cycle: RedemptionCycle) => void;
};

export function CycleActionsMenu({
  cycle,
  campaignId,
  onEditCycle,
  onAddWindow,
  onViewRanking,
}: CycleActionsMenuProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const { mutate: deleteCycle, isPending: isDeleting } =
    useDeleteCycleMutation(campaignId);
  const { mutate: generateWindows, isPending: isGenerating } =
    useGenerateWindowsMutation(campaignId, cycle.id);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node))
        setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleDelete = () => {
    setOpen(false);
    Swal.fire({
      title: "¿Eliminar ciclo?",
      text: `Se eliminará "${cycle.name}" y todas sus ventanas asociadas.`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#64748b",
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
      reverseButtons: true,
    }).then((r) => {
      if (r.isConfirmed) deleteCycle(cycle.id);
    });
  };

  const handleGenerate = (replace: boolean) => {
    setOpen(false);
    Swal.fire({
      title: replace ? "¿Regenerar ventanas?" : "¿Generar faltantes?",
      text: replace
        ? "Se borrarán las ventanas actuales para crear nuevas según la frecuencia."
        : "Se crearán solo las ventanas que faltan en el calendario.",
      icon: replace ? "warning" : "question",
      showCancelButton: true,
      confirmButtonText: replace ? "Sí, regenerar" : "Sí, generar",
      cancelButtonText: "Cancelar",
      reverseButtons: true,
    }).then((r) => {
      if (r.isConfirmed) generateWindows({ replace });
    });
  };

  const isBusy = isDeleting || isGenerating;

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        disabled={isBusy}
        className="p-2 rounded-xl text-slate-400 hover:text-primary hover:bg-slate-100 transition-all disabled:opacity-50"
      >
        {isBusy ? (
          <span className="w-5 h-5 border-2 border-primary/30 border-t-primary rounded-full animate-spin block" />
        ) : (
          <MdMoreVert className="text-xl" />
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-11 z-30 w-56 bg-white border border-slate-200 rounded-2xl shadow-xl py-2 overflow-hidden animate-in fade-in zoom-in-95 duration-100">
          <button
            onClick={() => {
              setOpen(false);
              onEditCycle(cycle);
            }}
            className="flex items-center gap-3 w-full px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
          >
            <MdEdit className="text-blue-500" size={18} /> Editar ciclo
          </button>

          <button
            onClick={() => {
              setOpen(false);
              onViewRanking(cycle);
            }}
            className="flex items-center gap-3 w-full px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
          >
            <MdEmojiEvents className="text-amber-500" size={18} /> Ver / Generar
            Ranking
          </button>

          <button
            onClick={() => {
              setOpen(false);
              onAddWindow(cycle);
            }}
            className="flex items-center gap-3 w-full px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
          >
            <MdWindow className="text-secondary" size={18} /> Ventana manual
          </button>

          <div className="h-px bg-slate-100 my-1 mx-2" />

          <button
            onClick={() => handleGenerate(false)}
            className="flex items-center gap-3 w-full px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
          >
            <MdAutoFixHigh className="text-indigo-400" size={18} /> Generar
            faltantes
          </button>

          <button
            onClick={() => handleGenerate(true)}
            className="flex items-center gap-3 w-full px-4 py-2.5 text-sm font-medium text-amber-600 hover:bg-amber-50 transition-colors"
          >
            <MdAutoFixHigh size={18} /> Regenerar todas
          </button>

          <div className="h-px bg-slate-100 my-1 mx-2" />

          <button
            onClick={handleDelete}
            className="flex items-center gap-3 w-full px-4 py-2.5 text-sm font-bold text-red-500 hover:bg-red-50 transition-colors"
          >
            <MdDelete size={18} /> Eliminar ciclo
          </button>
        </div>
      )}
    </div>
  );
}
