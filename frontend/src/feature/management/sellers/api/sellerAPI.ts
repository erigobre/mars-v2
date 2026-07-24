import api from "@/core/api/axios";
import type { ApiResponse, PaginatedData } from "@/core/types";
import {
  sellerSchema,
  sellersArraySchema,
  type Seller,
  type SellerFilters,
  type SellerFormData,
} from "../schemas/seller";
import { safeValidate } from "@/core/utils/zodHelper";
import { cleanObj } from "@/core/utils/cleanObj";

function buildFormData(
  formData: SellerFormData,
  avatarFile?: File | null
): FormData {
  const fd = new FormData();
  fd.append("username", formData.username);
  if(formData.email) fd.append("email", formData.email);
  if(formData.phone) fd.append("phone", formData.phone);
  if(formData.employeeCode) fd.append("employee_code", formData.employeeCode);
  fd.append("is_active", formData.isActive ? "1" : "0");

  if (formData.birthdate?.trim()) fd.append("birthdate", formData.birthdate);
  if (formData.distributorId)
    fd.append("distributor_id", String(formData.distributorId));
//   if (formData.password?.trim()) {
//     fd.append("password", formData.password);
//     fd.append("password_confirmation", formData.passwordConfirmation ?? "");
//   }

  // Address fields (always sent to allow clearing)
  fd.append("address_street", formData.addressStreet ?? "");
  fd.append("address_colonia", formData.addressColonia ?? "");
  fd.append("address_city", formData.addressCity ?? "");
  fd.append("address_state", formData.addressState ?? "");
  fd.append("address_zip", formData.addressZip ?? "");
  fd.append("shipping_notes", formData.shippingNotes ?? "");

  fd.append("average_monthly_sales", String(formData.averageMonthlySales ?? 0));
  fd.append("sellerTierId", String(formData.sellerTierId));

  if (avatarFile) fd.append("avatar", avatarFile);
  return fd;
}

export async function getSellers(
  page: number,
  perPage: number,
  filters: SellerFilters = {}
) {
  const { data } = await api.get<ApiResponse<PaginatedData<Seller[]>>>(
    "/sellers",
    {
      params: cleanObj({
        page,
        per_page: perPage,
        ...filters
      }),
    }
  );
  safeValidate(sellersArraySchema, data.data.items);
  return data.data;
}

export async function getSellerById(id: number) {
  const { data } = await api.get<ApiResponse<Seller>>(`/sellers/${id}`);
  return safeValidate(sellerSchema, data.data);
}

export async function createSeller(
  formData: SellerFormData,
  avatarFile?: File | null
) {
  const fd = buildFormData(formData, avatarFile);
  const { data } = await api.post<ApiResponse<Seller>>("/sellers", fd, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data;
}

export async function updateSeller(
  id: number,
  formData: SellerFormData,
  avatarFile?: File | null
) {
  const fd = buildFormData(formData, avatarFile);
  fd.append("_method", "PUT");
  const { data } = await api.post<ApiResponse<Seller>>(
    `/sellers/${id}`,
    fd,
    { headers: { "Content-Type": "multipart/form-data" } }
  );
  return data;
}

export async function deleteSeller(id: number) {
  const { data } = await api.delete<ApiResponse<null>>(`/sellers/${id}`);
  return data;
}
