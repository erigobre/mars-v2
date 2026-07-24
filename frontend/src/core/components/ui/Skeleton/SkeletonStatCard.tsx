import { Skeleton } from "./Skeleton";

export function SkeletonStatCard() {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-6 flex flex-col items-center gap-3">
      <Skeleton height="h-9" width="w-24" rounded="xl" />
      <Skeleton height="h-3" width="w-20" />
    </div>
  );
}
