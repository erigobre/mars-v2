import { z } from "zod";
import { sellerComparisonSchema } from "./salesAnalytics";
import { rewardClaimStatusSchema } from "@/feature/reward-claims/schema/rewardClaim";

// ==========================================
// PANTALLA 1: COMMERCIAL NETWORK (Ventas)
// ==========================================

export const TopProductItemSchema = z
  .object({
    productId: z.number(),
    name: z.string().optional(),
    image: z.string().optional(),
    sku: z.string().optional(),
    totalSold: z.number().optional(),
    totalRevenue: z.number().optional(),
    totalPoints: z.number().optional(),
    percentageOfTotal: z.number().optional(),
  })
  .passthrough();

export const KpiItemSchema = z
  .object({
    value: z.number(),
    trend: z.number().optional(),
    trendLabel: z.string().optional(),
    effectivenessPercentage: z.number().optional(),
  })
  .passthrough(); // Permite campos adicionales sin causar error, útil para KPIs flexibles

export const CommercialNetworkResponseSchema = z.object({
  kpis: z.record(z.string(), KpiItemSchema).optional(),
  teamRanking: z.array(sellerComparisonSchema),
  topProducts: z.array(TopProductItemSchema),
});

export type CommercialNetworkData = z.infer<
  typeof CommercialNetworkResponseSchema
>;

// ==========================================
// PANTALLA 2: REWARDS NETWORK (Premios)
// ==========================================

export const RewardsKpiItemSchema = z
  .object({
    value: z.number(),
    trend: z.number().optional(),
    trendLabel: z.string().optional(),
    effectivenessPercentage: z.number().optional(),
  })
  .passthrough();

export type RewardsKpiItem = z.infer<typeof RewardsKpiItemSchema>;

export const RewardsKpiSchema = z.object({
    claimsToday: RewardsKpiItemSchema.optional(),
    claimsWeek: RewardsKpiItemSchema.optional(),
    totalDelivered: RewardsKpiItemSchema.optional(),
    pointsSpent: RewardsKpiItemSchema.optional(),
});

export type RewardsKpi = z.infer<typeof RewardsKpiSchema>;


export const ShippingFunnelSchema = z
  .object({
    reserved: z.number().optional(),
    pending: z.number().optional(),
    approved: z.number().optional(),
    shipped: z.number().optional(),
    delivered: z.number().optional(),
    rejected: z.number().optional(),
    total: z.number().optional(),
    conversionRate: z.number().optional(),
  })
  .passthrough();

export type ShippingFunnel = z.infer<typeof ShippingFunnelSchema>;

export const RecentClaimSchema = z
  .object({
    id: z.number(),
    folio: z.string(),
    userName: z.string(),
    userAvatar: z.string().nullable(),
    userInitials: z.string(),
    rewardName: z.string(),
    rewardImage: z.string().optional(),
    status: rewardClaimStatusSchema,
    date: z.string(),
  })
  .passthrough();

export type RecentClaim = z.infer<typeof RecentClaimSchema>;

export const RewardsNetworkResponseSchema = z.object({
  kpis: RewardsKpiSchema.optional(),
  shippingStatus: ShippingFunnelSchema.optional(),
  recentClaims: z.array(RecentClaimSchema).optional(),
});

export type RewardsNetworkData = z.infer<typeof RewardsNetworkResponseSchema>;
