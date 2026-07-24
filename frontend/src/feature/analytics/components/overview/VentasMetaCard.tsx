import { MdTrendingUp, MdInfoOutline } from "react-icons/md";
import {
  Label,
  PolarAngleAxis,
  PolarRadiusAxis,
  RadialBar,
  RadialBarChart,
} from "recharts";
import BaseCard from "../BaseCard";
import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/core/components/ui/chart";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/core/components/ui/tooltip";

type SalesVsGoalsData = {
  currentSales: number;
  goal: number;
  percentage: number;
  status: string;
};

const chartConfig = {
  cumplimiento: {
    label: "Cumplimiento",
    color: "hsl(var(--color-primary))",
  },
} satisfies ChartConfig;

export default function VentasMetaCard({ data }: { data: SalesVsGoalsData }) {
  const safePercentage = data.percentage > 100 ? 100 : data.percentage;

  const chartData = [
    {
      name: "ventas",
      cumplimiento: safePercentage,
      fill: "var(--color-primary)",
    },
  ];

  const statusLabels: Record<string, string> = {
    achieved: "Meta Alcanzada",
    on_track: "En Buen Camino",
    at_risk: "En Riesgo",
    critical: "Estado Crítico",
    no_campaign: "Sin Campaña",
  };

  return (
    <BaseCard className="flex flex-col justify-between p-0">
      {/* Header */}
      <div className="flex items-center justify-between p-6 pb-2">
        <div className="flex items-center space-x-2 group relative">
          <span className="text-xs font-bold text-slate-500 uppercase">
            Ventas vs Metas
          </span>
          <Tooltip>
            <TooltipTrigger asChild>
              <button className="outline-none">
                <MdInfoOutline className="text-slate-400 hover:text-slate-600 cursor-help" />
              </button>
            </TooltipTrigger>
            <TooltipContent className="bg-slate-800 text-white border-slate-700">
              <p className="text-[10px]">
                Cumplimiento de ventas respecto a las metas configuradas.
              </p>
            </TooltipContent>
          </Tooltip>
        </div>
        <MdTrendingUp className="text-primary text-2xl" />
      </div>

      {/* Gráfico (Shadcn Chart Container) */}
      <div className="flex flex-1 items-center justify-center">
        <ChartContainer config={chartConfig} className="mx-auto w-full h-40">
          <RadialBarChart
            data={chartData}
            innerRadius={75}
            outerRadius={95}
            barSize={20} // Controla el grosor de la barra
            startAngle={180} // Inicio a la izquierda
            endAngle={0} // Fin a la derecha
            cy={130} // Ajuste vertical para centrar la media luna
          >
            <PolarAngleAxis
              type="number"
              domain={[0, 100]}
              angleAxisId={0}
              tick={false}
            />
            <RadialBar
              dataKey="cumplimiento"
              cornerRadius={0}
              background={{ fill: "#f1f5f9" }}
              className="stroke-transparent stroke-2"
            />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel />}
            />
            <PolarRadiusAxis tick={false} tickLine={false} axisLine={false}>
              <Label
                content={({ viewBox }) => {
                  if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                    return (
                      <text x={viewBox.cx} y={viewBox.cy} textAnchor="middle">
                        <tspan
                          x={viewBox.cx}
                          y={(viewBox.cy || 0) - 16}
                          className="fill-slate-900 text-3xl font-bold"
                        >
                          {data.percentage}%
                        </tspan>
                        <tspan
                          x={viewBox.cx}
                          y={(viewBox.cy || 0) + 4}
                          className="fill-slate-500 text-[10px]"
                        >
                          Cumplimiento global del mes
                        </tspan>
                      </text>
                    );
                  }
                }}
              />
            </PolarRadiusAxis>
          </RadialBarChart>
        </ChartContainer>
      </div>

      <div className="px-6 pb-6 pt-2 text-center">
        <p className="text-[10px] text-slate-500 font-medium uppercase mt-2">
          Estado: {statusLabels[data.status] || data.status}
        </p>
        <p className="text-[10px] text-slate-400 mt-1">
          {data.currentSales.toLocaleString()} / {data.goal.toLocaleString()}{" "}
          ventas
        </p>
      </div>
    </BaseCard>
  );
}
