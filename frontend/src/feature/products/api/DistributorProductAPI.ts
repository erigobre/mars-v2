import api from "@/core/api/axios";
import type { ApiResponse, PaginatedData } from "@/core/types";
import { safeValidate } from "@/core/utils/zodHelper";
import {
  productsArraySchema,
  type Product,
  type ProductFilters,
} from "../schemas/product";
import { cleanObj } from "@/core/utils/cleanObj";
import type { ProductCustomizationFormData, UpdateCustomizationFormData } from "../schemas/productCustomization";

export async function getDistributorProducts(
  page: number,
  perPage: number,
  filters: ProductFilters = {}
) {
  const { data } = await api.get<ApiResponse<PaginatedData<Product[]>>>(
    "/distributor/products",
    { params: cleanObj({ page, per_page: perPage, ...filters }) }
  );
  safeValidate(productsArraySchema, data.data.items);
  return data.data;
}

export const getCustomizedProducts = async (
  page = 1,
  perPage = 10,
  filters: any = {}
)=> {
  const params = cleanObj({ page, perPage, ...filters });
  const { data } = await api.get<ApiResponse<Product[]>>("/distributor/products/customized", {
    params,
  });
  return data.data;
};

export const getDistributorProductById = async (productId: number): Promise<Product> => {
  const response = await api.get(`/distributor/products/${productId}`);
  return response.data?.data || response.data;
};

export async function getOnlyCustomizedProducts(page: number, perPage: number) {
  const { data } = await api.get<ApiResponse<PaginatedData<Product[]>>>(
    "/distributor/products/customized", // Solo los que el distribuidor ya tocó
    { params: { page, per_page: perPage } }
  );
  return data.data;
}

// Crear o actualizar personalización
export async function customizeProduct(formData: ProductCustomizationFormData) {
  const { data } = await api.post<ApiResponse<Product>>(
    "/distributor/products/customize",
    formData
  );
  return data;
}

// Actualizar personalización existente
export async function updateCustomization(
  distributorProductId: number,
  formData: UpdateCustomizationFormData
) {
  const { data } = await api.put<ApiResponse<Product>>(
    `/distributor/products/customizations/${distributorProductId}`,
    formData
  );
  return data;
}

// Eliminar personalización (vuelve al precio/SKU base)
export async function removeCustomization(distributorProductId: number) {
  const { data } = await api.delete<ApiResponse<null>>(
    `/distributor/products/customizations/${distributorProductId}`
  );
  return data;
}
