import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
  type UseQueryResult,
} from "@tanstack/react-query";
import type { UseFormSetError } from "react-hook-form";
import type { Distributor, DistributorFilters, DistributorFormData } from "../schemas/distributor";
import { handleApiError } from "@/core/utils/handleErrors";
import { toast } from "react-toastify";
import {
  createDistributor,
  deleteDistributor,
  getDistributorById,
  getDistributors,
  updateDistributor,
} from "../api/distributorAPI";
import type { PaginatedData } from "@/core/types";

export const distributorKeys = {
  all: ["distributors"] as const,
  list: (page: number, perPage: number, filters: DistributorFilters) =>
    [...distributorKeys.all, "list", { page, perPage, ...filters }] as const,
  details: (id: number) => [...distributorKeys.all, "detail", id] as const,
};

export function useDistributorsQuery(
  page: number,
  perPage: number,
  filters: DistributorFilters = {},
  options?: any
) {
  return useQuery({
    queryKey: distributorKeys.list(page, perPage, filters),
    queryFn: () => getDistributors(page, perPage, filters),
    placeholderData: keepPreviousData,
    staleTime: 1000 * 60 * 5,
    ...options
  }) as UseQueryResult<PaginatedData<Distributor[]>>;
}

export function useDistributorDetailsQuery(id: Distributor["id"]) {
  return useQuery({
    queryKey: distributorKeys.details(id),
    queryFn: () => getDistributorById(id),
    staleTime: 1000 * 60 * 5,
  });
}

export function useCreateDistributorMutation({
  setError,
  onClose,
}: {
  setError: UseFormSetError<DistributorFormData>;
  onClose: () => void;
}) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      formData,
      avatarFile,
    }: {
      formData: DistributorFormData;
      avatarFile?: File | null;
    }) => createDistributor(formData, avatarFile),
    onSuccess: (data) => {
      toast.success(data.message || "Distribuidor creado correctamente");
      queryClient.invalidateQueries({ queryKey: distributorKeys.all });
      onClose();
    },
    onError: (error) =>
      handleApiError(error, setError, "Error al crear el distribuidor"),
  });
}

export function useUpdateDistributorMutation({
  setError,
  onClose,
}: {
  setError: UseFormSetError<DistributorFormData>;
  onClose: () => void;
}) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      formData,
      avatarFile,
    }: {
      id: Distributor["id"];
      formData: DistributorFormData;
      avatarFile?: File | null;
    }) => updateDistributor(id, formData, avatarFile),
    onSuccess: (data) => {
      toast.success(data.message || "Distribuidor actualizado correctamente");
      queryClient.invalidateQueries({ queryKey: distributorKeys.all });
      onClose();
    },
    onError: (error) =>
      handleApiError(error, setError, "Error al actualizar el distribuidor"),
  });
}

export function useDeleteDistributorMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteDistributor,
    onSuccess: (data) => {
      toast.success(data.message || "Distribuidor eliminado correctamente");
      queryClient.invalidateQueries({ queryKey: distributorKeys.all });
    },
    onError: (error) =>
      handleApiError(error, undefined, "Error al eliminar el distribuidor"),
  });
}
