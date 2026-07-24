import { useMutation, useQuery } from "@tanstack/react-query";
import { acceptTerms, deactivateAccount, getSellerDashboard } from "@/feature/sellers/api/SellerAPI";
import { useAuthStore } from "@/core/stores/authStore";

export const sellerKeys = {
  all: ["seller"] as const,
  dashboard: () => [...sellerKeys.all, "dashboard"] as const,
};

export function useSellerDashboardQuery() {
  const token = useAuthStore((s) => s.token);

  return useQuery({
    queryKey: sellerKeys.dashboard(),
    queryFn: getSellerDashboard,
    enabled: !!token,
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: true,
    refetchInterval: (query) => {
      const data = query.state.data;
      if (data && !data.storeStatus.isOpen) return 60_000;
      return false;
    },
  });
}

export function useAcceptTermsMutation() {
  
  return useMutation({
    mutationFn: acceptTerms,
  });
}

export function useDeactivateAccountMutation() {
  return useMutation({
    mutationFn: deactivateAccount,
  });
}