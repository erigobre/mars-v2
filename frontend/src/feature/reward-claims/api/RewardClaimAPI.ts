import api from "@/core/api/axios";
import type { ApiResponse, PaginatedData } from "@/core/types";
import { safeValidate } from "@/core/utils/zodHelper";
import {
  type RewardClaim,
  rewardClaimsArraySchema,
  rewardClaimSchema,
  type UpdateRewardClaimData,
} from "../schema/rewardClaim";

export async function getRewardClaims(page: number, perPage: number) {
  const { data } = await api.get<ApiResponse<PaginatedData<RewardClaim[]>>>(
    "/reward-claims",
    {
      params: { page, per_page: perPage },
    }
  );
  safeValidate(rewardClaimsArraySchema, data.data.items);
  return data.data;
}

export async function getRewardClaim(claimId: number) {
  const { data } = await api.get<ApiResponse<RewardClaim>>(
    `/reward-claims/${claimId}`
  );
  safeValidate(rewardClaimSchema, data.data);
  return data.data;
}

export async function updateRewardClaim(
  claimId: RewardClaim["id"],
  formData: UpdateRewardClaimData
) {
  const { data } = await api.patch<ApiResponse<RewardClaim>>(
    `/reward-claims/${claimId}`,
    formData
  );
  return data;
}
