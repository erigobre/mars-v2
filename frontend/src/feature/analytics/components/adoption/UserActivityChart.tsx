import { MdArrowForward, MdInfoOutline } from "react-icons/md";
import { Cell, Pie, PieChart, ResponsiveContainer } from "recharts";
import type { UserActivityRate } from "../../schemas/adoptionAnalytics";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/core/components/ui/tooltip";

export default function UserActivityChart({
  data,
}: {
  data: UserActivityRate;
}) {
  const chartData = [
    { name: "Activos", value: data.activeUsers, fill: "#2563EB" }, // Primary
    { name: "Inactivos", value: data.inactiveUsers, fill: "#E2E8F0" }, // Slate-200
  ];

  const formatTotalUsers = (total: number) => {
    if (total >= 1000) return `${(total / 1000).toFixed(1)}k`;
    return total.toString();
  };

  return (
    <div className="col-span-12 lg:col-span-7 bg-white p-6 rounded-xl shadow-sm border border-slate-100 h-full flex flex-col">
      <div className="flex justify-between items-center mb-8">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-bold text-slate-900">Tasa de Adopción</h3>
            <Tooltip>
              <TooltipTrigger asChild>
                <button className="outline-none">
                  <MdInfoOutline className="text-slate-400 hover:text-slate-600 cursor-help" />
                </button>
              </TooltipTrigger>
              <TooltipContent className="bg-slate-800 text-white border-slate-700 max-w-xs">
                <p className="text-[10px] leading-relaxed">
                  Mide el porcentaje de usuarios registrados que han tenido
                  actividad reciente (ventas o canjes). Ayuda a evaluar si el
                  programa realmente está motivando el uso continuo de la
                  plataforma.
                </p>
              </TooltipContent>
            </Tooltip>
          </div>
          <p className="text-xs text-slate-500">
            Distribución de usuarios activos vs. inactivos
          </p>
        </div>
        <div className="flex items-center bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">
          <span className="text-xl font-black text-primary">
            {data.adoptionRate}%
          </span>
          <span className="ml-2 text-[10px] text-slate-500 font-bold uppercase">
            Total Activos
          </span>
        </div>
      </div>

      <div className="flex-1 flex flex-col sm:flex-row items-center justify-around gap-6">
        {/* Gráfico Doughnut */}
        <div className="relative w-56 h-56 shrink-0">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={70}
                outerRadius={90}
                startAngle={90}
                endAngle={-270}
                dataKey="value"
                stroke="none"
                cornerRadius={5}
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          {/* Contenido central del anillo */}
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <span className="text-3xl font-black text-slate-900">
              {formatTotalUsers(data.totalUsers)}
            </span>
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">
              Usuarios Totales
            </span>
          </div>
        </div>

        <div className="space-y-4 w-full sm:w-auto">
          <div className="flex items-center space-x-3">
            <div className="w-3 h-3 rounded-full bg-primary shrink-0"></div>
            <div>
              <p className="text-xs font-bold text-slate-900 leading-none">
                Usuarios Activos
              </p>
              <p className="text-[10px] text-slate-500 mt-1">
                {data.activeUsers.toLocaleString()} usuarios (
                {data.adoptionRate}%)
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <div className="w-3 h-3 rounded-full bg-slate-200 shrink-0"></div>
            <div>
              <p className="text-xs font-bold text-slate-900 leading-none">
                Usuarios Inactivos
              </p>
              <p className="text-[10px] text-slate-500 mt-1">
                {data.inactiveUsers.toLocaleString()} usuarios (
                {100 - data.adoptionRate}%)
              </p>
            </div>
          </div>
          <div className="pt-4 border-t border-slate-100">
            <button className="text-xs font-bold text-primary hover:text-blue-800 transition-colors flex items-center group">
              Ver reporte detallado
              <MdArrowForward className="text-sm ml-1 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
