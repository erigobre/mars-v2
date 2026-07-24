import api from "@/core/api/axios";
import type { SessionUser } from "@/core/schemas/session";
import type { ApiResponse } from "@/core/types";
import { safeValidate } from "@/core/utils/zodHelper";
import {
  sellerDashboardSchema,
  type SellerDashboard,
} from "@/feature/sellers/schemas/dashboardSchema";

export async function getSellerDashboard(): Promise<SellerDashboard> {
  const { data } = await api.get<ApiResponse<SellerDashboard>>(
    "/seller/dashboard"
  );
  // return sellerDashboardSchema.parse(data.data);
  safeValidate(sellerDashboardSchema, data.data)
  return data.data
}

export async function acceptTerms() {
  const { data } = await api.patch<ApiResponse<SessionUser>>('/seller/accept-terms');
  return data.data;
}

export async function deactivateAccount() {
  const { data } = await api.patch('/seller/deactivate-account'); 
  return data;
}