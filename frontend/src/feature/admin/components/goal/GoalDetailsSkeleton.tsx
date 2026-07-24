import { Skeleton, SkeletonText } from "@/core/components/ui/Skeleton";

export default function GoalDetailsSkeleton() {
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex flex-col md:flex-row gap-6">
          <Skeleton className="w-24 h-24 rounded-xl shrink-0" />
          <div className="flex-1 space-y-4 pt-2">
            <div className="space-y-2">
              <Skeleton className="h-3 w-32 rounded" />
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
          </div>
        </div>
      </div>

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
    </div>
  );
}
