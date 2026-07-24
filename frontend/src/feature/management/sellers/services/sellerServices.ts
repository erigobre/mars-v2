import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
  type UseQueryResult,
} from "@tanstack/react-query";
import type { UseFormSetError } from "react-hook-form";
import type { Seller, SellerFilters, SellerFormData } from "../schemas/seller";
import { handleApiError } from "@/core/utils/handleErrors";
import { toast } from "react-toastify";
import {
  getSellers,
  getSellerById,
  createSeller,
  updateSeller,
  deleteSeller,
} from "../api/sellerAPI";
import type { PaginatedData } from "@/core/types";

export const sellerAdminKeys = {
  all: ["admin-sellers"] as const,
  list: (page: number, perPage: number, filters: SellerFilters) => [...sellerAdminKeys.all, "list", {page, perPage, ...filters}] as const,
  details: (id: number) => [...sellerAdminKeys.all, "detail", id] as const,
};

export function useSellersQuery(
  page: number,
  perPage: number,
  filters: SellerFilters = {},
  options?: any
) {
  return useQuery({
    queryKey: sellerAdminKeys.list(page, perPage, filters),
    queryFn: () => getSellers(page, perPage, filters),
    placeholderData: keepPreviousData,
    staleTime: 1000 * 60 * 5,
    ...options
  }) as UseQueryResult<PaginatedData<Seller[]>>;
}

export function useSellerDetailsQuery(id: Seller["id"]) {
  return useQuery({
    queryKey: sellerAdminKeys.details(id),
    queryFn: () => getSellerById(id),
    staleTime: 1000 * 60 * 5,
  });
}

export function useCreateSellerMutation({
  setError,
  onClose,
}: {
  setError: UseFormSetError<SellerFormData>;
  onClose: () => void;
}) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      formData,
      avatarFile,
    }: {
      formData: SellerFormData;
      avatarFile?: File | null;
    }) => createSeller(formData, avatarFile),
    onSuccess: (data) => {
      toast.success(data.message || "Vendedor creado correctamente");
      queryClient.invalidateQueries({ queryKey: sellerAdminKeys.all });
      onClose();
    },
    onError: (error) =>
      handleApiError(error, setError, "Error al crear el vendedor"),
  });
}

export function useUpdateSellerMutation({
  setError,
  onClose,
}: {
  setError: UseFormSetError<SellerFormData>;
  onClose: () => void;
}) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      formData,
      avatarFile,
    }: {
      id: Seller["id"];
      formData: SellerFormData;
      avatarFile?: File | null;
    }) => updateSeller(id, formData, avatarFile),
    onSuccess: (data) => {
      toast.success(data.message || "Vendedor actualizado correctamente");
      queryClient.invalidateQueries({ queryKey: sellerAdminKeys.all });
      onClose();
    },
    onError: (error) =>
      handleApiError(error, setError, "Error al actualizar el vendedor"),
  });
}

export function useDeleteSellerMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteSeller,
    onSuccess: (data) => {
      toast.success(data.message || "Vendedor eliminado correctamente");
      queryClient.invalidateQueries({ queryKey: sellerAdminKeys.all });
    },
    onError: (error) =>
      handleApiError(error, undefined, "Error al eliminar el vendedor"),
  });
}
