import { Skeleton } from "@/core/components/ui/Skeleton";

export default function TopRowSkeleton() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
      {/* GoalCard skeleton */}
      <div className="col-span-2 bg-white rounded-2xl border border-gray-100 p-6 space-y-4">
        <div className="flex items-end justify-between">
          <div className="space-y-2">
            <Skeleton height="h-6" width="w-40" rounded="xl" />
            <Skeleton height="h-3.5" width="w-52" />
          </div>
          <Skeleton height="h-8" width="w-12" rounded="xl" />
        </div>
        <Skeleton height="h-3" width="w-full" rounded="full" />
        <div className="flex justify-center">
          <Skeleton height="h-8" width="w-36" rounded="full" />
        </div>
      </div>

      {/* PointsCard skeleton */}
      <div className="col-span-2 md:col-span-1 bg-linear-to-t from-blue-800 to-primary rounded-2xl p-7 space-y-4 flex flex-col items-center">
        <Skeleton height="h-4" width="w-36" className="bg-white/40" />
        <Skeleton
          height="h-20"
          width="w-28"
          rounded="xl"
          className="bg-white/40"
        />
        <Skeleton
          height="h-8"
          width="w-40"
          rounded="full"
          className="bg-white/30"
        />
      </div>
    </div>
  );
}