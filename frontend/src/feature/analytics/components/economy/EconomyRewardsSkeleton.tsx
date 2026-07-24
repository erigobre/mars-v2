import { Skeleton, SkeletonCard } from "@/core/components/ui/Skeleton";

export default function EconomyRewardsSkeleton() {
  return (
    <div className="animate-pulse space-y-6">
      <div>
        <Skeleton height="h-8" width="w-64" />
        <Skeleton height="h-4" width="w-96" className="mt-2" />
      </div>

      <Skeleton height="h-24" width="w-full" rounded="2xl" />

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 lg:gap-6">
        {[1, 2, 3, 4].map((i) => (
          <SkeletonCard key={i} className="border border-slate-200 shadow-sm" />
        ))}
      </div>

      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-12 lg:col-span-8 bg-white p-6 rounded-xl border border-slate-200 shadow-sm h-80 flex items-end gap-2">
          {[...Array(10)].map((_, i) => (
            <Skeleton
              key={i}
              height={`h-[${Math.floor(Math.random() * 60 + 20)}%]`}
              width="w-full"
            />
          ))}
        </div>

        <div className="col-span-12 lg:col-span-4 bg-white p-6 rounded-xl border border-slate-200 shadow-sm h-80 space-y-6">
          <Skeleton height="h-5" width="w-32" className="mb-4" />
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex gap-3">
              <Skeleton height="h-12" width="w-12" rounded="lg" />
              <div className="flex-1 space-y-2">
                <Skeleton height="h-4" width="w-full" />
                <Skeleton height="h-3" width="w-1/2" />
              </div>
            </div>
          ))}
        </div>

        <div className="col-span-12 lg:col-span-5 bg-white p-6 rounded-xl border border-slate-200 shadow-sm h-96">
          <Skeleton height="h-full" width="w-full" />
        </div>

        <div className="col-span-12 lg:col-span-7 bg-white p-6 rounded-xl border border-slate-200 shadow-sm h-96 space-y-4">
          <Skeleton height="h-5" width="w-48" className="mb-6" />
          {[1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} height="h-10" width="w-full" />
          ))}
        </div>
      </div>
    </div>
  );
}
