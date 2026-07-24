import api from "@/core/api/axios";
import type { ApiResponse, PaginatedData } from "@/core/types";
import { safeValidate } from "@/core/utils/zodHelper";
import { cleanObj } from "@/core/utils/cleanObj";
import {
  displaySchema,
  displaysArraySchema,
  type Display,
  type DisplayFilters,
  type DisplayFormData,
} from "../schemas/display";

export async function getDisplays(
  page: number,
  perPage: number,
  filters: DisplayFilters = {}
) {
  const { data } = await api.get<ApiResponse<PaginatedData<Display[]>>>(
    "/admin/displays",
    {
      params: cleanObj({
        page,
        per_page: perPage,
        ...filters,
      }),
    }
  );
  safeValidate(displaysArraySchema, data.data.items);
  return data.data;
}

export async function getDisplayById(id: number) {
  const { data } = await api.get<ApiResponse<Display>>(`/admin/displays/${id}`);
  return safeValidate(displaySchema, data.data);
}

export async function createDisplay(formData: DisplayFormData) {
  const { data } = await api.post<ApiResponse<Display>>(
    "/admin/displays",
    formData
  );
  return data;
}

export async function updateDisplay(id: number, formData: DisplayFormData) {
  const { data } = await api.put<ApiResponse<Display>>(
    `/admin/displays/${id}`,
    formData
  );
  return data;
}

export async function deleteDisplay(id: number) {
  const { data } = await api.delete<ApiResponse<null>>(`/admin/displays/${id}`);
  return data;
}
