import {
  MdAttachMoney,
  MdEdit,
  MdEmojiEvents,
  MdInventory,
  MdPauseCircle,
  MdViewModule,
} from "react-icons/md";
import { Button } from "@/core/components/ui";
import type { AdminGoal } from "../../schemas/goal";
import { goalTypeLabels } from "@/core/schemas/goal";

type GoalHeaderCardProps = {
  goal: AdminGoal;
  onEdit: () => void;
  onTogglePause: () => void;
};

export function GoalHeaderCard({
  goal,
  onEdit,
  onTogglePause,
}: GoalHeaderCardProps) {
  const getTypeIcon = () => {
    switch (goal.type) {
      case "TOTAL_SALES_AMOUNT":
        return <MdAttachMoney className="text-4xl" />;
      case "SPECIFIC_PRODUCT_QTY":
        return <MdInventory className="text-4xl" />;
      case "TOTAL_DISPLAY_QTY":
        return <MdViewModule className="text-4xl" />;
      default:
        return <MdEmojiEvents className="text-4xl" />;
    }
  };

  return (
    <section className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="flex flex-col md:flex-row p-6 gap-6">
        {/* Icon */}
        <div className="w-24 h-24 bg-primary/10 rounded-xl flex items-center justify-center shrink-0 border border-primary/20 text-primary">
          {getTypeIcon()}
        </div>

        {/* Info */}
        <div className="flex flex-1 flex-col justify-between py-1">
          <div>
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3">
              <div>
                <p className="text-primary font-bold text-xs tracking-wider uppercase mb-1">
                  {goalTypeLabels[goal.type]}
                </p>
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
                  {goal.name}
                </h1>
                {goal.cycle && (
                  <p className="text-sm text-gray-500 mt-1">
                    Ciclo: {goal.cycle.name}
                  </p>
                )}
              </div>
              <div className="flex items-center gap-2 shrink-0">
                {goal.isActive ? (
                  <span className="px-3 py-1 bg-emerald-100 text-emerald-700 text-xs font-bold rounded-full border border-emerald-200 uppercase">
                    Activa
                  </span>
                ) : (
                  <span className="px-3 py-1 bg-gray-100 text-gray-600 text-xs font-bold rounded-full border border-gray-200 uppercase">
                    Inactiva
                  </span>
                )}
              </div>
            </div>

            {goal.description && (
              <p className="mt-3 text-sm text-gray-500 leading-relaxed max-w-lg">
                {goal.description}
              </p>
            )}

            <div className="mt-5 grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="flex flex-col">
                <span className="text-gray-400 text-xs font-medium uppercase tracking-wide">
                  Valor Objetivo
                </span>
                <span className="text-xl font-bold text-primary mt-0.5">
                  {goal.type === "TOTAL_SALES_AMOUNT"
                    ? `$${goal.targetValue.toLocaleString()}`
                    : `${goal.targetValue.toLocaleString()} u.`}
                </span>
              </div>
              <div className="flex flex-col">
                <span className="text-gray-400 text-xs font-medium uppercase tracking-wide">
                  Recompensa
                </span>
                <span className="text-xl font-bold text-amber-500 mt-0.5">
                  {goal.rewardPoints.toLocaleString()} pts
                </span>
              </div>
              <div className="flex flex-col">
                <span className="text-gray-400 text-xs font-medium uppercase tracking-wide">
                  Vendedores
                </span>
                <span className="text-xl font-bold text-gray-800 mt-0.5">
                  {goal.progressesCount ?? 0}
                </span>
              </div>
              <div className="flex flex-col">
                <span className="text-gray-400 text-xs font-medium uppercase tracking-wide">
                  Han Completado
                </span>
                <span className="text-xl font-bold text-green-600 mt-0.5">
                  {goal.reachedCount ?? 0}
                </span>
              </div>
            </div>

            {/* Información adicional según tipo */}
            {goal.product && (
              <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-100">
                <p className="text-xs font-bold text-blue-900 mb-1">
                  Producto Específico
                </p>
                <p className="text-sm text-blue-800">
                  {goal.product.name} ({goal.product.sku})
                </p>
              </div>
            )}
            {goal.display && (
              <div className="mt-4 p-3 bg-purple-50 rounded-lg border border-purple-100">
                <p className="text-xs font-bold text-purple-900 mb-1">
                  Display
                </p>
                <p className="text-sm text-purple-800">{goal.display.name}</p>
              </div>
            )}
          </div>

          <div className="flex flex-wrap gap-3 mt-6">
            <Button onClick={onEdit} variant="primary" className="rounded-lg">
              <MdEdit className="text-base" />
              Editar Meta
            </Button>
            <Button
              onClick={onTogglePause}
              variant="ghost"
              className="rounded-lg"
            >
              <MdPauseCircle className="text-base" />
              {goal.isActive ? "Pausar Meta" : "Activar Meta"}
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
