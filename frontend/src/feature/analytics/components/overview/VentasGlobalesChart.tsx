import {
  Bar,
  BarChart,
  ResponsiveContainer,
  XAxis,
  CartesianGrid,
  Legend, // <-- Importamos Legend
} from "recharts";
import { MdBarChart, MdInfoOutline } from "react-icons/md";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/core/components/ui/chart";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/core/components/ui/tooltip";
import type { MonthlyEvolution } from "../../schemas/economyRewardsAnalytics";

const chartConfig = {
  issued: {
    label: "Puntos Emitidos",
    color: "hsl(var(--primary))",
  },
  redeemed: {
    label: "Puntos Canjeados",
    color: "#10B981",
  },
} satisfies ChartConfig;

export default function VentasGlobalesChart({
  data,
}: {
  data: MonthlyEvolution[];
}) {
  const isEmpty = !data || data.length === 0;

  return (
    <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col min-h-87.5">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h3 className="font-bold text-slate-900">Evolución de Puntos</h3>
          <p className="text-xs text-slate-500">Histórico de campaña actual</p>
        </div>
        <Tooltip>
          <TooltipTrigger asChild>
            <button className="outline-none">
              <MdInfoOutline className="text-slate-400 hover:text-slate-600 cursor-help" />
            </button>
          </TooltipTrigger>
          <TooltipContent className="bg-slate-800 text-white border-slate-700">
            <p className="text-[10px]">
              Muestra el volumen de puntos otorgados vs canjeados mes a mes.
            </p>
          </TooltipContent>
        </Tooltip>
      </div>

      <div className="flex-1 w-full flex items-center justify-center">
        {isEmpty ? (
          <div className="flex flex-col items-center justify-center text-slate-400 space-y-2">
            <MdBarChart className="text-5xl opacity-20" />
            <p className="text-xs font-medium">
              No hay datos disponibles para este periodo
            </p>
          </div>
        ) : (
          <ChartContainer config={chartConfig} className="w-full max-h-60 ">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={data}
                margin={{ top: 5, right: 5, left: 5, bottom: 5 }}
              >
                <CartesianGrid
                  vertical={false}
                  strokeDasharray="3 3"
                  stroke="#f1f5f9"
                />
                <XAxis
                  dataKey="month"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#94a3b8", fontSize: 10 }}
                  dy={10}
                />
                <ChartTooltip
                  cursor={false}
                  content={<ChartTooltipContent />}
                />
                <Legend
                  verticalAlign="top"
                  height={36}
                  iconType="circle"
                  wrapperStyle={{ fontSize: "12px" }}
                />

                <Bar
                  dataKey="issued"
                  name="Emitidos"
                  fill="var(--color-primary)"
                  radius={[4, 4, 0, 0]}
                  barSize={30}
                />

                <Bar
                  dataKey="redeemed"
                  name="Canjeados"
                  fill={chartConfig.redeemed.color}
                  radius={[4, 4, 0, 0]}
                  barSize={30}
                />
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        )}
      </div>
    </div>
  );
}
