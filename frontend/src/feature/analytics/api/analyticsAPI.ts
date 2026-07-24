import api from "@/core/api/axios";
import type { AnalyticsFilters } from "../types";
import {
  adminEconomyRewardsResponseSchema,
  adminOverviewResponseSchema,
  adminSalesPerformanceResponseSchema,
  type AdminAdoptionGamificationData,
  type AdminEconomyRewardsData,
  type AdminOverviewData,
  type AdminSalesPerformanceData,
} from "../schemas/dashboardEndpoints";
import type { ApiResponse } from "@/core/types";
import { safeValidate } from "@/core/utils/zodHelper";
import {
  CommercialNetworkResponseSchema,
  RewardsNetworkResponseSchema,
  type CommercialNetworkData,
  type RewardsNetworkData,
} from "../schemas/distributorDashboardSchema";
import {
  dailyUsageSchema,
  type DailyUsageData,
} from "../schemas/dailyUsageAnalytics";
import type { DailyUsageFilters } from "../types/dailyUsageFilters";

export const getOverview = async (params?: AnalyticsFilters) => {
  const { data } = await api.get<ApiResponse<AdminOverviewData>>(
    "/dashboard/overview",
    { params },
  );
  // safeParse(adminOverviewResponseSchema, data.data);
  const result = adminOverviewResponseSchema.parse(data.data);
  return result;
};

export const getSalesMetrics = async (params?: AnalyticsFilters) => {
  const { data } = await api.get<ApiResponse<AdminSalesPerformanceData>>(
    "/dashboard/sales",
    { params },
  );
  safeValidate(adminSalesPerformanceResponseSchema, data.data);
  const result = adminSalesPerformanceResponseSchema.parse(data.data);
  return result;
};

export const getEconomyMetrics = async (params?: AnalyticsFilters) => {
  const { data } = await api.get<ApiResponse<AdminEconomyRewardsData>>(
    "/dashboard/economy",
    { params },
  );
  const result = adminEconomyRewardsResponseSchema.parse(data.data);
  return result;
};

export const getAdoptionMetrics = async (params?: AnalyticsFilters) => {
  const { data } = await api.get<ApiResponse<AdminAdoptionGamificationData>>(
    "/dashboard/adoption",
    { params },
  );
  return data.data;
};

export const getRewardsMetrics = async (params?: AnalyticsFilters) => {
  const { data } = await api.get("/dashboard/rewards", { params });
  return data;
};

export const getDistributorCommercialNetwork = async () => {
  const { data } = await api.get<ApiResponse<CommercialNetworkData>>(
    "/distributor/dashboard/commercial",
  );

  // Validación segura opcional (igual que en tus otros endpoints)
  safeValidate(CommercialNetworkResponseSchema, data.data);

  const result = CommercialNetworkResponseSchema.parse(data.data);
  return result;
};

export const getDistributorRewardsNetwork = async () => {
  const { data } = await api.get<ApiResponse<RewardsNetworkData>>(
    "/distributor/dashboard/rewards",
  );

  safeValidate(RewardsNetworkResponseSchema, data.data);

  const result = RewardsNetworkResponseSchema.parse(data.data);
  return result;
};

export const getDailyUsage = async (filters?: DailyUsageFilters) => {
  const rawParams: Record<string, string | number | undefined> = {
    date: filters?.date,
    tz: filters?.tz,
    role: filters?.role || undefined,
    distributorId: filters?.distributorId
      ? Number(filters.distributorId)
      : undefined,
  };

  const params = Object.fromEntries(
    Object.entries(rawParams).filter(([, v]) => v !== undefined),
  );

  const { data } = await api.get<ApiResponse<DailyUsageData>>(
    "/dashboard/usage/today",
    { params },
  );

  safeValidate(dailyUsageSchema, data.data);
  return dailyUsageSchema.parse(data.data);
};
