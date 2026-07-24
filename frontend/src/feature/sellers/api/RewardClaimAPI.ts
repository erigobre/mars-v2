import api from "@/core/api/axios";
import type { ApiResponse } from "@/core/types";
import {
  eligibilitySchema,
  type Eligibility,
  type ShippingFormData,
} from "../schemas/rewardClaim";
import { safeValidate } from "@/core/utils/zodHelper";
import {
  rewardClaimSchema,
  type RewardClaim,
} from "@/feature/reward-claims/schema/rewardClaim";

export async function checkEligibility(rewardId: number) {
  const { data } = await api.get<ApiResponse<Eligibility>>(
    `/reward-claims/eligibility/${rewardId}`
  );
  safeValidate(eligibilitySchema, data.data);
  return data.data;
}

export async function reserveClaim(rewardId: number) {
  const { data } = await api.post<ApiResponse<RewardClaim>>(
    `/reward-claims/reserve`,
    { rewardId }
  );
  safeValidate(rewardClaimSchema, data.data);
  return data;
}

export async function confirmClaim(
  claimId: number,
  shipping: ShippingFormData
) {
  const { data } = await api.post<ApiResponse<RewardClaim>>(
    `/reward-claims/${claimId}/confirm`,
    {
      shipping_name: shipping.shippingName,
      shipping_street: shipping.shippingStreet,
      shipping_colonia: shipping.shippingColonia,
      shipping_city: shipping.shippingCity,
      shipping_state: shipping.shippingState,
      shipping_zip: shipping.shippingZip,
      shipping_notes: shipping.shippingNotes ?? null,
      save_to_profile: shipping.saveToProfile,
    }
  );
  safeValidate(rewardClaimSchema, data.data);
  return data;
}

export async function cancelClaim(claimId: number) {
  const { data } = await api.post<ApiResponse<RewardClaim>>(
    `/reward-claims/${claimId}/cancel`
  );
  return data;
}

export async function downloadReceipt(claim: RewardClaim) {
  const response = await api.get(`/reward-claims/${claim.id}/receipt`, {
    responseType: "blob",
  });

  const nombreLimpio = claim.seller!.username
    .replace(/\s+/g, "_")
    .toLowerCase();

  // Formateamos la fecha a YYYYMMDD (Ej: 20260322)
  const fecha = new Date().toISOString().slice(0, 10).replace(/-/g, "");

  const nombreArchivo = `Comprobante_${claim.folio}_${nombreLimpio}_${fecha}.pdf`;

  const url = window.URL.createObjectURL(new Blob([response.data]));

  const link = document.createElement("a");
  link.href = url;

  link.setAttribute("download", nombreArchivo);

  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
}
