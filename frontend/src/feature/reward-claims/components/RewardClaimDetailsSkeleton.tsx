import { Skeleton, SkeletonText } from "@/core/components/ui/Skeleton";

export default function RewardClaimDetailsSkeleton() {
  return (
    <div className="space-y-8 animate-pulse">
      {/* Header Section Skeleton */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-3 flex-wrap">
            <Skeleton className="h-10 w-64 md:w-80 rounded-lg" />
            <Skeleton className="h-7 w-32 rounded-full" />
          </div>
          <div className="flex items-center gap-4">
            <Skeleton className="h-4 w-40 rounded" />
            <Skeleton className="h-4 w-24 rounded" />
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Skeleton className="h-11 w-32 rounded-xl" />
          <Skeleton className="h-11 w-36 rounded-xl" />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Columna Izquierda: Información y Usuario */}
        <div className="lg:col-span-2 space-y-8">
          {/* Sección: Información del Canje */}
          <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
            <div className="px-6 py-4 border-b border-gray-50 bg-gray-50/30">
              <Skeleton className="h-6 w-48 rounded" />
            </div>
            <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-8">
              {[1, 2, 3].map((i) => (
                <div key={i} className="space-y-2">
                  <Skeleton className="h-3 w-20 rounded" />
                  <Skeleton className="h-5 w-32 rounded" />
                </div>
              ))}
            </div>
          </div>

          {/* Sección: Detalle del Usuario */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-50 bg-gray-50/30">
              <Skeleton className="h-6 w-44 rounded" />
            </div>
            <div className="p-8">
              <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
                <Skeleton className="w-24 h-24 rounded-3xl shrink-0" />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-12 flex-1 w-full">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="space-y-2">
                      <Skeleton className="h-3 w-24 rounded mx-auto md:mx-0" />
                      <Skeleton className="h-6 w-40 rounded mx-auto md:mx-0" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Sección: Seguimiento Interno */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-50 bg-gray-50/30 flex justify-between">
              <Skeleton className="h-6 w-40 rounded" />
              <Skeleton className="h-4 w-24 rounded" />
            </div>
            <div className="p-6">
              <div className="bg-gray-50 p-6 rounded-2xl space-y-3">
                <SkeletonText lines={2} />
              </div>
            </div>
          </div>
        </div>

        {/* Columna Derecha: Producto / Premio */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-xl overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-50 bg-gray-50/30">
              <Skeleton className="h-6 w-40 rounded" />
            </div>
            <div className="p-6 space-y-6">
              <Skeleton className="aspect-square w-full rounded-2xl" />
              <div className="space-y-3">
                <Skeleton className="h-8 w-3/4 rounded" />
                <SkeletonText lines={3} />
              </div>

              <div className="pt-4 border-t border-gray-100 flex justify-between items-center">
                <Skeleton className="h-4 w-24 rounded" />
                <Skeleton className="h-8 w-20 rounded" />
              </div>

              <Skeleton className="h-10 w-full rounded-xl" />
            </div>

            {/* Action Buttons Skeleton */}
            <div className="p-4 bg-gray-50 border-t border-gray-100 space-y-3">
              <Skeleton className="h-14 w-full rounded-xl" />
              <Skeleton className="h-14 w-full rounded-xl" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
