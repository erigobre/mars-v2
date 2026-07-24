import { rewardClaimSchema } from "@/feature/reward-claims/schema/rewardClaim";
import { z } from "zod";

export const eligibilityReasonSchema = z.object({
  code: z.string(),
  message: z.string(),
  detail: z.string().optional(),
  claimId: z.number().optional(),
  expiresAt: z.string().optional(),
});

export const eligibilitySchema = z.object({
  canClaim: z.boolean(),
  hasShippingData: z.boolean(),
  reasons: z.array(eligibilityReasonSchema),
  reward: z
    .object({
      id: z.number(),
      name: z.string(),
      pointsRequired: z.number(),
      stock: z.number(),
    })
    .nullable(),
  pendingClaim: rewardClaimSchema.optional().nullable()
});

export type Eligibility = z.infer<typeof eligibilitySchema>;
export type EligibilityReason = z.infer<typeof eligibilityReasonSchema>;

export const shippingFormSchema = z.object({
  shippingName: z
    .string()
    .min(1, "El nombre es requerido")
    .max(150, "Máximo 150 caracteres"),
  shippingStreet: z
    .string()
    .min(1, "La dirección es requerida")
    .max(255, "Máximo 255 caracteres"),
  shippingColonia: z
    .string()
    .min(1, "La colonia es requerida")
    .max(150, "Máximo 150 caracteres"),
  shippingCity: z
    .string()
    .min(1, "La ciudad es requerida")
    .max(100, "Máximo 100 caracteres"),
  shippingState: z
    .string()
    .min(1, "El estado es requerido")
    .max(100, "Máximo 100 caracteres"),
  shippingZip: z
    .string()
    .min(1, "El C.P. es requerido")
    .regex(/^\d{5}$/, "El C.P. debe tener 5 dígitos"),
  shippingNotes: z.string().max(500, "Máximo 500 caracteres").optional(),
  saveToProfile: z.boolean(),
});

export type ShippingFormData = z.infer<typeof shippingFormSchema>;