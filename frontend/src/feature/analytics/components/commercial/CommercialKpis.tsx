import {
  MdPayments,
  MdOutlineTrackChanges,
  MdTrendingUp,
  MdTrendingDown,
  MdPerson4,
} from "react-icons/md";
import type { z } from "zod";
import type { KpiItemSchema } from "../../schemas/distributorDashboardSchema";

type KpisData = Record<string, z.infer<typeof KpiItemSchema>> | undefined;

export default function CommercialKpis({ kpis }: { kpis: KpisData }) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("es-MX", {
      style: "currency",
      currency: "MXN",
    }).format(value);
  };

  const salesTrend = kpis?.totalSales?.trend || 0;
  const isPositiveTrend = salesTrend >= 0;

  return (
    <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex flex-col justify-between">
        <div className="flex justify-between items-start mb-4">
          <span className="text-slate-500 text-sm font-semibold uppercase tracking-wider">
            Venta Total (Mes)
          </span>
          <div className="bg-blue-100 p-2 rounded-lg flex items-center justify-center">
            <MdPayments className="text-blue-600 text-xl" />
          </div>
        </div>
        <div>
          <h3 className="text-3xl font-extrabold text-slate-900">
            {formatCurrency(kpis?.totalSales?.value || 0)}
          </h3>
          {kpis?.totalSales?.trend !== undefined && (
            <p
              className={`text-sm font-bold flex items-center gap-1 mt-1 ${
                isPositiveTrend ? "text-emerald-600" : "text-red-500"
              }`}
            >
              {isPositiveTrend ? (
                <MdTrendingUp className="text-xs" />
              ) : (
                <MdTrendingDown className="text-xs" />
              )}
              {isPositiveTrend ? "+" : ""}
              {salesTrend}% {kpis.totalSales.trendLabel || "vs mes anterior"}
            </p>
          )}
        </div>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex flex-col justify-between">
        <div className="flex justify-between items-start mb-4">
          <span className="text-slate-500 text-sm font-semibold uppercase tracking-wider">
            Progreso de Meta
          </span>
          <div className="bg-emerald-100 p-2 rounded-lg flex items-center justify-center">
            <MdOutlineTrackChanges className="text-emerald-600 text-xl" />
          </div>
        </div>
        <div className="space-y-3">
          <div className="flex justify-between items-end">
            <h3 className="text-3xl font-extrabold text-slate-900">
              {kpis?.goalProgress?.effectivenessPercentage || 0}%
            </h3>
            <span className="text-slate-400 text-xs mb-1">
              Meta: {formatCurrency(kpis?.goalProgress?.value || 0)}
            </span>
          </div>
          <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden">
            <div
              className="bg-primary h-full rounded-full transition-all duration-500"
              style={{
                width: `${Math.min(
                  kpis?.goalProgress?.effectivenessPercentage || 0,
                  100
                )}%`,
              }}
            ></div>
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex flex-col justify-between">
        <div className="flex justify-between items-start mb-4">
          <span className="text-slate-500 text-sm font-semibold uppercase tracking-wider">
            Vendedores Activos
          </span>
          <div className="bg-amber-100 p-2 rounded-lg flex items-center justify-center">
            <MdPerson4 className="text-amber-600 text-xl" />
          </div>
        </div>
        <div>
          <h3 className="text-3xl font-extrabold text-slate-900">
            {kpis?.activeSellers?.value || 0}
          </h3>
        </div>
      </div>
    </section>
  );
}
