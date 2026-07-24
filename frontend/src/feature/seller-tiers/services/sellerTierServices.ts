import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getSellerTiers,
  getSellerTierById,
  createSellerTier,
  updateSellerTier,
  deleteSellerTier,
  recalculateSellerTiers,
} from "../api/SellerTierAPI";
import type {
  SellerTierFormData,
  SellerTierFilters,
} from "../schemas/sellerTier";
import { handleApiError } from "@/core/utils/handleErrors";
import Swal from "sweetalert2";
import { sellerAdminKeys } from "@/feature/management/sellers/services/sellerServices";

export const useSellerTiersQuery = (
  page: number,
  perPage: number,
  filters: SellerTierFilters,
) => {
  return useQuery({
    queryKey: ["sellerTiers", page, perPage, filters],
    queryFn: () => getSellerTiers({ page, per_page: perPage, filters }),
  });
};

export const useSellerTierByIdQuery = (id: number) => {
  return useQuery({
    queryKey: ["sellerTiers", id],
    queryFn: () => getSellerTierById(id),
    enabled: !!id,
  });
};

export const useCreateSellerTierMutation = ({
  onClose,
  setError,
}: {
  onClose: () => void;
  setError: any;
}) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createSellerTier,
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ["sellerTiers"] });
      queryClient.invalidateQueries({ queryKey: sellerAdminKeys.all });
      Swal.fire("Éxito", res.message, "success");
      onClose();
    },
    onError: (error) => handleApiError(error, setError),
  });
};

export const useUpdateSellerTierMutation = ({
  onClose,
  setError,
}: {
  onClose: () => void;
  setError: any;
}) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      formData,
    }: {
      id: number;
      formData: Partial<SellerTierFormData>;
    }) => updateSellerTier(id, formData),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ["sellerTiers"] });
      queryClient.invalidateQueries({ queryKey: sellerAdminKeys.all });
      Swal.fire("Éxito", res.message, "success");
      onClose();
    },
    onError: (error) => handleApiError(error, setError),
  });
};

export const useDeleteSellerTierMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteSellerTier,
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ["sellerTiers"] });
      Swal.fire("Eliminado", res.message, "success");
    },
    onError: (error) => handleApiError(error, undefined, "Error al eliminar")
  });
};

export const useRecalculateTiersMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: recalculateSellerTiers,
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ["sellerTiers"] });
      Swal.fire("Recalculado", res.message, "success");
    },
    onError: (error) => handleApiError(error, undefined, "Error al recalcular")
  });
};
