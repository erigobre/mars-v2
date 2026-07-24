import { ResponsiveContainer, PieChart, Pie, Cell, Label, Tooltip } from "recharts";
import { pct } from "./utils";

export interface DonutProps {
  logged: number;
  notLogged: number;
  acceptedTerms: number;
  totalRegistered: number;
}

export function AdoptionDonut({
  logged,
  notLogged,
  acceptedTerms,
  totalRegistered,
}: DonutProps) {
  const data = [
    { name: "Aceptaron T&C", value: acceptedTerms, fill: "#10B981" },
    {
      name: "Login sin T&C",
      value: logged - acceptedTerms,
      fill: "#F59E0B",
    },
    { name: "Nunca entraron", value: notLogged, fill: "#E2E8F0" },
  ].filter((d) => d.value > 0);

  return (
    <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm flex flex-col">
      <h3 className="font-bold text-slate-900 mb-1">Estado de Adopción</h3>
      <p className="text-xs text-slate-500 mb-4">
        Distribución global de vendedores
      </p>
      <div className="flex-1 flex flex-col sm:flex-row items-center gap-6">
        <div className="relative w-48 h-48 shrink-0">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                dataKey="value"
                nameKey="name"
                innerRadius={56}
                outerRadius={76}
                stroke="none"
                cornerRadius={4}
              >
                {data.map((entry, i) => (
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
                            style={{ fontSize: 22, fontWeight: 900 }}
                          >
                            {totalRegistered.toLocaleString()}
                          </tspan>
                          <tspan
                            x={viewBox.cx}
                            y={(viewBox.cy ?? 0) + 14}
                            style={{
                              fontSize: 9,
                              fill: "#94a3b8",
                              fontWeight: 700,
                            }}
                          >
                            TOTAL
                          </tspan>
                        </text>
                      );
                    }
                  }}
                />
              </Pie>
              <Tooltip
                formatter={(val: any, name: any) => [
                  `${val} (${pct(val as number, totalRegistered)}%)`,
                  name,
                ]}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="space-y-3 flex-1 w-full">
          {data.map((d) => (
            <div key={d.name} className="flex items-center gap-2.5">
              <span
                className="w-3 h-3 rounded-sm shrink-0"
                style={{ backgroundColor: d.fill }}
              />
              <span className="text-xs text-slate-600 flex-1">{d.name}</span>
              <span className="text-xs font-black text-slate-900">
                {d.value.toLocaleString()}
              </span>
              <span className="text-[10px] text-slate-400 w-10 text-right">
                {pct(d.value, totalRegistered)}%
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
