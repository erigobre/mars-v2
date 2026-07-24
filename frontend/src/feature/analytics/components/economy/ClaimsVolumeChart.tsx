import { useMemo, useState } from "react";
import { CartesianGrid, Line, LineChart, XAxis } from "recharts";
import { MdInfoOutline, MdShowChart, MdTimeline } from "react-icons/md";
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

type InteractiveMetrics = "claimCount" | "totalPoints";

const chartConfig = {
  views: {
    label: "Métricas",
    color: "transparent",
  },
  claimCount: {
    label: "Reclamos",
    color: "#2563EB",
  },
  totalPoints: {
    label: "Puntos Canjeados",
    color: "#10B981",
  },
} satisfies ChartConfig;

export default function ClaimsVolumeChart({ data }: { data: any[] }) {
  // 1. Identificamos los tres posibles estados:
  const isEmpty = !data || data.length === 0;
  const isSinglePoint = data?.length === 1; // <-- Detectamos si solo hay un punto

  const [activeChart, setActiveChart] = useState<InteractiveMetrics>("claimCount");

  const total = useMemo(
    () => ({
      claimCount:
        data?.reduce((acc, curr) => acc + (curr.claimCount || 0), 0) || 0,
      totalPoints:
        data?.reduce((acc, curr) => acc + (curr.totalPoints || 0), 0) || 0,
    }),
    [data]
  );

  return (
    <div className="col-span-12 lg:col-span-5 bg-white rounded-xl shadow-sm border border-slate-100 flex flex-col min-h-100">
      {/* HEADER */}
      <div className="flex flex-col items-stretch border-b border-slate-100 sm:flex-row">
        <div className="flex flex-1 flex-col justify-center gap-1 px-6 py-5">
          <div className="flex items-center gap-2">
            <h3 className="font-bold text-slate-900 leading-none tracking-tight">
              Volumen por Ciclo
            </h3>
            <Tooltip>
              <TooltipTrigger asChild>
                <button className="outline-none">
                  <MdInfoOutline className="text-slate-400 hover:text-slate-600 cursor-help" />
                </button>
              </TooltipTrigger>
              <TooltipContent className="bg-slate-800 text-white border-slate-700 max-w-50 text-center">
                <p className="text-[10px]">
                  Tendencia histórica agrupada por ciclos. Haz clic en las
                  pestañas para alternar métricas.
                </p>
              </TooltipContent>
            </Tooltip>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Picos de actividad interactivos
          </p>
        </div>

        {!isEmpty && (
          <div className="flex">
            {(["claimCount", "totalPoints"] as const).map((key) => {
              const chart = key as InteractiveMetrics; 
              const isActive = activeChart === chart;

              return (
                <button
                  key={chart}
                  data-active={isActive}
                  className={`flex flex-1 flex-col justify-center gap-1 border-t border-slate-100 px-6 py-4 text-left sm:border-t-0 sm:border-l sm:px-8 sm:py-5 transition-colors outline-none
                    ${isActive ? "bg-slate-50" : "hover:bg-slate-50/50"}
                  `}
                  onClick={() => setActiveChart(chart)}
                >
                  <span className="text-xs text-slate-500">
                    {chartConfig[chart].label}
                  </span>
                  <span className="text-lg leading-none font-bold sm:text-2xl text-slate-900">
                    {total[key].toLocaleString()}
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* CONTENT */}
      <div className="p-6 flex-1 flex flex-col justify-center">
        {isEmpty ? (
          // ESTADO 1: Sin datos
          <div className="flex flex-col items-center justify-center text-slate-400 py-10">
            <MdShowChart className="text-4xl opacity-20 mb-3" />
            <p className="text-sm font-medium">Gráfica sin datos.</p>
          </div>
        ) : isSinglePoint ? (
          // ESTADO 2: Un solo punto (Evitamos que se vea el puntito roto)
          <div className="flex flex-col items-center justify-center text-slate-500 py-12">
            <div className="w-16 h-16 bg-blue-50 text-primary rounded-full flex items-center justify-center mb-4 shadow-inner">
              <MdTimeline className="text-3xl" />
            </div>
            <p className="text-sm font-bold text-slate-700 text-center mb-1">
              Tendencia en construcción
            </p>
            <p className="text-xs text-center max-w-62.5 leading-relaxed">
              Se requiere más de un ciclo para graficar la línea de tendencia.{" "}
              <br />
              Actualmente hay{" "}
              <strong className="text-slate-900">
                {total[activeChart].toLocaleString()}
              </strong>{" "}
              {chartConfig[activeChart].label.toLowerCase()} en el ciclo activo.
            </p>
          </div>
        ) : (
          // ESTADO 3: Gráfica Normal (2 o más puntos)
          <ChartContainer
            config={chartConfig}
            className="aspect-auto h-62.5 w-full"
          >
            <LineChart
              accessibilityLayer
              data={data}
              margin={{ left: 12, right: 12, top: 10, bottom: 10 }}
            >
              <CartesianGrid vertical={false} stroke="#f1f5f9" />
              <XAxis
                dataKey="cycleName"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                minTickGap={32}
                className="text-xs font-bold text-slate-400"
              />
              <ChartTooltip
                content={
                  <ChartTooltipContent
                    className="w-37.5 bg-white border-slate-200 shadow-md"
                    nameKey={activeChart}
                    labelFormatter={(value) => (
                      <span className="font-bold text-slate-900">{value}</span>
                    )}
                  />
                }
              />
              <Line
                dataKey={activeChart}
                type="monotone"
                stroke={chartConfig[activeChart]?.color as string}
                strokeWidth={3}
                dot={{ r: 4, fill: chartConfig[activeChart]?.color as string }}
                activeDot={{
                  r: 6,
                  fill: chartConfig[activeChart]?.color as string,
                  stroke: "#fff",
                  strokeWidth: 2,
                }}
              />
            </LineChart>
          </ChartContainer>
        )}

        {/* Cuadros de Resumen (Mantenidos del diseño anterior) */}
        {!isEmpty && (
          <div className="grid grid-cols-2 gap-4 mt-6">
            <div className="bg-blue-50 p-3 rounded-lg">
              <p className="text-[10px] text-blue-600 font-bold uppercase truncate">
                Próximo Cierre
              </p>
              <p className="text-sm font-black text-slate-900 truncate">
                En curso
              </p>
            </div>
            <div className="bg-emerald-50 p-3 rounded-lg">
              <p className="text-[10px] text-emerald-600 font-bold uppercase truncate">
                Previsión Stock
              </p>
              <p className="text-sm font-black text-slate-900 truncate">
                Nivel Óptimo
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
