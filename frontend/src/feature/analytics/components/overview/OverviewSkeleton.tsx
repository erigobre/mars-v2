import { Skeleton, SkeletonCard } from "@/core/components/ui/Skeleton";

export default function OverviewSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8 gap-4">
        <div>
          <Skeleton height="h-8" width="w-48" />
          <Skeleton height="h-4" width="w-80" className="mt-2" />
        </div>
      </div>

      {/* Fila 1: KPIs (Simulando las 4 cards superiores) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <SkeletonCard key={i} className="h-44" />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
        {/* Simulación del Gráfico de Ventas Globales (Ocupa 2 columnas) */}
        <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-slate-200 shadow-sm h-87.5 flex flex-col gap-4">
          <div className="flex justify-between">
            <div className="space-y-2">
              <Skeleton height="h-5" width="w-40" />
              <Skeleton height="h-3" width="w-32" />
            </div>
            <Skeleton height="h-6" width="w-6" rounded="full" />
          </div>
          <div className="flex-1 flex items-end gap-2 pb-4">
            {/* Barras de gráfico falsas */}
            {[60, 80, 40, 100, 70, 90].map((h, i) => (
              <Skeleton
                key={i}
                height={`h-[${h}%]`}
                width="w-full"
                rounded="sm"
              />
            ))}
          </div>
        </div>

        {/* Simulación del Ranking (Ocupa 1 columna) */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm h-87.5 flex flex-col overflow-hidden">
          <div className="flex justify-between mb-8">
            <Skeleton height="h-5" width="w-32" />
            <Skeleton height="h-5" width="w-12" rounded="full" />
          </div>
          <div className="space-y-6">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-center gap-3">
                <Skeleton height="h-10" width="w-10" rounded="full" />
                <div className="flex-1 space-y-2">
                  <Skeleton height="h-3" width="w-3/4" />
                  <Skeleton height="h-2" width="w-1/2" />
                </div>
                <Skeleton height="h-4" width="w-12" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
