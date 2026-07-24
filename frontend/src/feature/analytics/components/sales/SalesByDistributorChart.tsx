import { Cell, Pie, PieChart, Label, Sector } from "recharts";
import type { PieSectorShapeProps } from "recharts/types/polar/Pie";
import { MdPieChartOutline } from "react-icons/md";
import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/core/components/ui/chart";
import type { z } from "zod";
import type { salesByDistributorSchema } from "../../schemas/salesAnalytics";

type DistributorData = z.infer<typeof salesByDistributorSchema>;

// Mapeamos el color Hex para el SVG (Recharts) y la clase Tailwind para la leyenda HTML
const THEME_COLORS = [
  { fill: "#2563EB", legendClass: "bg-primary" }, // Azul primary
  { fill: "#10B981", legendClass: "bg-secondary" }, // Esmeralda (tertiary en tu HTML)
  { fill: "#F59E0B", legendClass: "bg-yellow-500" }, // Ámbar
  { fill: "#6366F1", legendClass: "bg-indigo-500" }, // Índigo
  { fill: "#EC4899", legendClass: "bg-pink-500" }, // Rosa
];

const ACTIVE_INDEX = 0;

// Función para formatear el centro del gráfico dinámicamente
const formatTotal = (value: number) => {
  if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`;
  if (value >= 1000) return `$${(value / 1000).toFixed(0)}K`;
  return `$${value.toLocaleString()}`; // Muestra montos menores tal cual, ej: $450
};

export default function SalesByDistributorChart({
  data,
}: {
  data: DistributorData[];
}) {
  const isEmpty = !data || data.length === 0;

  // Asignamos el fill y la clase CSS correspondiente a cada distribuidor
  const chartData = isEmpty
    ? []
    : data.map((item, index) => {
        const theme = THEME_COLORS[index % THEME_COLORS.length];
        return {
          ...item,
          fill: theme.fill,
          legendClass: theme.legendClass,
        };
      });

  const totalSalesOverall = isEmpty
    ? 0
    : chartData.reduce((acc, curr) => acc + curr.totalSales, 0);

  const chartConfig = {
    totalSales: { label: "Ventas Totales" },
  } satisfies ChartConfig;

  return (
    <div className="col-span-12 lg:col-span-4 bg-white p-6 rounded-xl shadow-sm border border-slate-100 h-full flex flex-col min-h-100">
      <div className="mb-6">
        <h2 className="text-lg font-extrabold text-slate-900 tracking-tight">
          Ventas por Distribuidor
        </h2>
        <p className="text-sm text-slate-500">Distribución de mercado actual</p>
      </div>

      <div className="flex-1 flex flex-col justify-center">
        {isEmpty ? (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-400">
            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
              <MdPieChartOutline className="text-3xl opacity-40" />
            </div>
            <p className="text-sm text-center font-medium">
              No hay ventas registradas
              <br />
              para mostrar la distribución.
            </p>
          </div>
        ) : (
          <>
            <ChartContainer
              config={chartConfig}
              className="mx-auto aspect-square max-h-62.5 w-full"
            >
              <PieChart>
                <ChartTooltip
                  cursor={false}
                  content={<ChartTooltipContent hideLabel />}
                />
                <Pie
                  data={chartData}
                  dataKey="totalSales"
                  nameKey="distributorName"
                  innerRadius={70}
                  outerRadius={90}
                  strokeWidth={4}
                  stroke="#ffffff"
                  shape={({
                    index,
                    outerRadius = 0,
                    ...props
                  }: PieSectorShapeProps) =>
                    index === ACTIVE_INDEX ? (
                      <Sector {...props} outerRadius={outerRadius + 8} />
                    ) : (
                      <Sector {...props} outerRadius={outerRadius} />
                    )
                  }
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                  <Label
                    content={({ viewBox }) => {
                      if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                        return (
                          <text
                            x={viewBox.cx}
                            y={viewBox.cy}
                            textAnchor="middle"
                            dominantBaseline="middle"
                          >
                            <tspan
                              x={viewBox.cx}
                              y={(viewBox.cy || 0) - 5}
                              className="fill-slate-900 text-2xl font-black"
                            >
                              {formatTotal(totalSalesOverall)}
                            </tspan>
                            <tspan
                              x={viewBox.cx}
                              y={(viewBox.cy || 0) + 15}
                              className="fill-slate-500 text-[10px] font-bold uppercase"
                            >
                              Total
                            </tspan>
                          </text>
                        );
                      }
                    }}
                  />
                </Pie>
              </PieChart>
            </ChartContainer>

            {/* Leyenda Actualizada basada en tu HTML */}
            <div className="space-y-3 mt-6 px-2">
              {chartData.map((dist) => (
                <div
                  key={dist.distributorId}
                  className="flex items-center justify-between"
                >
                  <div className="flex items-center gap-2">
                    <span
                      className={`w-3 h-3 rounded-sm ${dist.legendClass}`}
                    ></span>
                    <span
                      className="text-sm font-medium text-slate-700 truncate max-w-37.5"
                      title={dist.distributorName}
                    >
                      {dist.distributorName}
                    </span>
                  </div>
                  <span className="text-sm font-bold text-slate-900">
                    {dist.percentage}%
                  </span>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
