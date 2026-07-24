import { useMutation, useQuery } from "@tanstack/react-query";
import type { UseFormSetError } from "react-hook-form";
import { handleApiError } from "@/core/utils/handleErrors";
import type { ShippingFormData } from "../schemas/rewardClaim";
import { checkEligibility, reserveClaim, confirmClaim, cancelClaim, downloadReceipt } from "../api/RewardClaimAPI";
import type { RewardClaim } from "@/feature/reward-claims/schema/rewardClaim";
import { claimKeys } from "@/feature/reward-claims/services/rewardClaimServices";
import { toast } from "react-toastify";

export function useEligibilityQuery(rewardId: number) {
  return useQuery({
    queryKey: claimKeys.eligibility(rewardId),
    queryFn: () => checkEligibility(rewardId),
    retry: false,
    staleTime: 0,
  });
}

export function useReserveClaimMutation({
  onSuccess,
  onError
}: {
  onSuccess: (claim: RewardClaim) => void;
  onError: () => void;
}) {
  return useMutation({
    mutationFn: (rewardId: number) => reserveClaim(rewardId),
    onSuccess: (data) => onSuccess(data.data),
    onError: onError
  });
}

export function useConfirmClaimMutation({
  claimId,
  setError,
  onSuccess,
}: {
  claimId: number;
  setError: UseFormSetError<ShippingFormData>;
  onSuccess: (claim: RewardClaim) => void;
}) {
  return useMutation({
    mutationFn: (shipping: ShippingFormData) => confirmClaim(claimId, shipping),
    onSuccess: (data) => onSuccess(data.data),
    onError: (error) =>
      handleApiError(error, setError, "Error al confirmar el canje"),
  });
}

export function useCancelClaimMutation({
  onSuccess,
}: {
  onSuccess?: () => void;
}) {
  return useMutation({
    mutationFn: (claimId: number) => cancelClaim(claimId),
    onSuccess: () => onSuccess?.(),
  });
}

export function useDownloadReceiptMutation() {
  return useMutation({
    mutationFn: (claim: RewardClaim) => downloadReceipt(claim),
    onSuccess: () => {
      toast.success("Comprobante descargado correctamente.");
    },
    onError: (error) => {
      console.error(error);
      toast.error("Hubo un error al descargar el comprobante.");
    },
  });
}