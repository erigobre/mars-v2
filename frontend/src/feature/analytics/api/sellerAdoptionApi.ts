import { z } from "zod";
import api from "@/core/api/axios";
import type { ApiResponse } from "@/core/types";
import {
  adoptionReportSchema,
  byCompanyItemSchema,
  type AdoptionReport,
  type ByCompanyItem,
} from "../schemas/sellerAdoptionSchemas";

export interface AdoptionFilters {
  distributorId?: number;
  campaignId?: number;
  dateFrom?: string;
  dateTo?: string;
}

export async function fetchAdoptionReport(
  filters: AdoptionFilters
): Promise<AdoptionReport> {
  const params: Record<string, string | number> = {};
  if (filters.distributorId) params["distributor_id"] = filters.distributorId;
  if (filters.campaignId) params["campaign_id"] = filters.campaignId;
  if (filters.dateFrom) params["date_from"] = filters.dateFrom;
  if (filters.dateTo) params["date_to"] = filters.dateTo;

  const { data } = await api.get<ApiResponse<AdoptionReport>>(
    "/dashboard/sellers/adoption",
    { params }
  );
  return adoptionReportSchema.parse(data.data);
}

export async function fetchByCompany(
  filters: AdoptionFilters
): Promise<ByCompanyItem[]> {
  const params: Record<string, string | number> = {};
  if (filters.campaignId) params["campaign_id"] = filters.campaignId;
  if (filters.dateFrom) params["date_from"] = filters.dateFrom;
  if (filters.dateTo) params["date_to"] = filters.dateTo;

  const { data } = await api.get<ApiResponse<ByCompanyItem[]>>(
    "/dashboard/sellers/adoption/by-company",
    { params }
  );
  return z.array(byCompanyItemSchema).parse(data.data);
}
