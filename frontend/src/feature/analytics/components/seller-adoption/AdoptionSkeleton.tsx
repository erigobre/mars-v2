import { Skeleton } from "@/core/components/ui/Skeleton";

export function AdoptionSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} height="h-32" rounded="2xl" />
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Skeleton height="h-72" rounded="2xl" />
        <Skeleton height="h-72" rounded="2xl" />
      </div>
      <Skeleton height="h-56" rounded="2xl" />
      <Skeleton height="h-64" rounded="2xl" />
    </div>
  );
}
