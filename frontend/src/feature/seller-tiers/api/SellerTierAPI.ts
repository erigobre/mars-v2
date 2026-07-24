import api from "@/core/api/axios";
import type {
  SellerTier,
  SellerTierFilters,
  SellerTierFormData,
} from "../schemas/sellerTier";
import { type ApiResponse, type PaginatedData } from "@/core/types";
import { cleanObj } from "@/core/utils/cleanObj";

export const getSellerTiers = async (params: {
  page: number;
  per_page: number;
  filters: SellerTierFilters;
}) => {
  const { data } = await api.get<ApiResponse<PaginatedData<SellerTier[]>>>(
    "/admin/seller-tiers",
    {
      params: cleanObj({
        page: params.page,
        per_page: params.per_page,
        ...params.filters,
      }),
    },
  );
  return data.data;
};

export const getSellerTierById = async (id: number) => {
  const { data } = await api.get<ApiResponse<SellerTier>>(
    `/admin/seller-tiers/${id}`,
  );
  return data.data;
};

export const createSellerTier = async (
  payload: Partial<SellerTierFormData>,
) => {
  const { data } = await api.post<ApiResponse<SellerTier>>(
    "/admin/seller-tiers",
    payload,
  );
  return data;
};

export const updateSellerTier = async (
  id: number,
  payload: Partial<SellerTierFormData>,
) => {
  const { data } = await api.put<ApiResponse<SellerTier>>(
    `/admin/seller-tiers/${id}`,
    payload,
  );
  return data;
};

export const deleteSellerTier = async (id: number) => {
  const { data } = await api.delete<ApiResponse<any>>(`/admin/seller-tiers/${id}`);
  return data;
};

export const recalculateSellerTiers = async () => {
  const { data } = await api.post<ApiResponse<any>>(
    "/admin/seller-tiers/recalculate",
  );
  return data;
};
