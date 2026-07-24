import { Skeleton } from "./Skeleton";

export function SkeletonText({ lines = 3 }: { lines?: number }) {
  const widths = ["w-full", "w-5/6", "w-4/5", "w-3/4", "w-2/3", "w-1/2"];
  return (
    <div className="space-y-2.5">
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton key={i} height="h-3.5" width={widths[i % widths.length]} />
      ))}
    </div>
  );
}
