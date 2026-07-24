import { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  useEligibilityQuery,
  useReserveClaimMutation,
} from "../services/rewardClaimServices";
import { ReservingModal } from "../components/claims/ReservingModal";
import { EligibilityBlockedModal } from "../components/claims/EligibilityBlockedModal";
import { sellerKeys } from "../services/sellerServices";
import { useQueryClient } from "@tanstack/react-query";
import { rewardKeys } from "@/feature/rewards/services/rewardServices";

export default function ClaimEntryView() {
  const queryClient = useQueryClient();
  const { rewardId } = useParams<{ rewardId: string }>();
  const navigate = useNavigate();
  const id = Number(rewardId);

  const { data, isLoading } = useEligibilityQuery(id);
  const eligibility = data ?? null;

  const invalidateQuerys = async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: sellerKeys.dashboard() }),
      queryClient.invalidateQueries({ queryKey: rewardKeys.all }),
    ]);
  };

  const {
    mutate: reserve,
    isPending: isReserving,
    error: reserveError,
  } = useReserveClaimMutation({
    onSuccess: async (claim) => {
      await invalidateQuerys();
      if (eligibility?.hasShippingData) {
        navigate(`/rewards/claim/${id}/${claim.id}/confirm`, { replace: true });
      } else {
        navigate(`/rewards/claim/${id}/${claim.id}/shipping`, {
          replace: true,
        });
      }
    },
    onError: async () => {
      await invalidateQuerys();
    },
  });

  useEffect(() => {
    if (!eligibility) return;

    if (eligibility.canClaim) {
      reserve(id);
      return;
    }

    const pendingReason = eligibility.reasons.find(
      (r) => r.code === "already_reserved" && r.claimId
    );

    if (pendingReason?.claimId) {
      invalidateQuerys().then(() => {
        if (eligibility.hasShippingData) {
          navigate(`/rewards/claim/${id}/${pendingReason.claimId}/confirm`, {
            replace: true,
          });
        } else {
          navigate(`/rewards/claim/${id}/${pendingReason.claimId}/shipping`, {
            replace: true,
          });
        }
      });
    }
  }, [eligibility]);

  const isModalOpen =
    isLoading || (eligibility?.canClaim && isReserving) || !!reserveError;
  const isBlocked =
    !!eligibility &&
    !eligibility.canClaim &&
    !eligibility.reasons.some((r) => r.code === "already_reserved");

  return (
    <>
      <ReservingModal
        open={isModalOpen!}
        isReserving={isReserving}
        errorMessage={reserveError?.message}
        onBack={() => navigate("/rewards", { replace: true })}
      />
      <EligibilityBlockedModal
        open={isBlocked}
        eligibility={eligibility}
        onClose={() => navigate("/rewards", { replace: true })}
      />
    </>
  );
}
