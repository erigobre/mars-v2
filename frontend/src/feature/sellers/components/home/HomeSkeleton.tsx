import MainColumnSkeleton from "./MainColumnSkeleton";
import TopRowSkeleton from "./TopRowSkeleton";


export default function HomeSkeleton() {
  return (
    <div className="max-w-6xl mx-auto px-4 md:px-6 py-4 md:py-8 space-y-8">
      <TopRowSkeleton />
      <MainColumnSkeleton />
    </div>
  );
}
