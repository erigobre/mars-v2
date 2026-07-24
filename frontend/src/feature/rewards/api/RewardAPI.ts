import api from "@/core/api/axios";
import type { ApiResponse, PaginatedData } from "@/core/types";
import {
  rewardSchema,
  rewardTierPriceArraySchema,
  rewardsArraySchema,
  type Reward,
  type RewardFormData,
  type RewardTierPrice,
  type RewardTierPriceForm,
} from "../schemas/reward";
import { safeValidate } from "@/core/utils/zodHelper";
import type { GetRewardsParams } from "@/core/types/filters";
import { buildQueryParams } from "@/core/utils/apiHelpers";

export async function getRewards(params: GetRewardsParams) {

  const filterMappings = {
    minPoints: "points[gte]",
    maxPoints: "points[lte]",
    name: "name[like]",
    category: "category[in]",
    status: "status",
  };

  const { onlyAffordable, ...validFilters } = params.filters || {};

  if (validFilters.name) {
    validFilters.name = `%${validFilters.name}%`;
  }

  const cleanParams = buildQueryParams(
    { page: params.page, perPage: params.perPage, search: params.search },
    validFilters,
    filterMappings
  );

  const { data } = await api.get<ApiResponse<PaginatedData<Reward[]> & { categories: string[] }>>(
    "/rewards",
    { params: cleanParams }
  );
  safeValidate(rewardsArraySchema, data.data.items);
  return data.data;
}

export async function getTierPrices(id: Reward["id"]) {
  const { data } = await api.get<ApiResponse<RewardTierPrice[]>>(
    `/admin/rewards/${id}/tier-prices`
  );

  safeValidate(rewardTierPriceArraySchema, data.data);
  return data.data;
}

export async function updateTierPrices(
  id: Reward["id"],
  tierPrices: RewardTierPriceForm[]
) {
  const payload = {
    prices: tierPrices.map((price) => ({
      tier_id: price.tierId,
      price: price.price,
    })),
  }

  const { data } = await api.put<ApiResponse<RewardTierPrice[]>>(
    `/admin/rewards/${id}/tier-prices`,
    payload
  );
  return data.data;
}


export async function getRewardById(id: Reward["id"]) {
  const { data } = await api.get<ApiResponse<Reward>>(`/rewards/${id}`);
  return safeValidate(rewardSchema, data.data);
}

export async function createReward(
  formData: RewardFormData,
  imageFile?: File | null
) {
  const fd = buildFormData(formData, imageFile);
  const { data } = await api.post<ApiResponse<Reward>>("/admin/rewards", fd, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data;
}

export async function updateReward(
  id: Reward["id"],
  formData: RewardFormData,
  imageFile?: File | null
) {
  const fd = buildFormData(formData, imageFile);
  fd.append("_method", "PUT");
  const { data } = await api.post<ApiResponse<Reward>>(
    `/admin/rewards/${id}`,
    fd,
    { headers: { "Content-Type": "multipart/form-data" } }
  );
  return data;
}

export async function deleteReward(id: Reward["id"]) {
  const { data } = await api.delete<ApiResponse<null>>(`/admin/rewards/${id}`);
  return data;
}

function buildFormData(
  formData: RewardFormData,
  imageFile?: File | null
): FormData {
  const fd = new FormData();
  fd.append("name", formData.name);
  if (formData.description) fd.append("description", formData.description);
  fd.append("points_required", String(formData.pointsRequired));
  fd.append("stock", String(formData.stock));
  if (formData.category) fd.append("category", formData.category);
  fd.append("is_active", formData.isActive ? "1" : "0");
  fd.append("is_featured", formData.isFeatured ? "1" : "0");
  fd.append("visibility", formData.visibility);
  if (formData.maxGlobalClaims != null)
    fd.append("max_global_claims", String(formData.maxGlobalClaims));
  if (formData.baseCost != null)
    fd.append("base_cost", String(formData.baseCost));
  if (imageFile) fd.append("image", imageFile);
  return fd;
}
