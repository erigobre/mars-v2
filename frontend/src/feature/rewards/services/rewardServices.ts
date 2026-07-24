import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import type { UseFormSetError } from "react-hook-form";
import type { Reward, RewardFormData } from "../schemas/reward";
import { handleApiError } from "@/core/utils/handleErrors";
import { toast } from "react-toastify";
import type { GetRewardsParams } from "@/core/types/filters";
import { getRewards, getRewardById, createReward, updateReward, deleteReward, getTierPrices, updateTierPrices } from "../api/RewardAPI";

export const rewardKeys = {
  all: ["rewards"] as const,
  list: (params: GetRewardsParams) => [...rewardKeys.all, "list", params] as const,
  details: (id: number) => [...rewardKeys.all, "detail", id] as const,
  tierPrices: (id: number) => [...rewardKeys.all, "tier-prices", id] as const,
};

export function useRewardsQuery(params: GetRewardsParams, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: rewardKeys.list(params),
    queryFn: () => getRewards(params),
    placeholderData: keepPreviousData,
    staleTime: 1000 * 60 * 5,
    enabled: options?.enabled,
  });
}

export function useRewardDetailsQuery(id: Reward["id"]) {
  return useQuery({
    queryKey: rewardKeys.details(id),
    queryFn: () => getRewardById(id),
    placeholderData: keepPreviousData,
    staleTime: 1000 * 60 * 5,
  });
}

export function useCreateRewardMutation({
  setError,
  onClose,
}: {
  setError: UseFormSetError<RewardFormData>;
  onClose: () => void;
}) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      formData,
      imageFile,
    }: {
      formData: RewardFormData;
      imageFile?: File | null;
    }) => createReward(formData, imageFile),
    onSuccess: (data) => {
      toast.success(data.message);
      queryClient.invalidateQueries({ queryKey: rewardKeys.all });
      onClose();
    },
    onError: (error) =>
      handleApiError(error, setError, "Error al crear el premio"),
  });
}

export function useUpdateRewardMutation({
  setError,
  onClose,
}: {
  setError: UseFormSetError<RewardFormData>;
  onClose: () => void;
}) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      formData,
      imageFile,
    }: {
      id: Reward["id"];
      formData: RewardFormData;
      imageFile?: File | null;
    }) => updateReward(id, formData, imageFile),
    onSuccess: (data) => {
      toast.success(data.message);
      queryClient.invalidateQueries({ queryKey: rewardKeys.all });
      onClose();
    },
    onError: (error) =>
      handleApiError(error, setError, "Error al actualizar el premio"),
  });
}

export function useDeleteRewardMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteReward,
    onSuccess: (data) => {
      toast.success(data.message || "Premio eliminado correctamente");
      queryClient.invalidateQueries({ queryKey: rewardKeys.all });
    },
    onError: (error) =>
      handleApiError(error, undefined, "Error al eliminar el premio"),
  });
}

export const useRewardTierPrices = (rewardId: number) => {
  return useQuery({
    queryKey: rewardKeys.tierPrices(rewardId),
    queryFn: () => getTierPrices(rewardId),
    enabled: !!rewardId,
  });
};

export const useUpdateRewardTierPrices = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ rewardId, prices }: { rewardId: number; prices: any[] }) => 
      updateTierPrices(rewardId, prices),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: rewardKeys.tierPrices(variables.rewardId) });
      queryClient.invalidateQueries({ queryKey: rewardKeys.all });
    },
  });
};