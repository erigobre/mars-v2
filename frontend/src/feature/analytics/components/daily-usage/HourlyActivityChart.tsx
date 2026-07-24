import { useMemo } from "react";
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/core/components/ui/chart";

const hourlyConfig = {
  logins: { label: "Logins", color: "#2563EB" },
} satisfies ChartConfig;

export default function HourlyActivityChart({
  labels,
  series,
}: {
  labels: string[];
  series: number[];
}) {
  const data = useMemo(
    () => labels.map((hour, i) => ({ hour, logins: series[i] ?? 0 })),
    [labels, series],
  );

  return (
    <div className="col-span-12 lg:col-span-8 bg-white rounded-xl border border-slate-100 shadow-sm p-6 flex flex-col">
      <div className="mb-5">
        <h3 className="font-bold text-slate-900">Actividad por Hora</h3>
        <p className="text-xs text-slate-500">
          Logins únicos agrupados por hora (zona local)
        </p>
      </div>
      <div className="flex-1 min-h-56">
        <ChartContainer config={hourlyConfig} className="w-full h-56">
          <AreaChart
            data={data}
            margin={{ top: 5, right: 8, left: -20, bottom: 0 }}
          >
            <defs>
              <linearGradient id="loginsGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#2563EB" stopOpacity={0.18} />
                <stop offset="95%" stopColor="#2563EB" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} stroke="#f1f5f9" />
            <XAxis
              dataKey="hour"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickFormatter={(v: string) => {
                const h = parseInt(v);
                return h % 4 === 0 ? v : "";
              }}
              tick={{ fontSize: 10, fill: "#94a3b8" }}
            />
            <ChartTooltip
              content={
                <ChartTooltipContent labelFormatter={(label) => `${label}`} />
              }
            />
            <Area
              type="monotone"
              dataKey="logins"
              stroke="#2563EB"
              strokeWidth={2.5}
              fill="url(#loginsGrad)"
              dot={false}
              activeDot={{
                r: 5,
                fill: "#2563EB",
                stroke: "#fff",
                strokeWidth: 2,
              }}
            />
          </AreaChart>
        </ChartContainer>
      </div>
    </div>
  );
}
