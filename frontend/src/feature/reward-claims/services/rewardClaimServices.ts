import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getRewardClaim, getRewardClaims, updateRewardClaim } from "../api/RewardClaimAPI";
import type { UpdateRewardClaimData } from "../schema/rewardClaim";
import { handleApiError } from "@/core/utils/handleErrors";
import { toast } from "react-toastify";

export const claimKeys = {
  all: () => ["reward-claims"] as const,
  list: (page: number, perPage: number) =>
    [...claimKeys.all(), "list", { page, perPage }] as const,
  detail: (id: number) => ["reward-claims", id] as const,
  eligibility: (rewardId: number) => ["reward-eligibility", rewardId] as const,
};

export function useRewardClaimsQuery(page: number, perPage: number) {
  return useQuery({
    queryKey: claimKeys.list(page, perPage),
    queryFn: () => getRewardClaims(page, perPage),
    staleTime: 60_000,
  });
}

export function useRewardClaimDetailsQuery(claimId: number) {
  return useQuery({
    queryKey: claimKeys.detail(claimId),
    queryFn: () => getRewardClaim(claimId),
    retry: false,
    staleTime: 30_000,
  });
}

export function useUpdateRewardClaimMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateRewardClaimData }) =>
      updateRewardClaim(id, data),
    onSuccess: (data, variables) => {
      toast.success(data.message || "Se ha actualizado correctamente la reclamación.")
      queryClient.invalidateQueries({ queryKey: claimKeys.all() });
      queryClient.invalidateQueries({
        queryKey: claimKeys.detail(variables.id),
      });
    },
    onError: (error) => {
      handleApiError(error, undefined, "Ha ocurrido un error al actualizar la reclamación.")
    }
  });
}
