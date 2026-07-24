import api from "@/core/api/axios";
import type { ApiResponse } from "@/core/types";
import type {
  CycleFormData,
  GenerateWindowsData,
  RedemptionCycle,
  RedemptionWindow,
  WindowFormData,
} from "../schemas/campaign";

export async function createCycle(campaignId: number, formData: CycleFormData) {
  const { data } = await api.post<ApiResponse<RedemptionCycle>>(
    `/admin/campaigns/${campaignId}/cycles`,
    {
      name: formData.name,
      start_date: formData.startDate,
      end_date: formData.endDate,
      is_active: formData.isActive,
      auto_generate_windows: formData.autoGenerateWindows,
    }
  );
  return data;
}

export async function updateCycle(
  campaignId: number,
  cycleId: number,
  formData: Pick<CycleFormData, "name" | "startDate" | "endDate" | "isActive">
) {
  const { data } = await api.put<ApiResponse<RedemptionCycle>>(
    `/admin/campaigns/${campaignId}/cycles/${cycleId}`,
    {
      name: formData.name,
      start_date: formData.startDate,
      end_date: formData.endDate,
      is_active: formData.isActive,
    }
  );
  return data;
}

export async function deleteCycle(campaignId: number, cycleId: number) {
  const { data } = await api.delete<ApiResponse<null>>(
    `/admin/campaigns/${campaignId}/cycles/${cycleId}`
  );
  return data;
}

export async function generateWindows(
  campaignId: number,
  cycleId: number,
  payload: GenerateWindowsData
) {
  const { data } = await api.post<ApiResponse<RedemptionWindow[]>>(
    `/admin/campaigns/${campaignId}/cycles/${cycleId}/windows/generate`,
    { replace: payload.replace }
  );
  return data;
}

export async function createWindow(
  campaignId: number,
  cycleId: number,
  formData: WindowFormData
) {
  const { data } = await api.post<ApiResponse<RedemptionWindow>>(
    `/admin/campaigns/${campaignId}/cycles/${cycleId}/windows`,
    {
      opens_at: formData.opensAt,
      closes_at: formData.closesAt,
    }
  );
  return data;
}

export async function updateWindow(
  campaignId: number,
  cycleId: number,
  windowId: number,
  formData: WindowFormData
) {
  const { data } = await api.put<ApiResponse<RedemptionWindow>>(
    `/admin/campaigns/${campaignId}/cycles/${cycleId}/windows/${windowId}`,
    {
      opens_at: formData.opensAt,
      closes_at: formData.closesAt,
    }
  );
  return data;
}

export async function deleteWindow(
  campaignId: number,
  cycleId: number,
  windowId: number
) {
  const { data } = await api.delete<ApiResponse<null>>(
    `/admin/campaigns/${campaignId}/cycles/${cycleId}/windows/${windowId}`
  );
  return data;
}
