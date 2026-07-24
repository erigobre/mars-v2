import { Skeleton } from "./Skeleton";
import { SkeletonText } from "./SkeletonText";

export function SkeletonCard({ className = "" }: { className?: string }) {
  return (
    <div
      className={`bg-white rounded-2xl border border-gray-100 p-6 space-y-4 ${className}`}
    >
      <Skeleton height="h-5" width="w-2/5" />
      <SkeletonText lines={3} />
    </div>
  );
}
