import { Skeleton } from "@/core/components/ui/Skeleton";

export default function SalesPerformanceSkeleton() {
  return (
    <div className="animate-pulse space-y-6">
      <div>
        <Skeleton height="h-8" width="w-64" />
        <Skeleton height="h-4" width="w-96" className="mt-2" />
      </div>

      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-co">
        <Skeleton height="h-24" width="w-full" rounded="2xl" />
      </div>

      <div className="grid grid-cols-12 gap-8">
        <div className="col-span-12 lg:col-span-8 bg-white p-6 rounded-xl border border-slate-200 shadow-sm h-96 flex flex-col">
          <div className="flex justify-between mb-8">
            <div className="space-y-2">
              <Skeleton height="h-5" width="w-48" />
              <Skeleton height="h-3" width="w-64" />
            </div>
          </div>
          <div className="space-y-6 flex-1">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Skeleton height="h-8" width="w-8" rounded="full" />
                  <Skeleton height="h-4" width="w-32" />
                </div>
                <Skeleton height="h-2" width="w-24" />
                <Skeleton height="h-4" width="w-16" />
              </div>
            ))}
          </div>
        </div>

        <div className="col-span-12 lg:col-span-4 bg-white p-6 rounded-xl border border-slate-200 shadow-sm h-96 flex flex-col items-center justify-center gap-6">
          <div className="w-full space-y-2 mb-4">
            <Skeleton height="h-5" width="w-40" />
            <Skeleton height="h-3" width="w-32" />
          </div>
          <Skeleton height="h-48" width="w-48" rounded="full" />
        </div>
      </div>

      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <div className="flex gap-6 overflow-hidden">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="space-y-3 min-w-55 shrink-0">
              <Skeleton height="h-55" width="w-full" rounded="xl" />
              <Skeleton height="h-4" width="w-3/4" />
              <Skeleton height="h-3" width="w-1/2" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
