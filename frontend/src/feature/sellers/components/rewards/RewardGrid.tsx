import { Button } from "@/core/components/ui";
import RewardCard from "./RewardCard";
import type { Reward } from "@/feature/rewards/schemas/reward";
// import { SkeletonCard } from "@/core/components/ui/Skeleton";
import { DotsLoader } from "@/core/components/common/DotsLoader";
import { FadeUp } from "@/core/components/common/FadeUp";

type RewardGridProps = {
  isLoading: boolean;
  rewards: Reward[];
  isStoreOpen: boolean;
  userPoints: number;
  onRedeem: (reward: Reward) => void;
  onClearFilters: () => void;
};

export default function RewardGrid({
  isLoading,
  rewards,
  isStoreOpen,
  userPoints,
  onRedeem,
  onClearFilters,
}: RewardGridProps) {
  if (isLoading) {
    return (
      // <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
      //   {[1, 2, 3].map((n) => (
      //     <SkeletonCard key={n} />
      //   ))}
      // </div>
      <DotsLoader />
    );
  }

  if (rewards.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 py-20 flex flex-col items-center gap-3 text-gray-400">
        <p className="text-sm font-medium">No hay premios con estos filtros.</p>
        <Button
          variant="ghost"
          size="sm"
          onClick={onClearFilters}
          className="text-sm text-primary"
        >
          Limpiar filtros
        </Button>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {rewards.map((reward) => (
        <FadeUp key={reward.id} className="h-full">
          <RewardCard
            key={reward.id}
            reward={reward}
            isStoreOpen={isStoreOpen}
            userPoints={userPoints}
            onRedeem={onRedeem}
          />
        </FadeUp>
      ))}
    </div>
  );
}
