import api from "@/core/api/axios";
import type { ApiResponse, PaginatedData } from "@/core/types";
import { safeValidate } from "@/core/utils/zodHelper";
import { cleanObj } from "@/core/utils/cleanObj";
import {
  logisticSchema,
  logisticsArraySchema,
  type Logistic,
  type LogisticFilters,
  type LogisticFormData,
} from "../schemas/logistic";

function buildFormData(
  formData: LogisticFormData,
  avatarFile?: File | null
): FormData {
  const fd = new FormData();
  fd.append("username", formData.username);
  fd.append("email", formData.email);
  fd.append("phone", formData.phone);
  fd.append("isActive", formData.isActive ? "1" : "0");
  if (formData.birthdate?.trim()) fd.append("birthdate", formData.birthdate);
  
  if (avatarFile) fd.append("avatar", avatarFile);
  return fd;
}

export async function getLogistics(
  page: number,
  perPage: number,
  filters: LogisticFilters = {}
) {
  const { data } = await api.get<ApiResponse<PaginatedData<Logistic[]>>>(
    "/admin/logistics",
    {
      params: cleanObj({
        page,
        per_page: perPage,
        ...filters,
      }),
    }
  );
  safeValidate(logisticsArraySchema, data.data.items);
  return data.data;
}

export async function getLogisticById(id: number) {
  const { data } = await api.get<ApiResponse<Logistic>>(
    `/admin/logistics/${id}`
  );
  return safeValidate(logisticSchema, data.data);
}

export async function createLogistic(
  formData: LogisticFormData,
  avatarFile?: File | null
) {
  const fd = buildFormData(formData, avatarFile);
  const { data } = await api.post<ApiResponse<Logistic>>(
    "/admin/logistics",
    fd
  );
  return data;
}

export async function updateLogistic(
  id: number,
  formData: LogisticFormData,
  avatarFile?: File | null
) {
  const fd = buildFormData(formData, avatarFile);
  fd.append("_method", "PUT"); // Method spoofing para Laravel
  const { data } = await api.post<ApiResponse<Logistic>>(
    `/admin/logistics/${id}`,
    fd
  );
  return data;
}

export async function deleteLogistic(id: number) {
  const { data } = await api.delete<ApiResponse<null>>(
    `/admin/logistics/${id}`
  );
  return data;
}