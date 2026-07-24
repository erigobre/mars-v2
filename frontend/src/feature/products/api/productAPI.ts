import api from "@/core/api/axios";
import type { ApiResponse, PaginatedData } from "@/core/types";
import {
  productSchema,
  productsArraySchema,
  type DisplayOption,
  type Product,
  type ProductFilters,
  type ProductFormData,
} from "../schemas/product";
import { safeValidate } from "@/core/utils/zodHelper";
import { cleanObj } from "@/core/utils/cleanObj";

function buildFormData(
  formData: ProductFormData,
  imageFile?: File | null
): FormData {
  const fd = new FormData();
  fd.append("display_id", String(formData.displayId));
  fd.append("sku", formData.sku);
  if (formData.upc?.trim()) fd.append("upc", formData.upc);
  fd.append("name", formData.name);
  if (formData.description?.trim())
    fd.append("description", formData.description);
  fd.append("default_price", String(formData.defaultPrice));
  fd.append("unit_type", formData.unitType);
  if (formData.customUnitType?.trim())
    fd.append("custom_unit_type", formData.customUnitType);
  if (formData.category?.trim()) fd.append("category", formData.category);
  fd.append("is_active", formData.isActive ? "1" : "0");
  if (imageFile) fd.append("image", imageFile);
  return fd;
}

export async function getProducts(
  page: number,
  perPage: number,
  filters: ProductFilters = {}
) {
  const { data } = await api.get<ApiResponse<PaginatedData<Product[]>>>(
    "/admin/products",
    { params: cleanObj({ page, per_page: perPage, ...filters }) }
  );
  safeValidate(productsArraySchema, data.data.items);
  return data.data;
}

export async function getProductById(id: number) {
  const { data } = await api.get<ApiResponse<Product>>(`/admin/products/${id}`);
  return safeValidate(productSchema, data.data);
}

export async function createProduct(
  formData: ProductFormData,
  imageFile?: File | null
) {
  const fd = buildFormData(formData, imageFile);
  const { data } = await api.post<ApiResponse<Product>>("/admin/products", fd, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data;
}

export async function updateProduct(
  id: number,
  formData: ProductFormData,
  imageFile?: File | null
) {
  const fd = buildFormData(formData, imageFile);
  fd.append("_method", "PUT");
  const { data } = await api.post<ApiResponse<Product>>(
    `/admin/products/${id}`,
    fd,
    { headers: { "Content-Type": "multipart/form-data" } }
  );
  return data;
}

export async function deleteProduct(id: number) {
  const { data } = await api.delete<ApiResponse<null>>(`/admin/products/${id}`);
  return data;
}

/** Fetches a lightweight list of displays for use in selects */
export async function getDisplaysForSelect(): Promise<DisplayOption[]> {
  const { data } = await api.get<ApiResponse<DisplayOption[]>>(
    "/admin/displays",
    { params: { per_page: 100 } }
  );
  return data.data ?? [];
}