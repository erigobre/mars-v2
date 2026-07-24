import { MdClose } from "react-icons/md";
import { BaseModal } from "@/core/components/ui/Modal/BaseModal";
import type { RewardClaim } from "@/feature/reward-claims/schema/rewardClaim";
import RewardClaimPendingCard from "./RewardClaimPendingCard";

type Props = {
  open: boolean;
  onClose: () => void;
  claims: RewardClaim[];
};

export function PendingClaimsModal({ open, onClose, claims }: Props) {

  return (
    <BaseModal open={open} onClose={onClose} maxWidth="md">
      <div className="bg-white rounded-t-2xl md:rounded-2xl w-full overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 flex items-center justify-between border-b border-slate-200">
          <h2 className="text-xl md:text-2xl font-black text-slate-900">
            Canjes Pendientes
          </h2>
          <button
            onClick={onClose}
            className="w-10 h-10 flex items-center justify-center rounded-full bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors"
          >
            <MdClose className="text-xl" />
          </button>
        </div>

        {/* Content Area */}
        <div className="px-6 py-4 space-y-4 overflow-y-auto pb-8">
          {claims.map((claim) => (
            <RewardClaimPendingCard key={claim.id} claim={claim} onClose={onClose} />
          ))}
        </div>

        {/* Bottom Safety Area para móviles */}
        <div className="h-6 md:hidden bg-white"></div>
      </div>
    </BaseModal>
  );
}
