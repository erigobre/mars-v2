import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
  type UseQueryResult,
} from "@tanstack/react-query";
import {
  customizeProduct,
  getCustomizedProducts,
  getDistributorProducts,
  removeCustomization,
  updateCustomization,
} from "../api/DistributorProductAPI";
import { handleApiError } from "@/core/utils/handleErrors";
import { toast } from "react-toastify";
import type {
  Product,
  ProductFilters,
} from "../schemas/product";
import type { PaginatedData } from "@/core/types";
import type { UpdateCustomizationFormData } from "../schemas/productCustomization";

export const productDistributorKeys = {
  all: ["distributor-products"] as const,
  list: (page: number, perPage: number, filters: ProductFilters) =>
    [
      ...productDistributorKeys.all,
      "list",
      { page, perPage, ...filters },
    ] as const,
  customized: (page: number, perPage: number, filters: any) =>
    [
      ...productDistributorKeys.all,
      "customized",
      { page, perPage, ...filters },
    ] as const,
};

export function useDistributorProductsQuery(
  page: number,
  perPage: number,
  filters: ProductFilters = {},
  options?: any
) {
  return useQuery({
    queryKey: productDistributorKeys.list(page, perPage, filters),
    queryFn: () => getDistributorProducts(page, perPage, filters),
    placeholderData: keepPreviousData,
    staleTime: 1000 * 60 * 5,
    ...options,
  }) as UseQueryResult<PaginatedData<Product[]>>;
}

export function useCustomizedProductsQuery(
  page: number,
  perPage: number,
  filters: any = {},
  options?: any
) {
  return useQuery({
    queryKey: productDistributorKeys.customized(page, perPage, filters),
    queryFn: () => getCustomizedProducts(page, perPage, filters),
    placeholderData: keepPreviousData,
    ...options,
  }) as UseQueryResult<PaginatedData<Product[]>>;
}

// Mutation para crear o actualizar la personalización
export function useCustomizeProductMutation(onSuccessCallback?: () => void) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: customizeProduct,
    onSuccess: (data) => {
      toast.success(data.message || "Producto personalizado correctamente");
      queryClient.invalidateQueries({ queryKey: productDistributorKeys.all });
      onSuccessCallback?.();
    },
    onError: (error) =>
      handleApiError(error, undefined, "Error al personalizar"),
  });
}

// Mutation para actualizar una personalización específica
export function useUpdateCustomizedProductMutation(onSuccessCallback?: () => void) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: number;
      data: UpdateCustomizationFormData;
    }) => updateCustomization(id, data),
    onSuccess: () => {
      toast.success("Cambios guardados correctamente");
      queryClient.invalidateQueries({ queryKey: productDistributorKeys.all });
      onSuccessCallback?.();
    },
    onError: (error) => handleApiError(error, undefined, "Error al actualizar"),
  });
}

// Mutation para resetear un producto a sus valores base
export function useDeleteCustomizedProductMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: removeCustomization,
    onSuccess: () => {
      toast.info("Se han restaurado los valores por defecto del producto");
      queryClient.invalidateQueries({ queryKey: productDistributorKeys.all });
    },
    onError: (error) =>
      handleApiError(error, undefined, "Error al eliminar personalización"),
  });
}
