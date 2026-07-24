import { useQuery } from "@tanstack/react-query";
import {
  getOverview,
  getSalesMetrics,
  getEconomyMetrics,
  getAdoptionMetrics,
  getRewardsMetrics,
  getDistributorCommercialNetwork,
  getDistributorRewardsNetwork,
  getDailyUsage,
} from "../api/analyticsAPI";
import type { AnalyticsFilters } from "../types";
import type { DailyUsageFilters } from "../types/dailyUsageFilters";

export const useOverviewMetrics = (filters?: AnalyticsFilters) => {
  return useQuery({
    queryKey: ["analytics", "overview", filters],
    queryFn: () => getOverview(filters),
    staleTime: 1000 * 60 * 5, // 5 minutos de caché para evitar peticiones excesivas
  });
};

export const useSalesMetrics = (filters?: AnalyticsFilters) => {
  return useQuery({
    queryKey: ["analytics", "sales", filters],
    queryFn: () => getSalesMetrics(filters),
    staleTime: 1000 * 60 * 5,
  });
};

export const useEconomyMetrics = (filters?: AnalyticsFilters) => {
  return useQuery({
    queryKey: ["analytics", "economy", filters],
    queryFn: () => getEconomyMetrics(filters),
    staleTime: 1000 * 60 * 5,
  });
};

export const useAdoptionMetrics = (filters?: AnalyticsFilters) => {
  return useQuery({
    queryKey: ["analytics", "adoption", filters],
    queryFn: () => getAdoptionMetrics(filters),
    staleTime: 1000 * 60 * 5,
  });
};

export const useRewardsMetrics = (filters?: AnalyticsFilters) => {
  return useQuery({
    queryKey: ["analytics", "rewards", filters],
    queryFn: () => getRewardsMetrics(filters),
    staleTime: 1000 * 60 * 5,
  });
};

export const useDistributorCommercialMetrics = () => {
  return useQuery({
    queryKey: ["analytics", "distributor-commercial"],
    queryFn: () => getDistributorCommercialNetwork(),
    staleTime: 1000 * 60 * 5, // 5 minutos de caché
  });
};

export const useDistributorRewardsMetrics = () => {
  return useQuery({
    queryKey: ["analytics", "distributor-rewards"],
    queryFn: () => getDistributorRewardsNetwork(),
    staleTime: 1000 * 60 * 5, // 5 minutos de caché
  });
};

export const useDailyUsage = (filters?: DailyUsageFilters) => {
  return useQuery({
    queryKey:       ["analytics", "daily-usage", filters],
    queryFn:        () => getDailyUsage(filters),
    staleTime:      1000 * 60 * 2,
    refetchInterval: 1000 * 60 * 2,
  });
};
 