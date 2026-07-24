export default function TopActionsPanel({
  data,
}: {
  data: { action: string; occurrences: number }[];
}) {
  const max = Math.max(...data.map((a) => a.occurrences), 1);

  return (
    <div className="col-span-12 lg:col-span-4 bg-white rounded-xl border border-slate-100 shadow-sm p-6 flex flex-col">
      <div className="mb-5">
        <h3 className="font-bold text-slate-900">Top Acciones</h3>
        <p className="text-xs text-slate-500">
          Actividad más frecuente del sistema hoy
        </p>
      </div>
      <div className="space-y-4">
        {data.map((item) => {
          const pct = Math.round((item.occurrences / max) * 100);
          return (
            <div key={item.action} className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between gap-2">
                <span className="text-[11px] font-mono text-slate-600 truncate max-w-[72%]">
                  {item.action}
                </span>
                <span className="text-xs font-black text-primary tabular-nums">
                  {item.occurrences.toLocaleString()}
                </span>
              </div>
              <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary rounded-full transition-all duration-700"
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>
          );
        })}
        {data.length === 0 && (
          <p className="text-xs text-slate-400 italic py-4 text-center">
            Sin actividad registrada hoy
          </p>
        )}
      </div>
    </div>
  );
}
