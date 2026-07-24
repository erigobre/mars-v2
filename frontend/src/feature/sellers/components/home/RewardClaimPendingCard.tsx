import type { RewardClaim } from "@/feature/reward-claims/schema/rewardClaim";
import { useNavigate } from "react-router-dom";

type RewardClaimPendingCardProps = {
  claim: RewardClaim;
  onClose?: () => void;
};

export default function RewardClaimPendingCard({ claim, onClose } : RewardClaimPendingCardProps) {
  const navigate = useNavigate();

  const handleConfirm = (claim: RewardClaim) => {
    navigate(`/rewards/claim/${claim.reward.id}/${claim.id}/confirm`);
    if(onClose) onClose()
  };
  return (
    <div
      key={claim.id}
      className="flex items-center gap-4 p-4 rounded-2xl bg-slate-100 border border-slate-200 hover:border-primary/30 transition-all"
    >
      <div className="w-20 h-20 rounded-xl overflow-hidden shrink-0 border border-white shadow-sm">
        <img
          className="w-full h-full object-cover"
          src={claim.reward.image || "/placeholder-reward.png"}
          alt={claim.reward.name}
        />
      </div>
      <div className="flex-1 flex flex-col gap-2 justify-between min-h-20">
        <div className="space-y-1">
          <p className="text-slate-900 font-black text-lg leading-tight line-clamp-1">
            {claim.reward.name}
          </p>
          <p className="text-slate-500 font-mono text-xs mt-1 uppercase">
            Folio: {claim.folio}
          </p>
        </div>
        <button
          onClick={() => handleConfirm(claim)}
          className="bg-primary hover:bg-primary/90 text-white font-black w-full py-2 px-6 rounded-xl text-sm transition-transform active:scale-95"
        >
          Confirmar
        </button>
      </div>
    </div>
  );
}
