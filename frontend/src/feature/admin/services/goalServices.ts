import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import type { UseFormSetError } from "react-hook-form";
import { toast } from "react-toastify";
import { handleApiError } from "@/core/utils/handleErrors";
import type { GoalFilters, GoalFormData } from "../schemas/goal";
import {
  createGoal,
  deleteGoal,
  getGoalById,
  getGoalProgresses,
  getGoals,
  updateGoal,
} from "../api/GoalAPI";

export const goalKeys = {
  all: ["goals"] as const,
  list: (filters: { page: number; perPage: number; filters?: GoalFilters }) =>
    [...goalKeys.all, "list", filters] as const,
  details: (id: number) => [...goalKeys.all, "detail", id] as const,
  progresses: (goalId: number, page: number) =>
    [...goalKeys.details(goalId), "progresses", page] as const,
};

export function useGoalsQuery(
  page: number,
  perPage: number,
  filters?: GoalFilters
) {
  return useQuery({
    queryKey: goalKeys.list({ page, perPage, filters }),
    queryFn: () => getGoals(page, perPage, filters),
    placeholderData: keepPreviousData,
    staleTime: 1000 * 60 * 5,
  });
}

export function useGoalDetailsQuery(id: number) {
  return useQuery({
    queryKey: goalKeys.details(id),
    queryFn: () => getGoalById(id),
    placeholderData: keepPreviousData,
    staleTime: 1000 * 60 * 5,
  });
}

export function useGoalProgressesQuery(goalId: number, page: number = 1) {
  return useQuery({
    queryKey: goalKeys.progresses(goalId, page),
    queryFn: () => getGoalProgresses(goalId, page),
    placeholderData: keepPreviousData,
    staleTime: 1000 * 60 * 5,
  });
}

export function useCreateGoalMutation({
  setError,
  onClose,
}: {
  setError: UseFormSetError<GoalFormData>;
  onClose: () => void;
}) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createGoal,
    onSuccess: (data) => {
      toast.success(data.message || "Meta creada correctamente");
      queryClient.invalidateQueries({ queryKey: goalKeys.all });
      onClose();
    },
    onError: (error) => {
      handleApiError(error, setError, "Error al crear la meta");
    },
  });
}

export function useUpdateGoalMutation({
  setError,
  onClose,
}: {
  setError: UseFormSetError<GoalFormData>;
  onClose: () => void;
}) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, formData }: { id: number; formData: GoalFormData }) =>
      updateGoal(id, formData),
    onSuccess: (data) => {
      toast.success(data.message || "Meta actualizada correctamente");
      queryClient.invalidateQueries({ queryKey: goalKeys.all });
      onClose();
    },
    onError: (error) => {
      handleApiError(error, setError, "Error al actualizar la meta");
    },
  });
}

export function useDeleteGoalMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteGoal,
    onSuccess: (data) => {
      toast.success(data.message || "Meta eliminada correctamente");
      queryClient.invalidateQueries({ queryKey: goalKeys.all });
    },
    onError: (error) => {
      handleApiError(error, undefined, "Error al eliminar la meta");
    },
  });
}
