import {
  MdClose,
  MdErrorOutline,
  MdInfo,
  MdLock,
  MdWarning,
} from "react-icons/md";
import type { Eligibility } from "../../schemas/rewardClaim";
import { BaseModal } from "@/core/components/ui/Modal/BaseModal";
import RewardClaimPendingCard from "../home/RewardClaimPendingCard";

type Props = {
  open: boolean;
  eligibility: Eligibility | null;
  onClose: () => void;
};

function ReasonIcon({ code }: { code: string }) {
  if (
    code.includes("window") ||
    code.includes("cycle") ||
    code.includes("reserved")
  )
    return <MdLock className="text-amber-400 text-xl shrink-0 mt-0.5" />;
  if (code.includes("stock") || code.includes("points"))
    return <MdWarning className="text-red-400 text-xl shrink-0 mt-0.5" />;
  return <MdInfo className="text-slate-400 text-xl shrink-0 mt-0.5" />;
}

export function EligibilityBlockedModal({ open, eligibility, onClose }: Props) {
  if (!eligibility) return null;

  return (
    <BaseModal open={open} onClose={onClose} maxWidth="md">
      {/* Header */}
      <div className="relative bg-red-50 px-6 py-5 border-b border-red-100">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-7 h-7 bg-red-100 hover:bg-red-200 rounded-full flex items-center justify-center transition-colors"
        >
          <MdClose className="text-red-400 text-sm" />
        </button>
        <div className="flex items-center gap-3">
          <div className="bg-red-100 p-2.5 rounded-xl">
            <MdErrorOutline className="text-red-500 text-2xl" />
          </div>
          <div>
            <h3 className="font-extrabold text-slate-900">
              No puedes canjear este premio
            </h3>
            {eligibility.reward && (
              <p className="text-xs text-slate-500 mt-0.5">
                {eligibility.reward.name}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Reasons */}
      <div className="px-6 py-4 space-y-3">
        {eligibility.reasons.map((reason, i) => (
          <div
            key={i}
            className="flex items-start gap-3 bg-slate-50 rounded-xl p-3.5 border border-slate-100"
          >
            <ReasonIcon code={reason.code} />
            <div className="min-w-0">
              <p className="text-sm font-semibold text-slate-800">
                {reason.message}
              </p>
              {reason.detail && (
                <p className="text-xs text-slate-500 mt-0.5">{reason.detail}</p>
              )}
              {reason.expiresAt && (
                <p className="text-xs text-primary font-medium mt-1">
                  Disponible:{" "}
                  {new Date(reason.expiresAt).toLocaleDateString("es-MX", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>

      {eligibility.pendingClaim && (
        <div className="px-6 py-4 space-y-3">
          <RewardClaimPendingCard key={eligibility.pendingClaim.id} claim={eligibility.pendingClaim} />
        </div>
      )}


      {/* CTA */}
      <div className="px-6 pb-6">
        <button
          onClick={onClose}
          className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold py-3.5 rounded-2xl text-sm transition-colors"
        >
          Entendido
        </button>
      </div>
    </BaseModal>
  );
}
