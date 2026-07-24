import { Bar, BarChart, CartesianGrid, XAxis } from "recharts";
import {
  type ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/core/components/ui/chart";
import type { WeeklyEvolution } from "../../schemas/economyRewardsAnalytics";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/core/components/ui/tooltip";
import { MdBarChart, MdInfoOutline } from "react-icons/md";

const chartConfig = {
  issued: {
    label: "Emitidos",
    color: "#2563EB", // Primary
  },
  redeemed: {
    label: "Canjeados",
    color: "#10B981", // Tertiary (Emerald)
  },
} satisfies ChartConfig;

export default function EcosystemBalanceChart({
  data,
}: {
  data: WeeklyEvolution[];
}) {
  const isEmpty = !data || data.length === 0;

  return (
    <div className="col-span-12 lg:col-span-8 bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex flex-col h-full">
      <div className="mb-6 flex justify-between items-start">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-bold text-slate-900">Balance del Ecosistema</h3>
            <Tooltip>
              <TooltipTrigger asChild>
                <button className="outline-none">
                  <MdInfoOutline className="text-slate-400 hover:text-slate-600 cursor-help" />
                </button>
              </TooltipTrigger>
              <TooltipContent className="bg-slate-800 text-white border-slate-700">
                <p className="text-[10px]">
                  Comparativa diaria entre los puntos generados (ventas) vs los
                  puntos consumidos (premios).
                </p>
              </TooltipContent>
            </Tooltip>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Puntos Emitidos vs. Puntos Canjeados
          </p>
        </div>
      </div>

      <div className="flex-1 min-h-75 flex flex-col">
        {isEmpty ? (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-400">
            <MdBarChart className="text-4xl opacity-20 mb-3" />
            <p className="text-sm font-medium">
              No hay historial de balance para mostrar.
            </p>
          </div>
        ) : (
          <ChartContainer
            config={chartConfig}
            className="w-full h-full max-h-75"
          >
            <BarChart
              accessibilityLayer
              data={data}
              margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
            >
              <CartesianGrid
                vertical={false}
                strokeDasharray="3 3"
                stroke="#f1f5f9"
              />
              <XAxis
                dataKey="day"
                tickLine={false}
                tickMargin={10}
                axisLine={false}
                tickFormatter={(value) => value.slice(0, 3)}
                className="text-xs font-bold text-slate-400 uppercase"
              />
              <ChartTooltip content={<ChartTooltipContent hideLabel />} />
              <ChartLegend content={<ChartLegendContent />} className="mt-4" />
              <Bar
                dataKey="redeemed"
                stackId="a"
                fill={chartConfig.redeemed.color}
                radius={[0, 0, 4, 4]}
              />
              <Bar
                dataKey="issued"
                stackId="a"
                fill={chartConfig.issued.color}
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ChartContainer>
        )}
      </div>
    </div>
  );
}
