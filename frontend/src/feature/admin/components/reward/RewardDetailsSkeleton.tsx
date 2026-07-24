import { Skeleton, SkeletonText } from "@/core/components/ui/Skeleton";

export default function RewardDetailsSkeleton() {
  return (
    <div className="space-y-6">
      {/* Header card skeleton */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex flex-col md:flex-row gap-8">
          <Skeleton className="w-full md:w-48 h-48 rounded-xl shrink-0" />
          <div className="flex-1 space-y-4 pt-2">
            <div className="space-y-2">
              <Skeleton className="h-3 w-24 rounded" />
              <Skeleton className="h-8 w-2/3 rounded" />
            </div>
            <SkeletonText lines={2} />
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-2">
              {[1, 2, 3, 4].map((n) => (
                <div key={n} className="space-y-1">
                  <Skeleton className="h-3 w-20 rounded" />
                  <Skeleton className="h-6 w-16 rounded" />
                </div>
              ))}
            </div>
            <div className="flex gap-3 pt-2">
              <Skeleton className="h-10 w-32 rounded-lg" />
              <Skeleton className="h-10 w-40 rounded-lg" />
            </div>
          </div>
        </div>
      </div>

      {/* Stats grid skeleton */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((n) => (
          <div
            key={n}
            className="bg-white rounded-xl border border-gray-200 p-6 space-y-3"
          >
            <div className="flex justify-between">
              <Skeleton className="h-4 w-24 rounded" />
              <Skeleton className="h-9 w-9 rounded-lg" />
            </div>
            <Skeleton className="h-7 w-20 rounded" />
          </div>
        ))}
      </div>

      {/* Claims table skeleton */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="p-5 border-b border-gray-100 flex justify-between">
          <Skeleton className="h-5 w-40 rounded" />
          <div className="flex gap-2">
            <Skeleton className="h-9 w-20 rounded-lg" />
            <Skeleton className="h-9 w-24 rounded-lg" />
          </div>
        </div>
        <div className="p-6 space-y-4">
          {[1, 2, 3, 4].map((n) => (
            <Skeleton key={n} className="h-14 w-full rounded-lg" />
          ))}
        </div>
      </div>
    </div>
  );
}
