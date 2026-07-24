import { sellerTierSchema } from "@/feature/seller-tiers/schemas/sellerTier";
import { z } from "zod";

export const rewardTierPriceSchema = z.object({
  id: z.number().optional(),
  price: z.number(),
  isCustom: z.boolean(),
  tier: sellerTierSchema.optional(),
});

export const rewardTierPriceArraySchema = z.array(rewardTierPriceSchema);

export const rewardTierPriceFormSchema = z.object({
  price: z.number(),
  tierId: z.number().optional(),
});

export type RewardTierPrice = z.infer<typeof rewardTierPriceSchema>;
export type RewardTierPriceForm = z.infer<typeof rewardTierPriceFormSchema>;

export const rewardClaimSchema = z.object({
  id: z.number(),
  sellerId: z.number(),
  sellerName: z.string(),
  sellerAvatar: z.string().url().nullable().optional(),
  distributorName: z.string().nullable().optional(),
  status: z.enum(["pending", "delivered", "cancelled"]),
  createdAt: z.string().datetime().optional(),
});

export type RewardClaim = z.infer<typeof rewardClaimSchema>;

export const rewardVisibilitySchema = z.enum(['always', 'campaign_end', 'cycle_end']);

export const rewardSchema = z.object({
  id: z.number(),
  name: z.string(),
  description: z.string().nullable().optional(),
  pointsRequired: z.number(),
  image: z.string().url().nullable().optional(),
  imageThumb: z.string().url().nullable().optional(),
  category: z.string().nullable().optional(),
  isAvailable: z.boolean(),
  isFeatured: z.boolean().optional(),
  // Admin-only fields
  stock: z.number().optional(),
  isActive: z.boolean().optional(),
  maxGlobalClaims: z.number().nullable().optional(),
  totalClaimed: z.number().optional(),
  visibility: rewardVisibilitySchema.optional(),
  baseCost: z.number().nullable().optional(),
  createdAt: z.string().datetime().optional(),
  updatedAt: z.string().datetime().optional(),
  claimsList: z.array(rewardClaimSchema).optional(),
  totalClaimsCount: z.number().optional(),
});

export const rewardsArraySchema = z.array(rewardSchema);

export type RewardVisibility = z.infer<typeof rewardVisibilitySchema>;

export type Reward = z.infer<typeof rewardSchema>;

export const rewardFormSchema = z.object({
  name: z
    .string()
    .min(1, "El nombre es requerido")
    .max(255, "Máximo 255 caracteres"),
  description: z.string().optional(),
  image: z.string().url().nullable().optional(),
  pointsRequired: z
    .number({ message: "Ingresa un número válido" })
    .min(1, "Debe ser mayor a 0"),
  baseCost: z.number().nullable().optional(),
  stock: z
    .number({ message: "Ingresa un número válido" })
    .int()
    .min(0, "No puede ser negativo"),
  category: z.string().optional(),
  isActive: z.boolean(),
  isFeatured: z.boolean(),
  visibility: rewardVisibilitySchema,
  maxGlobalClaims: z.number().int().min(0).nullable().optional(),
});

export type RewardFormData = z.infer<typeof rewardFormSchema>;
