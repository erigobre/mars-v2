import { useState } from "react";
import {
  MdAdd,
  MdCalendarMonth,
  MdChevronRight,
  MdWindow,
} from "react-icons/md";
import type { RedemptionCycle, RedemptionWindow } from "../../schemas/campaign";
import { formatDate } from "@/core/utils/formatDate";
import { Button } from "@/core/components/ui";

import { CycleActionsMenu } from "./CycleActionsMenu";
import { InlineWindowsPanel } from "./InlineWindowsPanel";

type CyclesTableProps = {
  cycles: RedemptionCycle[];
  campaignId: number;
  onAddCycle: () => void;
  onEditCycle: (cycle: RedemptionCycle) => void;
  onAddWindow: (cycle: RedemptionCycle) => void;
  onEditWindow: (window: RedemptionWindow, cycle: RedemptionCycle) => void;
  onViewRanking: (cycle: RedemptionCycle) => void;
};

export function CyclesTable({
  cycles,
  campaignId,
  onAddCycle,
  onEditCycle,
  onAddWindow,
  onEditWindow,
  onViewRanking,
}: CyclesTableProps) {
  const [expandedId, setExpandedId] = useState<number | null>(null);

  const toggle = (id: number) =>
    setExpandedId((prev) => (prev === id ? null : id));

  return (
    <div className="flex flex-col">
      <div className="flex items-center justify-between px-6 py-4 bg-slate-50/50 border-b border-slate-100">
        <div>
          <h3 className="text-sm font-bold text-slate-800">
            Ciclos de Redención
          </h3>
          <p className="text-xs text-slate-500">
            Gestiona los periodos y ventanas de canje
          </p>
        </div>
        <Button
          size="sm"
          variant="primary"
          onClick={onAddCycle}
          leftIcon={<MdAdd className="text-lg" />}
        >
          Nuevo Ciclo
        </Button>
      </div>

      <div className="divide-y divide-slate-100">
        {cycles.map((cycle) => {
          const isExpanded = expandedId === cycle.id;

          return (
            <div
              key={cycle.id}
              className="group transition-colors hover:bg-slate-50/30"
            >
              <div className="flex items-center gap-4 px-6 py-4">
                <button
                  onClick={() => toggle(cycle.id)}
                  className={`p-1 rounded-lg transition-all ${
                    isExpanded
                      ? "bg-primary text-white shadow-md shadow-primary/20 rotate-90"
                      : "text-slate-400 hover:bg-slate-200"
                  }`}
                >
                  <MdChevronRight className="text-xl" />
                </button>

                <div className="flex-1 min-w-0 grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
                  <div className="flex flex-col">
                    <span className="font-bold text-slate-900 truncate">
                      {cycle.name}
                    </span>
                    <span className="text-[10px] font-medium text-slate-400 uppercase tracking-wider">
                      Nombre del ciclo
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-slate-600">
                    <MdCalendarMonth className="text-slate-400 shrink-0" />
                    <div className="flex flex-col">
                      <span className="text-xs font-semibold">
                        {formatDate(cycle.startDate)}
                      </span>
                      <span className="text-[10px] text-slate-400 uppercase">
                        Inicio
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-slate-600">
                    <MdCalendarMonth className="text-slate-400 shrink-0" />
                    <div className="flex flex-col">
                      <span className="text-xs font-semibold">
                        {formatDate(cycle.endDate)}
                      </span>
                      <span className="text-[10px] text-slate-400 uppercase">
                        Fin
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="flex flex-col">
                      <div className="flex items-center gap-1.5">
                        <MdWindow className="text-slate-300" />
                        <span className="text-xs font-bold text-slate-700">
                          {cycle.windows?.length ?? 0}
                        </span>
                      </div>
                      <span className="text-[10px] text-slate-400 uppercase">
                        Ventanas
                      </span>
                    </div>
                    <StatusBadge cycle={cycle} />
                  </div>
                </div>

                <CycleActionsMenu
                  cycle={cycle}
                  campaignId={campaignId}
                  onEditCycle={onEditCycle}
                  onAddWindow={onAddWindow}
                  onViewRanking={onViewRanking}
                />
              </div>

              {isExpanded && (
                <div className="px-6 pb-6 pt-2 animate-in fade-in slide-in-from-top-2 duration-200">
                  <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
                    <div className="px-4 py-3 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-600 uppercase tracking-tight">
                        Ventanas de Canje del Ciclo
                      </span>
                      <button
                        onClick={() => onAddWindow(cycle)}
                        className="text-xs font-bold text-primary hover:text-blue-700 flex items-center gap-1 transition-colors"
                      >
                        <MdAdd className="text-base" />
                        Añadir Ventana
                      </button>
                    </div>

                    <div className="p-4">
                      <InlineWindowsPanel
                        cycle={cycle}
                        campaignId={campaignId}
                        onEditWindow={onEditWindow}
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}

        {cycles.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
              <MdCalendarMonth className="text-3xl text-slate-300" />
            </div>
            <h4 className="text-slate-800 font-bold">
              No hay ciclos configurados
            </h4>
            <p className="text-slate-500 text-sm max-w-xs mt-1">
              Comienza creando el primer ciclo de redención para esta campaña.
            </p>
            <Button
              variant="ghost"
              size="sm"
              className="mt-6"
              onClick={onAddCycle}
              leftIcon={<MdAdd />}
            >
              Crear primer ciclo
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

function StatusBadge({ cycle }: { cycle: RedemptionCycle }) {
  if (!cycle.isActive)
    return (
      <span className="px-2 py-0.5 rounded-md text-[9px] font-black bg-slate-100 text-slate-500 uppercase tracking-wider">
        Inactivo
      </span>
    );
  if (cycle.hasOpenWindow)
    return (
      <span className="px-2 py-0.5 rounded-md text-[9px] font-black bg-orange-100 text-orange-600 uppercase tracking-wider border border-orange-200">
        En curso
      </span>
    );
  return (
    <span className="px-2 py-0.5 rounded-md text-[9px] font-black bg-green-100 text-green-600 uppercase tracking-wider border border-green-200">
      Activo
    </span>
  );
}
