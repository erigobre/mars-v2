import { z } from "zod";

// Definimos los estatus exactos que mencionaste
export const rewardClaimStatusSchema = z.enum([
  "reserved",
  "pending",
  "approved",
  "shipped",
  "delivered",
  "rejected",
  "cancelled"
]);

export type RewardClaimStatus = z.infer<typeof rewardClaimStatusSchema>;

export const claimSellerSummarySchema = z.object({
  id: z.number(),
  username: z.string(),
  email: z.string().email().optional().nullable(),
  phone: z.string().optional().nullable(),
  employeeCode: z.string().optional(),
  avatarUrl: z.string().url().nullable().optional(),
  currentPoints: z.number().optional(),
  distributor: z
    .object({
      id: z.number(),
      username: z.string(),
      companyName: z.string()
    })
    .optional(),
});

export const baseRewardClaimSchema = z.object({
  id: z.number(),
  folio: z.string(),
  status: rewardClaimStatusSchema,
  statusLabel: z.string(),
  pointsSpent: z.number(),
  claimedAt: z.string().nullable(),
  notes: z.string().nullable().optional(),
  createdAt: z.string(),
  updatedAt: z.string().nullable(),

  carrier: z.string().nullable().optional(),
  trackingNumber: z.string().nullable().optional(),

  reward: z.object({
    id: z.number(),
    name: z.string(),
    description: z.string().nullable().optional(),
    category: z.string().optional(),
    stock: z.number().optional(),
    pointsRequired: z.number(),
    image: z.string().url().nullable().optional(),
  }),
});

export const rewardClaimSchema = baseRewardClaimSchema.extend({
  seller: claimSellerSummarySchema.optional(),
  cycle: z
    .object({
      id: z.number(),
      name: z.string(),
      startDate: z.string().optional(),
      endDate: z.string().optional(),
    })
    .optional(),
    shippingAddress: z.object({
        name: z.string().nullable(),
        street: z.string().nullable(),
        colonia: z.string().nullable(),
        city: z.string().nullable(),
        state: z.string().nullable(),
        zip: z.string().nullable(),
        notes: z.string().nullable(),
      }).optional(),
});

export type RewardClaim = z.infer<typeof rewardClaimSchema>;

export const rewardClaimsArraySchema = z.array(rewardClaimSchema);

export type RewardClaimArray = z.infer<typeof rewardClaimsArraySchema>;

export const updateRewardClaimSchema = z
  .object({
    status: rewardClaimStatusSchema,
    notes: z.string().optional(),
    carrier: z.string().optional(),
    trackingNumber: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    if (
      data.status === "rejected" &&
      (!data.notes || data.notes.trim() === "")
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Las notas son obligatorias cuando se rechaza un canje.",
        path: ["notes"],
      });
    }
    if (
      data.status === "shipped" &&
      (!data.carrier || data.carrier.trim() === "")
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "El transportista es obligatorio cuando se marca un canje como enviado.",
        path: ["carrier"],
      });
    }
    if (
      data.status === "shipped" &&
      (!data.trackingNumber || data.trackingNumber.trim() === "")
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "El número de seguimiento es obligatorio cuando se marca un canje como enviado.",
        path: ["trackingNumber"],
      });
    }
  });

export type UpdateRewardClaimData = z.infer<typeof updateRewardClaimSchema>;