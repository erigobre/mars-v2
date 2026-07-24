import { SkeletonStatCard, Skeleton } from "@/core/components/ui/Skeleton";

export default function MainColumnSkeleton() {
  const PeriodSection = (
    <div className="space-y-4">
      <div className="bg-white rounded-3xl border border-gray-100 p-6 space-y-6">
        <div className="flex justify-between">
          <div className="space-y-2">
            <Skeleton height="h-3" width="w-10" />
            <Skeleton height="h-5" width="w-24" />
          </div>
          <div className="space-y-2 items-end flex flex-col">
            <Skeleton height="h-3" width="w-10" />
            <Skeleton height="h-5" width="w-24" />
          </div>
        </div>
        <Skeleton height="h-3" width="w-full" rounded="full" />
        <Skeleton height="h-12" width="w-full" rounded="2xl" />
      </div>
    </div>
  );

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
      {/* Izquierda: stats + botón */}
      <div className="md:col-span-2 space-y-8">
        <div className="grid grid-cols-2 gap-4">
          <SkeletonStatCard />
          <SkeletonStatCard />
        </div>

        <div className="hidden md:block">{PeriodSection}</div>
      </div>

      {/* Derecha: PeriodSection + FeaturedCards */}
      <div className="space-y-8">
        {/* FeaturedCard skeleton */}
        <div className="bg-white rounded-3xl border border-gray-100 overflow-hidden">
          <Skeleton height="h-44" width="w-full" rounded="sm" />
          <div className="p-5 flex justify-between items-center">
            <Skeleton height="h-5" width="w-28" />
            <Skeleton height="h-10" width="w-10" rounded="full" />
          </div>
        </div>
        <div className="bg-white rounded-3xl border border-gray-100 overflow-hidden">
          <Skeleton height="h-44" width="w-full" rounded="sm" />
          <div className="p-5 flex justify-between items-center">
            <Skeleton height="h-5" width="w-28" />
            <Skeleton height="h-10" width="w-10" rounded="full" />
          </div>
        </div>

        <div className="md:hidden">{PeriodSection}</div>

      </div>
    </div>
  );
}
