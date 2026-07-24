import { Skeleton, SkeletonCard } from "@/core/components/ui/Skeleton";

export default function AdoptionGamificationSkeleton() {
  return (
    <div className="animate-pulse space-y-6">
      <div>
        <Skeleton height="h-8" width="w-64" />
        <Skeleton height="h-4" width="w-96" className="mt-2" />
      </div>

      <Skeleton height="h-24" width="w-full" rounded="2xl" />

      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-12 grid grid-cols-1 sm:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <SkeletonCard key={i} className="border border-slate-200 shadow-sm" />
          ))}
        </div>

        <div className="col-span-12 lg:col-span-7 bg-white p-6 rounded-xl border border-slate-200 shadow-sm h-80 flex items-center justify-around">
          <Skeleton height="h-48" width="w-48" rounded="full" />
          <div className="space-y-4 w-1/3">
            <Skeleton height="h-4" width="w-full" />
            <Skeleton height="h-4" width="w-3/4" />
          </div>
        </div>

        <div className="col-span-12 lg:col-span-5 bg-white p-6 rounded-xl border border-slate-200 shadow-sm h-80 flex flex-col justify-center gap-6">
          <Skeleton height="h-6" width="w-48" />
          <Skeleton height="h-4" width="w-full" rounded="full" />
          <div className="flex gap-4">
            <Skeleton height="h-16" width="w-1/2" rounded="lg" />
            <Skeleton height="h-16" width="w-1/2" rounded="lg" />
          </div>
        </div>

        <div className="col-span-12 bg-white p-6 rounded-xl border border-slate-200 shadow-sm h-80 space-y-4">
          <Skeleton height="h-5" width="w-48" className="mb-6" />
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} height="h-12" width="w-full" />
          ))}
        </div>
      </div>
    </div>
  );
}
