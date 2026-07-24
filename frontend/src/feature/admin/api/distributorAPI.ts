import api from "@/core/api/axios";
import type { ApiResponse, PaginatedData } from "@/core/types";
import {
  distributorSchema,
  distributorsArraySchema,
  type Distributor,
  type DistributorFilters,
  type DistributorFormData,
} from "../schemas/distributor";
import { safeValidate } from "@/core/utils/zodHelper";
import { cleanObj } from "@/core/utils/cleanObj";

function buildFormData(
  formData: DistributorFormData,
  avatarFile?: File | null
): FormData {
  const fd = new FormData();
  fd.append("username", formData.username);
  fd.append("email", formData.email);
  fd.append("phone", formData.phone);
  fd.append("company_name", formData.companyName);
  fd.append("is_active", formData.isActive ? "1" : "0");
  if (formData.birthdate?.trim()) fd.append("birthdate", formData.birthdate);
//   if (formData.password?.trim()) {
//     fd.append("password", formData.password);
//     fd.append("password_confirmation", formData.passwordConfirmation ?? "");
//   }
  if (avatarFile) fd.append("avatar", avatarFile);
  return fd;
}

export async function getDistributors(
  page: number,
  perPage: number,
  filters: DistributorFilters = {}
) {
  const { data } = await api.get<ApiResponse<PaginatedData<Distributor[]>>>(
    "/admin/distributors",
    { 
      params: cleanObj({ 
        page, 
        per_page: perPage, 
        ...filters
      }) 
    }
  );
  safeValidate(distributorsArraySchema, data.data.items);
  return data.data;
}

export async function getDistributorById(id: number) {
  const { data } = await api.get<ApiResponse<Distributor>>(
    `/admin/distributors/${id}`
  );
  return safeValidate(distributorSchema, data.data);
}

export async function createDistributor(
  formData: DistributorFormData,
  avatarFile?: File | null
) {
  const fd = buildFormData(formData, avatarFile);
  const { data } = await api.post<ApiResponse<Distributor>>(
    "/admin/distributors",
    fd,
    { headers: { "Content-Type": "multipart/form-data" } }
  );
  return data;
}

export async function updateDistributor(
  id: number,
  formData: DistributorFormData,
  avatarFile?: File | null
) {
  const fd = buildFormData(formData, avatarFile);
  fd.append("_method", "PUT");
  const { data } = await api.post<ApiResponse<Distributor>>(
    `/admin/distributors/${id}`,
    fd,
    { headers: { "Content-Type": "multipart/form-data" } }
  );
  return data;
}

export async function deleteDistributor(id: number) {
  const { data } = await api.delete<ApiResponse<null>>(
    `/admin/distributors/${id}`
  );
  return data;
}
