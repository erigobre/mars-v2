import api from "@/core/api/axios";
import { type ApiResponse } from "@/core/types";

export interface TierPriceMatrixData {
  tiers: {
    id: number;
    name: string;
    slug: string;
    color: string | null;
    icon: string | null;
    order: number;
  }[];
  categories: {
    value: number;
    label: string;
  }[];
  matrix: Record<number, Record<number, number | null>>;
  rewardCounts: Record<number, number>;
}

export const getTierPriceMatrix = async (distributorId: number) => {
  const { data } = await api.get<ApiResponse<TierPriceMatrixData>>(
    `/admin/distributors/${distributorId}/tier-price-matrix`
  );
  return data.data;
};

export interface BulkPriceRule {
  base_cost: number;
  tier_id: number;
  price_in_points: number;
}

export const updateBulkTierPrices = async (
  distributorId: number,
  rules: BulkPriceRule[]
) => {
  const { data } = await api.post<ApiResponse<{ total_updated: number }>>(
    `/admin/distributors/${distributorId}/bulk-tier-prices`,
    { rules }
  );
  return data;
};
