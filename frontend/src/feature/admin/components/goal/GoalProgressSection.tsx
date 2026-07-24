import { MdCheckCircle, MdPerson, MdTimelapse } from "react-icons/md";
import type { DataTableColumn } from "@/core/types";
import DataTable from "@/core/components/ui/DataTable/DataTable";
import { formatDateTime } from "@/core/utils/formatDate";
import type { AdminGoalProgress } from "../../schemas/goal";

type GoalProgressSectionProps = {
  progresses: AdminGoalProgress[];
  goalType: "TOTAL_SALES_AMOUNT" | "SPECIFIC_PRODUCT_QTY" | "TOTAL_DISPLAY_QTY";
  isLoading?: boolean;
};

export function GoalProgressSection({
  progresses,
  goalType,
  isLoading = false,
}: GoalProgressSectionProps) {
  const columns: DataTableColumn<AdminGoalProgress>[] = [
    {
      label: "Vendedor",
      primary: true,
      render: (progress) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary/10 overflow-hidden flex items-center justify-center shrink-0 border border-primary/20">
            <MdPerson className="text-primary text-xl" />
          </div>
          <div>
            <p className="font-bold text-gray-900">
              {progress.seller?.name ?? "Sin nombre"}
            </p>
            <p className="text-xs text-gray-400">
              {progress.seller?.employeeCode ?? "—"}
            </p>
          </div>
        </div>
      ),
    },
    {
      label: "Progreso Actual",
      render: (progress) => (
        <span className="text-sm font-semibold text-gray-700">
          {goalType === "TOTAL_SALES_AMOUNT"
            ? `$${progress.currentValue!.toLocaleString()}`
            : `${progress.currentValue!.toLocaleString()} u.`}
        </span>
      ),
    },
    {
      label: "Objetivo",
      mobileHidden: true,
      render: (progress) => (
        <span className="text-sm text-gray-500">
          {goalType === "TOTAL_SALES_AMOUNT"
            ? `$${progress.targetValue!.toLocaleString()}`
            : `${progress.targetValue!.toLocaleString()} u.`}
        </span>
      ),
    },
    {
      label: "Porcentaje",
      render: (progress) => (
        <div className="flex flex-col gap-1 w-full max-w-30">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-700">
              {progress.percentage.toFixed(1)}%
            </span>
          </div>
          <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all ${
                progress.reached ? "bg-green-500" : "bg-primary"
              }`}
              style={{ width: `${Math.min(progress.percentage, 100)}%` }}
            />
          </div>
        </div>
      ),
    },
    {
      label: "Estado",
      render: (progress) =>
        progress.reached ? (
          <div className="flex items-center gap-1.5">
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-green-100 text-green-700">
              <MdCheckCircle className="text-sm" />
              Completada
            </span>
            {progress.bonusAwarded && (
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-700">
                Bono
              </span>
            )}
          </div>
        ) : (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-gray-100 text-gray-600">
            <MdTimelapse className="text-sm" />
            En progreso
          </span>
        ),
    },
    {
      label: "Completado",
      mobileHidden: true,
      render: (progress) =>
        progress.reachedAt ? (
          <span className="text-xs text-gray-500">
            {formatDateTime(progress.reachedAt)}
          </span>
        ) : (
          <span className="text-xs text-gray-400">—</span>
        ),
    },
  ];

  return (
    <section className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="p-5 border-b border-gray-100 flex items-center justify-between">
        <div>
          <h2 className="text-base font-bold text-gray-900">
            Progreso de Vendedores
          </h2>
          <p className="text-xs text-gray-400 mt-0.5">
            {progresses.length} vendedor
            {progresses.length !== 1 ? "es" : ""} trabajando en esta meta
          </p>
        </div>
      </div>

      <div className="p-0 border-none shadow-none bg-transparent">
        <DataTable
          columns={columns}
          data={progresses}
          isLoading={isLoading}
          emptyMessage="No hay vendedores trabajando en esta meta."
        />
      </div>
    </section>
  );
}
