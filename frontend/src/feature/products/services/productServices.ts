import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import type { UseFormSetError } from "react-hook-form";
import type { Product, ProductFilters, ProductFormData } from "../schemas/product";
import { handleApiError } from "@/core/utils/handleErrors";
import { toast } from "react-toastify";
import {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
} from "../api/productAPI";
import { useAuthStore } from "@/core/stores/authStore";
import { getDistributorProducts } from "../api/DistributorProductAPI";

export const productAdminKeys = {
  all: ["admin-products"] as const,
  list: (page: number, perPage: number, filters: ProductFilters) => [...productAdminKeys.all, "list", { page, perPage, ...filters }] as const,
  details: (id: number) => [...productAdminKeys.all, "detail", id] as const,
  displays: () => [...productAdminKeys.all, "displays"] as const,
};

export function useProductsQuery(
  page: number,
  perPage: number,
  filters: ProductFilters = {}
) {
  return useQuery({
    queryKey: productAdminKeys.list(page, perPage, filters),
    queryFn: () => getProducts(page, perPage, filters),
    placeholderData: keepPreviousData,
    staleTime: 1000 * 60 * 5,
  });
}

export function useProductAdminDetailsQuery(id: Product["id"]) {
  return useQuery({
    queryKey: productAdminKeys.details(id),
    queryFn: () => getProductById(id),
    staleTime: 1000 * 60 * 5,
  });
}

export function useCreateProductMutation({
  setError,
  onClose,
}: {
  setError: UseFormSetError<ProductFormData>;
  onClose: () => void;
}) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      formData,
      imageFile,
    }: {
      formData: ProductFormData;
      imageFile?: File | null;
    }) => createProduct(formData, imageFile),
    onSuccess: (data) => {
      toast.success(data.message || "Producto creado correctamente");
      queryClient.invalidateQueries({ queryKey: productAdminKeys.all });
      onClose();
    },
    onError: (error) =>
      handleApiError(error, setError, "Error al crear el producto"),
  });
}

export function useUpdateProductMutation({
  setError,
  onClose,
}: {
  setError: UseFormSetError<ProductFormData>;
  onClose: () => void;
}) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      formData,
      imageFile,
    }: {
      id: Product["id"];
      formData: ProductFormData;
      imageFile?: File | null;
    }) => updateProduct(id, formData, imageFile),
    onSuccess: (data) => {
      toast.success(data.message || "Producto actualizado correctamente");
      queryClient.invalidateQueries({ queryKey: productAdminKeys.all });
      onClose();
    },
    onError: (error) =>
      handleApiError(error, setError, "Error al actualizar el producto"),
  });
}

export function useDeleteProductMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteProduct,
    onSuccess: (data) => {
      toast.success(data.message || "Producto eliminado correctamente");
      queryClient.invalidateQueries({ queryKey: productAdminKeys.all });
    },
    onError: (error) =>
      handleApiError(error, undefined, "Error al eliminar el producto"),
  });
}

export function useUnifiedProductsQuery(page = 1, perPage = 100, filters: ProductFilters = {}) {
  const user = useAuthStore((state) => state.user);
  const isAdmin = user?.role === "admin"; // Ajustar según estructura de tu rol

  return useQuery({
    queryKey: ["unified-products", isAdmin ? "admin" : "distributor", { page, perPage, ...filters }],
    queryFn: () => {
      if (isAdmin) {
        return getProducts(page, perPage, filters);
      }
      return getDistributorProducts(page, perPage, filters);
    },
    staleTime: 1000 * 60 * 10, // 10 minutos para selectores
  });
}