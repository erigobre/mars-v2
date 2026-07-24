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
  Display,
  DisplayFilters,
  DisplayFormData,
} from "../schemas/display";
import {
  createDisplay,
  deleteDisplay,
  getDisplayById,
  getDisplays,
  updateDisplay,
} from "../api/DisplaysAPI";

export const displayKeys = {
  all: ["displays"] as const,
  list: (page: number, perPage: number, filters: DisplayFilters) =>
    [...displayKeys.all, "list", { page, perPage, ...filters }] as const,
  details: (id: number) => [...displayKeys.all, "detail", id] as const,
};

export function useDisplaysQuery(
  page: number,
  perPage: number,
  filters: DisplayFilters = {},
  options?: any
) {
  return useQuery({
    queryKey: displayKeys.list(page, perPage, filters),
    queryFn: () => getDisplays(page, perPage, filters),
    placeholderData: keepPreviousData,
    staleTime: 1000 * 60 * 5,
    ...options,
  }) as UseQueryResult<PaginatedData<Display[]>>;
}

export function useDisplayDetailsQuery(id: Display["id"]) {
  return useQuery({
    queryKey: displayKeys.details(id!),
    queryFn: () => getDisplayById(id!),
    staleTime: 1000 * 60 * 5,
    enabled: !!id,
  });
}

export function useCreateDisplayMutation({
  setError,
  onClose,
}: {
  setError: UseFormSetError<DisplayFormData>;
  onClose: () => void;
}) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (formData: DisplayFormData) => createDisplay(formData),
    onSuccess: (data) => {
      toast.success(data.message || "Display creado correctamente");
      queryClient.invalidateQueries({ queryKey: displayKeys.all });
      onClose();
    },
    onError: (error) =>
      handleApiError(error, setError, "Error al crear el display"),
  });
}

export function useUpdateDisplayMutation({
  setError,
  onClose,
}: {
  setError: UseFormSetError<DisplayFormData>;
  onClose: () => void;
}) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      formData,
    }: {
      id: Display["id"];
      formData: DisplayFormData;
    }) => updateDisplay(id!, formData),
    onSuccess: (data) => {
      toast.success(data.message || "Display actualizado correctamente");
      queryClient.invalidateQueries({ queryKey: displayKeys.all });
      onClose();
    },
    onError: (error) =>
      handleApiError(error, setError, "Error al actualizar el display"),
  });
}

export function useDeleteDisplayMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteDisplay,
    onSuccess: (data) => {
      toast.success(data.message || "Display eliminado correctamente");
      queryClient.invalidateQueries({ queryKey: displayKeys.all });
    },
    onError: (error) =>
      handleApiError(error, undefined, "Error al eliminar el display"),
  });
}
