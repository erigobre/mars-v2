import { useQuery, type UseQueryResult } from "@tanstack/react-query";
import {
  fetchAdoptionReport,
  fetchByCompany,
  type AdoptionFilters,
} from "../api/sellerAdoptionApi";
import type {
  AdoptionReport,
  ByCompanyItem,
} from "../schemas/sellerAdoptionSchemas";

export function useAdoptionReport(
  filters: AdoptionFilters
): UseQueryResult<AdoptionReport> {
  return useQuery({
    queryKey: ["sellers", "adoption", "report", filters],
    queryFn: () => fetchAdoptionReport(filters),
    staleTime: 1000 * 60 * 5,
  });
}

export function useAdoptionByCompany(
  filters: AdoptionFilters
): UseQueryResult<ByCompanyItem[]> {
  return useQuery({
    queryKey: ["sellers", "adoption", "by-company", filters],
    queryFn: () => fetchByCompany(filters),
    staleTime: 1000 * 60 * 5,
  });
}