import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
  type UseQueryResult,
} from "@tanstack/react-query";
import {
  createCampaign,
  deleteCampaign,
  getCampaigns,
  getCampaingById,
  updateCampaing,
  getCycleRanking,
  generateCycleRanking,
  changeCampaignStatus,
  closeCampaign,
} from "../api/campaignsAPI";
import type { UseFormSetError } from "react-hook-form";
import type { Campaign, CampaignFormData } from "../schemas/campaign";
import { handleApiError } from "@/core/utils/handleErrors";
import { toast } from "react-toastify";
import type { PaginatedData } from "@/core/types";

export const campaignKeys = {
  all: ["campaigns"] as const,
  list: (filters: { page: number; perPage: number; search?: string }) =>
    [...campaignKeys.all, "list", filters] as const,
  details: (id: number) => [...campaignKeys.all, "detail", id] as const,
  ranking: (campaignId: number, cycleId: number) =>
    [...campaignKeys.details(campaignId), "ranking", cycleId] as const,
};

export function useCampaignsQuery(
  page: number,
  perPage: number,
  options?: any
) {
  return useQuery({
    queryKey: campaignKeys.list({ page, perPage }),
    queryFn: () => getCampaigns(page, perPage),
    placeholderData: keepPreviousData,
    staleTime: 1000 * 60 * 5,
    ...options,
  }) as UseQueryResult<PaginatedData<Campaign[]>>;
}

export function useCampaignDetailsQuery(id: Campaign["id"] | "", options = {}) {
  return useQuery({
    queryKey: campaignKeys.details(Number(id)),
    queryFn: () => getCampaingById(Number(id)),
    enabled: !!id,
    placeholderData: keepPreviousData,
    staleTime: 1000 * 60 * 5,
    ...options,
  });
}

export function useCreateCampaingMutation({
  setError,
  onClose,
}: {
  setError: UseFormSetError<CampaignFormData>;
  onClose: () => void;
}) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createCampaign,

    onSuccess: (data) => {
      toast.success(data.message);
      queryClient.invalidateQueries({ queryKey: campaignKeys.all });
      onClose();
    },

    onError: (error) => {
      handleApiError(
        error,
        setError,
        "Ha ocurrido un error al crear la campaña"
      );
    },
  });
}

export function useUpdateCampaingMutation({
  setError,
  onClose,
}: {
  setError: UseFormSetError<CampaignFormData>;
  onClose: () => void;
}) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      formData,
    }: {
      id: Campaign["id"];
      formData: CampaignFormData;
    }) => updateCampaing(id, formData),

    onSuccess: (data) => {
      toast.success(data.message);
      queryClient.invalidateQueries({ queryKey: campaignKeys.all });
      onClose();
    },

    onError: (error) => {
      handleApiError(
        error,
        setError,
        "Ha ocurrido un error al actualizar la campaña"
      );
    },
  });
}

export function useDeleteCampaignMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteCampaign,
    onSuccess: (data) => {
      toast.success(data.message || "Campaña eliminada correctamente");
      queryClient.invalidateQueries({ queryKey: campaignKeys.all });
    },
    onError: (error) => {
      handleApiError(
        error,
        undefined,
        "Ha ocurrido un error al eliminar la campaña"
      );
    },
  });
}

export function useCycleRankingQuery(
  campaignId: number,
  cycleId: number,
  enabled: boolean
) {
  return useQuery({
    queryKey: campaignKeys.ranking(campaignId, cycleId),
    queryFn: () => getCycleRanking(campaignId, cycleId),
    enabled: enabled && !!campaignId && !!cycleId,
    retry: false,
  });
}

export function useGenerateCycleRankingMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      campaignId,
      cycleId,
    }: {
      campaignId: number;
      cycleId: number;
    }) => generateCycleRanking(campaignId, cycleId),
    onSuccess: (_, variables) => {
      toast.success("Ranking generado exitosamente");
      queryClient.invalidateQueries({
        queryKey: campaignKeys.ranking(variables.campaignId, variables.cycleId),
      });
    },
    onError: (error) => {
      handleApiError(error, undefined, "Error al generar el ranking");
    },
  });
}

export function useChangeCampaignStatusMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      status,
    }: {
      id: number;
      status: "RUNNING" | "PAUSED" | "COMPLETED";
    }) => changeCampaignStatus(id, status),
    onSuccess: (_, variables) => {
      toast.success("Estado de la campaña actualizado");
      queryClient.invalidateQueries({ queryKey: campaignKeys.all });
      queryClient.invalidateQueries({
        queryKey: campaignKeys.details(variables.id),
      });
    },
  });
}

export function useCloseCampaignMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: closeCampaign,
    onSuccess: (_, id: number) => {
      toast.success("Campaña cerrada definitivamente");
      queryClient.invalidateQueries({ queryKey: campaignKeys.all });
      queryClient.invalidateQueries({ queryKey: campaignKeys.details(id) });
    },
  });
}
