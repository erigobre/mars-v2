import { formatDate } from "@/core/utils/formatDate";
import type { RecentLogin } from "../../schemas/dailyUsageAnalytics";

function timeAgo(isoString: string): string {
  const diff = Date.now() - new Date(isoString).getTime();
  const mins = Math.floor(diff / 60_000);
  if (mins < 1) return "Ahora mismo";
  if (mins < 60) return `Hace ${mins} min`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `Hace ${hours}h`;
  return formatDate(isoString, {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getInitials(name: string) {
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

function resolveRole(role: unknown): string {
  if (!role) return "—";
  if (typeof role === "string") return role;
  if (typeof role === "object" && role !== null) {
    const obj = role as Record<string, unknown>;
    return String(obj.slug ?? obj.name ?? "—");
  }
  return String(role);
}

function resolveTier(tier: unknown): string | null {
  if (!tier) return null;
  if (typeof tier === "string") return tier;
  if (typeof tier === "object" && tier !== null) {
    const obj = tier as Record<string, unknown>;
    return String(obj.slug ?? obj.name ?? "");
  }
  return String(tier);
}

export default function RecentLoginsPanel({ data }: { data: RecentLogin[] }) {
  return (
    <div className="col-span-12 lg:col-span-8 bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
      <div className="px-6 py-4 border-b border-slate-100">
        <h3 className="font-bold text-slate-900">Últimos Accesos</h3>
        <p className="text-xs text-slate-500">
          Los {data.length} ingresos más recientes del día
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-slate-50 border-b border-slate-100">
            <tr>
              {["Usuario", "Rol / Nivel", "IP / Dispositivo", "Hora"].map(
                (h) => (
                  <th
                    key={h}
                    className="px-4 py-3 text-[10px] font-black text-slate-500 uppercase tracking-widest"
                  >
                    {h}
                  </th>
                ),
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {data.map((log) => {
              const role = resolveRole(log.role);
              const tier = resolveTier(log.tier);
              return (
                <tr
                  key={log.id}
                  className="hover:bg-slate-50/70 transition-colors"
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2.5">
                      {log.avatarUrl ? (
                        <img
                          src={log.avatarUrl}
                          alt={log.userName ?? "Avatar"}
                          className="w-8 h-8 rounded-full object-cover shrink-0"
                        />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center text-[10px] font-black shrink-0 select-none">
                          {getInitials(log.userName ?? "Usuario")}
                        </div>
                      )}
                      <span className="text-sm font-semibold text-slate-900 leading-tight">
                        {log.userName}
                      </span>
                    </div>
                  </td>

                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-[10px] font-bold bg-blue-50 text-primary px-2 py-0.5 rounded-full capitalize">
                        {role}
                      </span>
                      {tier && (
                        <span className="text-[10px] font-bold bg-amber-50 text-amber-600 px-2 py-0.5 rounded-full capitalize">
                          {tier}
                        </span>
                      )}
                    </div>
                  </td>

                  <td className="px-4 py-3">
                    <span className="text-xs text-slate-400 font-mono">
                      {log.device}
                    </span>
                  </td>

                  <td className="px-4 py-3">
                    <span className="text-xs text-slate-500">
                      {timeAgo(log.timestamp)}
                    </span>
                  </td>
                </tr>
              );
            })}

            {data.length === 0 && (
              <tr>
                <td
                  colSpan={4}
                  className="text-center py-10 text-sm text-slate-400"
                >
                  No hay accesos registrados hoy
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
