import api from "@/core/api/axios";
import type { ApiResponse, PaginatedData } from "@/core/types";
import { campaignSchema, campaingsArraySchema, type Campaign, type CampaignFormData, type CampaignStatus } from "../schemas/campaign";
import { safeValidate } from "@/core/utils/zodHelper";
import type { Ranking } from "@/feature/ranking/schemas/ranking";

export async function getCampaigns(
  page: number,
  perPage: number
) {
  const { data } = await api.get<ApiResponse<PaginatedData<Campaign[]>>>(
    "/admin/campaigns",
    {
      params: { page, per_page: perPage },
    }
  );
  // campaingsArraySchema.parse(data.data.items);
  safeValidate(campaingsArraySchema, data.data.items);
  return data.data;
}


export async function createCampaign(formData: CampaignFormData) {
  const { data } = await api.post<ApiResponse<Campaign>>("/admin/campaigns", formData)
  return data
}

export async function updateCampaing(id: Campaign['id'], formData: CampaignFormData) {
  const { data } = await api.put<ApiResponse<Campaign>>(`/admin/campaigns/${id}`, formData)
  return data
}

export async function getCampaingById(id: Campaign['id']) {
  const { data } = await api.get<ApiResponse<Campaign>>(`/admin/campaigns/${id}`)
  const validatedData = safeValidate(campaignSchema, data.data);
  return validatedData
}
export async function deleteCampaign(id: Campaign['id']) {
  const { data } = await api.delete<ApiResponse<null>>(`/admin/campaigns/${id}`)
  return data
}

export async function changeCampaignStatus(id: number, status: CampaignStatus) {
  const { data } = await api.patch<ApiResponse<null>>(`/admin/campaigns/${id}/status`, { status });
  return data;
}

export async function closeCampaign(id: number) {
  const { data } = await api.post<ApiResponse<null>>(`/admin/campaigns/${id}/close`);
  return data;
}

export async function getCycleRanking(campaignId: number, cycleId: number) {
  const { data } = await api.get<ApiResponse<Ranking[]>>(`/admin/campaigns/${campaignId}/cycles/${cycleId}/ranking`);
  return data;
}

export async function generateCycleRanking(campaignId: number, cycleId: number) {
  const { data } = await api.post<ApiResponse<null>>(`/admin/campaigns/${campaignId}/cycles/${cycleId}/ranking`);
  return data;
}