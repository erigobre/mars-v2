import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import type { UseFormSetError } from "react-hook-form";
import { toast } from "react-toastify";
import { handleApiError } from "@/core/utils/handleErrors";
import type { SaleFormData, BulkSaleFormData } from "../schemas/sale";
import {
  getSales,
  getSaleById,
  getUploadStatus,
  createSale,
  createBulkSales,
  uploadSalesFile,
  downloadTemplate,
} from "../api/SalesAPI";

export const salesKeys = {
  all: ["sales"] as const,
  list: (filters: { page: number; perPage: number; search?: string; distributorId?: number }) =>
    [...salesKeys.all, "list", filters] as const,
  details: (id: number) => [...salesKeys.all, "detail", id] as const,
  uploadStatus: (jobId: string) =>
    [...salesKeys.all, "upload-status", jobId] as const,
};

export function useSalesQuery(page: number, perPage: number, search?: string, distributorId?: number) {
  return useQuery({
    queryKey: salesKeys.list({ page, perPage, search, distributorId }),
    queryFn: () => getSales(page, perPage, search, distributorId),
    placeholderData: keepPreviousData,
    staleTime: 1000 * 60 * 2,
  });
}

export function useSaleDetailsQuery(id: number) {
  return useQuery({
    queryKey: salesKeys.details(id),
    queryFn: () => getSaleById(id),
    staleTime: 1000 * 60 * 5,
  });
}

export function useUploadStatusQuery(jobId: string | null, enabled = false) {
  return useQuery({
    queryKey: salesKeys.uploadStatus(jobId || ""),
    queryFn: () => getUploadStatus(jobId!),
    enabled: enabled && !!jobId,
    refetchInterval: (query) => {
      const data = query.state.data;
      if (
        data?.status === "completed" ||
        data?.status === "failed" ||
        data?.status === "cancelled"
      ) {
        return false;
      }
      return 3000;
    },
    staleTime: 0,
  });
}

export function useCreateSaleMutation({
  setError,
  onClose,
}: {
  setError: UseFormSetError<SaleFormData>;
  onClose: () => void;
}) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createSale,
    onSuccess: (data) => {
      toast.success(data.message || "Venta registrada correctamente");
      queryClient.invalidateQueries({ queryKey: salesKeys.all });
      onClose();
    },
    onError: (error) =>
      handleApiError(error, setError, "Error al registrar la venta"),
  });
}

export function useCreateBulkSalesMutation({
  setError,
  onClose,
}: {
  setError: UseFormSetError<BulkSaleFormData>;
  onClose: () => void;
}) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createBulkSales,
    onSuccess: (data) => {
      toast.success(data.message || "Ventas registradas correctamente");
      queryClient.invalidateQueries({ queryKey: salesKeys.all });
      onClose();
    },
    onError: (error) =>
      handleApiError(error, setError, "Error al registrar las ventas"),
  });
}

export function useUploadSalesFileMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      file,
      distributorId,
    }: {
      file: File;
      distributorId?: number;
    }) => uploadSalesFile(file, distributorId),
    onSuccess: (data) => {
      toast.success(
        data.message || "Archivo recibido. El procesamiento está en curso."
      );
      queryClient.invalidateQueries({ queryKey: salesKeys.all });
    },
    onError: (error) =>
      handleApiError(error, undefined, "Error al subir el archivo"),
  });
}

export function useDownloadTemplateMutation() {
  return useMutation({
    mutationFn: downloadTemplate,
    onSuccess: () => {
      toast.success("Plantilla descargada correctamente");
    },
    onError: (error) =>
      handleApiError(error, undefined, "Error al descargar la plantilla"),
  });
}
