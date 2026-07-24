import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { UseFormSetError } from "react-hook-form";
import { toast } from "react-toastify";
import { handleApiError } from "@/core/utils/handleErrors";
import {
  createCycle,
  createWindow,
  deleteCycle,
  deleteWindow,
  generateWindows,
  updateCycle,
  updateWindow,
} from "../api/cyclesAPI";

import type {
  CycleFormData,
  GenerateWindowsData,
  WindowFormData,
} from "../schemas/campaign";
import { campaignKeys } from "./campaignServices";

export function useCreateCycleMutation({
  campaignId,
  setError,
  onClose,
}: {
  campaignId: number;
  setError: UseFormSetError<CycleFormData>;
  onClose: () => void;
}) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (formData: CycleFormData) => createCycle(campaignId, formData),
    onSuccess: (data) => {
      toast.success(data.message || "Ciclo creado correctamente");
      queryClient.invalidateQueries({
        queryKey: campaignKeys.details(campaignId),
      });
      onClose();
    },
    onError: (error) =>
      handleApiError(error, setError, "Error al crear el ciclo"),
  });
}

export function useUpdateCycleMutation({
  campaignId,
  cycleId,
  setError,
  onClose,
}: {
  campaignId: number;
  cycleId: number;
  setError: UseFormSetError<CycleFormData>;
  onClose: () => void;
}) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (
      formData: Pick<
        CycleFormData,
        "name" | "startDate" | "endDate" | "isActive"
      >
    ) => updateCycle(campaignId, cycleId, formData),
    onSuccess: (data) => {
      toast.success(data.message || "Ciclo actualizado correctamente");
      queryClient.invalidateQueries({
        queryKey: campaignKeys.details(campaignId),
      });
      onClose();
    },
    onError: (error) =>
      handleApiError(error, setError, "Error al actualizar el ciclo"),
  });
}

export function useDeleteCycleMutation(campaignId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (cycleId: number) => deleteCycle(campaignId, cycleId),
    onSuccess: (data) => {
      toast.success(data.message || "Ciclo eliminado correctamente");
      queryClient.invalidateQueries({
        queryKey: campaignKeys.details(campaignId),
      });
    },
    onError: (error) =>
      handleApiError(error, undefined, "Error al eliminar el ciclo"),
  });
}

export function useGenerateWindowsMutation(
  campaignId: number,
  cycleId: number
) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: GenerateWindowsData) =>
      generateWindows(campaignId, cycleId, payload),
    onSuccess: (data) => {
      const count = Array.isArray(data.data) ? data.data.length : 0;
      toast.success(
        data.message || `${count} ventana(s) generada(s) correctamente`
      );
      queryClient.invalidateQueries({
        queryKey: campaignKeys.details(campaignId),
      });
    },
    onError: (error) =>
      handleApiError(error, undefined, "Error al generar ventanas"),
  });
}

export function useCreateWindowMutation({
  campaignId,
  cycleId,
  setError,
  onClose,
}: {
  campaignId: number;
  cycleId: number;
  setError: UseFormSetError<WindowFormData>;
  onClose: () => void;
}) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (formData: WindowFormData) =>
      createWindow(campaignId, cycleId, formData),
    onSuccess: (data) => {
      toast.success(data.message || "Ventana creada correctamente");
      queryClient.invalidateQueries({
        queryKey: campaignKeys.details(campaignId),
      });
      onClose();
    },
    onError: (error) =>
      handleApiError(error, setError, "Error al crear la ventana"),
  });
}

export function useUpdateWindowMutation({
  campaignId,
  cycleId,
  windowId,
  setError,
  onClose,
}: {
  campaignId: number;
  cycleId: number;
  windowId: number;
  setError: UseFormSetError<WindowFormData>;
  onClose: () => void;
}) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (formData: WindowFormData) =>
      updateWindow(campaignId, cycleId, windowId, formData),
    onSuccess: (data) => {
      toast.success(data.message || "Ventana actualizada correctamente");
      queryClient.invalidateQueries({
        queryKey: campaignKeys.details(campaignId),
      });
      onClose();
    },
    onError: (error) =>
      handleApiError(error, setError, "Error al actualizar la ventana"),
  });
}

export function useDeleteWindowMutation(campaignId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      cycleId,
      windowId,
    }: {
      cycleId: number;
      windowId: number;
    }) => deleteWindow(campaignId, cycleId, windowId),
    onSuccess: (data) => {
      toast.success(data.message || "Ventana eliminada correctamente");
      queryClient.invalidateQueries({
        queryKey: campaignKeys.details(campaignId),
      });
    },
    onError: (error) =>
      handleApiError(error, undefined, "Error al eliminar la ventana"),
  });
}
