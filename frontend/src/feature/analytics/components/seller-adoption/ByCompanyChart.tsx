import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts";
import type { ByCompanyItem } from "../../schemas/sellerAdoptionSchemas";

export interface ByCompanyChartProps {
  data: ByCompanyItem[];
}

export function ByCompanyChart({ data }: ByCompanyChartProps) {
  const chartData = data.slice(0, 12).map((c) => ({
    name:
      c.distributorName.length > 14
        ? c.distributorName.slice(0, 14) + "…"
        : c.distributorName,
    fullName: c.distributorName,
    total: c.totalSellers,
    logged: c.loggedInEver,
    accepted: c.acceptedTerms,
    noTerms: c.loggedNoTerms,
    never: c.neverLoggedIn,
  }));

  return (
    <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm">
      <h3 className="font-bold text-slate-900 mb-1">Adopción por Empresa</h3>
      <p className="text-xs text-slate-500 mb-4">
        Vendedores registrados vs activos
      </p>
      <div className="flex gap-4 mb-4 flex-wrap">
        {[
          { color: "#10B981", label: "Aceptaron T&C" },
          { color: "#F59E0B", label: "Login sin T&C" },
          { color: "#E2E8F0", label: "Nunca entraron" },
        ].map((l) => (
          <div key={l.label} className="flex items-center gap-1.5">
            <span
              className="w-2.5 h-2.5 rounded-sm"
              style={{ backgroundColor: l.color }}
            />
            <span className="text-[10px] font-bold text-slate-600">
              {l.label}
            </span>
          </div>
        ))}
      </div>
      <ResponsiveContainer width="100%" height={220}>
        <BarChart
          data={chartData}
          margin={{ left: -16, right: 8, top: 4, bottom: 0 }}
          barSize={14}
        >
          <CartesianGrid vertical={false} stroke="#f1f5f9" />
          <XAxis
            dataKey="name"
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 9, fill: "#94a3b8" }}
          />
          <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 9, fill: "#94a3b8" }} />
          <Tooltip
            formatter={(val: any, name: any) => {
              const labels: Record<string, string> = {
                accepted: "Aceptaron T&C",
                noTerms: "Login sin T&C",
                never: "Nunca entraron",
              };
              return [val, labels[name] ?? name];
            }}
          />
          <Bar dataKey="accepted" stackId="a" fill="#10B981" radius={[0, 0, 0, 0]} />
          <Bar dataKey="noTerms" stackId="a" fill="#F59E0B" />
          <Bar dataKey="never" stackId="a" fill="#E2E8F0" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
