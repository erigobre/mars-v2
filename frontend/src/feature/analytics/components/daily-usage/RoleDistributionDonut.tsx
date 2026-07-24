import { Cell, Label, Pie, PieChart } from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/core/components/ui/chart";

const ROLE_COLORS = ["#2563EB", "#10B981", "#F59E0B", "#6366F1", "#EC4899"];
const donutConfig = { count: { label: "Usuarios" } } satisfies ChartConfig;

export default function RoleDistributionDonut({
  data,
}: {
  data: { role: string; count: number }[];
}) {
  const total = data.reduce((s, r) => s + r.count, 0);
  const chartData = data.map((r, i) => ({
    ...r,
    fill: ROLE_COLORS[i % ROLE_COLORS.length],
  }));

  return (
    <div className="col-span-12 lg:col-span-4 bg-white rounded-xl border border-slate-100 shadow-sm p-6 flex flex-col overflow-hidden">
      <div className="mb-4">
        <h3 className="font-bold text-slate-900">Distribución por Rol</h3>
        <p className="text-xs text-slate-500">Sesiones activas según rol</p>
      </div>

      {/* Contenedor Responsivo: alado en móvil, abajo en md, alado en xl */}
      <div className="flex flex-1 flex-row lg:flex-col xl:flex-row items-center justify-center gap-6 min-h-44 w-full">
        <ChartContainer config={donutConfig} className="h-40 w-40 shrink-0">
          <PieChart>
            <ChartTooltip content={<ChartTooltipContent hideLabel />} />
            <Pie
              data={chartData}
              dataKey="count"
              nameKey="role"
              innerRadius={50}
              outerRadius={70}
              stroke="none"
              cornerRadius={4}
            >
              {chartData.map((entry, i) => (
                <Cell key={i} fill={entry.fill} />
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
                          y={(viewBox.cy ?? 0) - 6}
                          className="fill-slate-900 text-2xl font-black"
                        >
                          {total}
                        </tspan>
                        <tspan
                          x={viewBox.cx}
                          y={(viewBox.cy ?? 0) + 12}
                          className="fill-slate-400 text-[9px]"
                        >
                          total
                        </tspan>
                      </text>
                    );
                  }
                }}
              />
            </Pie>
          </PieChart>
        </ChartContainer>

        <div className="space-y-3 flex-1 w-full">
          {chartData.map((r) => (
            <div key={r.role} className="flex items-center gap-2">
              <span
                className="w-2.5 h-2.5 rounded-full shrink-0"
                style={{ backgroundColor: r.fill }}
              />
              <span className="text-xs text-slate-600 capitalize lg:flex-1 truncate">
                {r.role}
              </span>
              <span className="text-xs font-black text-slate-900 shrink-0">
                {r.count}
              </span>
            </div>
          ))}
          {data.length === 0 && (
            <p className="text-xs text-slate-400 italic">Sin datos</p>
          )}
        </div>
      </div>
    </div>
  );
}
