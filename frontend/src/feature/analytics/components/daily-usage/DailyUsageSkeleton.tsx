import { Skeleton } from "@/core/components/ui/Skeleton";

export default function DailyUsageSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 lg:gap-6">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} height="h-28" rounded="xl" />
        ))}
      </div>
      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-12 lg:col-span-8">
          <Skeleton height="h-72" rounded="xl" />
        </div>
        <div className="col-span-12 lg:col-span-4">
          <Skeleton height="h-72" rounded="xl" />
        </div>
      </div>
      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-12 lg:col-span-4">
          <Skeleton height="h-64" rounded="xl" />
        </div>
        <div className="col-span-12 lg:col-span-8">
          <Skeleton height="h-64" rounded="xl" />
        </div>
      </div>
    </div>
  );
}
