import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getTierPriceMatrix,
  updateBulkTierPrices,
  type BulkPriceRule,
} from "../api/TierPriceMatrixAPI";
import { handleApiError } from "@/core/utils/handleErrors";
import Swal from "sweetalert2";

export const useTierPriceMatrixQuery = (distributorId: number) => {
  return useQuery({
    queryKey: ["tierPriceMatrix", distributorId],
    queryFn: () => getTierPriceMatrix(distributorId),
    enabled: !!distributorId,
  });
};

export const useUpdateBulkPricesMutation = (distributorId: number) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (rules: BulkPriceRule[]) =>
      updateBulkTierPrices(distributorId, rules),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ["tierPriceMatrix", distributorId] });
      queryClient.invalidateQueries({ queryKey: ["rewards"] });
      Swal.fire("Éxito", res.message, "success");
    },
    onError: (error) => handleApiError(error, undefined, "Error al actualizar precios"),
  });
};
