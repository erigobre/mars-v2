import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
  type UseQueryResult,
} from "@tanstack/react-query";
import type { UseFormSetError } from "react-hook-form";
import type { PaginatedData } from "@/core/types";
import { handleApiError } from "@/core/utils/handleErrors";
import { toast } from "react-toastify";
import type {
  Logistic,
  LogisticFilters,
  LogisticFormData,
} from "../schemas/logistic";
import {
  createLogistic,
  deleteLogistic,
  getLogisticById,
  getLogistics,
  updateLogistic,
} from "../api/LogisticsAPI";

export const logisticKeys = {
  all: ["logistics"] as const,
  list: (page: number, perPage: number, filters: LogisticFilters) =>
    [...logisticKeys.all, "list", { page, perPage, ...filters }] as const,
  details: (id: number) => [...logisticKeys.all, "detail", id] as const,
};

export function useLogisticsQuery(
  page: number,
  perPage: number,
  filters: LogisticFilters = {},
  options?: any
) {
  return useQuery({
    queryKey: logisticKeys.list(page, perPage, filters),
    queryFn: () => getLogistics(page, perPage, filters),
    placeholderData: keepPreviousData,
    staleTime: 1000 * 60 * 5,
    ...options,
  }) as UseQueryResult<PaginatedData<Logistic[]>>;
}

export function useLogisticDetailsQuery(id: Logistic["id"]) {
  return useQuery({
    queryKey: logisticKeys.details(id!),
    queryFn: () => getLogisticById(id!),
    staleTime: 1000 * 60 * 5,
    enabled: !!id,
  });
}

export function useCreateLogisticMutation({
  setError,
  onClose,
}: {
  setError: UseFormSetError<LogisticFormData>;
  onClose: () => void;
}) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      formData,
      avatarFile,
    }: {
      formData: LogisticFormData;
      avatarFile?: File | null;
    }) => createLogistic(formData, avatarFile),
    onSuccess: (data) => {
      toast.success(data.message || "Perfil de logística creado correctamente");
      queryClient.invalidateQueries({ queryKey: logisticKeys.all });
      onClose();
    },
    onError: (error) =>
      handleApiError(error, setError, "Error al crear el perfil"),
  });
}

export function useUpdateLogisticMutation({
  setError,
  onClose,
}: {
  setError: UseFormSetError<LogisticFormData>;
  onClose: () => void;
}) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      formData,
      avatarFile,
    }: {
      id: Logistic["id"];
      formData: LogisticFormData;
      avatarFile?: File | null;
    }) => updateLogistic(id!, formData, avatarFile),
    onSuccess: (data) => {
      toast.success(
        data.message || "Perfil de logística actualizado correctamente"
      );
      queryClient.invalidateQueries({ queryKey: logisticKeys.all });
      onClose();
    },
    onError: (error) =>
      handleApiError(error, setError, "Error al actualizar el perfil"),
  });
}

export function useDeleteLogisticMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteLogistic,
    onSuccess: (data) => {
      toast.success(data.message || "Perfil eliminado correctamente");
      queryClient.invalidateQueries({ queryKey: logisticKeys.all });
    },
    onError: (error) =>
      handleApiError(error, undefined, "Error al eliminar el perfil"),
  });
}
