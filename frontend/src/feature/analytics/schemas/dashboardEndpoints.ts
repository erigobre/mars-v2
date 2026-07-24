import { z } from "zod";
import {
  salesByDistributorSchema,
  salesVsGoalsSchema,
  sellerComparisonSchema,
  topProductSchema,
} from "./salesAnalytics";
import {
  monthlyEvolutionSchema,
  weeklyEvolutionSchema,
} from "./economyRewardsAnalytics";
import {
  userActivityRateSchema,
  campaignParticipationSchema,
  engagementScoreSchema,
} from "./adoptionAnalytics";
import {
  claimsFunnelSchema,
  topRewardSchema,
  claimsVolumeByCycleSchema,
  recentClaimSchema,
} from "./rewardAnalytics";

// GET /api/v1/admin/dashboard/overview
export const adminOverviewResponseSchema = z.object({
  kpis: z.object({
    // Reciclamos el schema, pero le decimos a Zod que el backend aquí solo envía estos 4 campos
    salesVsGoals: salesVsGoalsSchema.pick({
      currentSales: true,
      goal: true,
      percentage: true,
      status: true,
    }),
    circulatingDebt: z.object({
      totalPoints: z.number(),
      status: z.string(),
    }),
    adoptionRate: userActivityRateSchema.pick({
      percentage: true,
      activeUsers: true,
      totalUsers: true,
      status: true,
    }),
    claimsFunnel: claimsFunnelSchema.pick({
      pending: true,
      approved: true,
      shipped: true,
      delivered: true,
    }),
  }),
  charts: z.object({
    // Reciclamos directamente
    monthlyEvolution: z.array(monthlyEvolutionSchema),
  }),
  // Reciclamos directamente
  leaderboard: z.array(sellerComparisonSchema),
});

export type AdminOverviewData = z.infer<typeof adminOverviewResponseSchema>;

// GET /api/v1/admin/dashboard/sales-performance
export const adminSalesPerformanceResponseSchema = z.object({
  filters: z.object({
    campaignId: z.coerce.number().nullable(), 
    distributorId: z.coerce.number().nullable(),
  }),
  sellersRanking: z.array(sellerComparisonSchema),
  salesByDistributor: z.array(salesByDistributorSchema).nullable(),
  topProducts: z.array(topProductSchema),
});

export type AdminSalesPerformanceData = z.infer<
  typeof adminSalesPerformanceResponseSchema
>;

// GET /api/v1/admin/dashboard/economy-rewards
export const adminEconomyRewardsResponseSchema = z.object({
  kpis: z.object({
    balanceTotal: z.object({ value: z.number() }),
    canjesHoy: z.object({ value: z.number() }),
    pendientes: z.object({ value: z.number() }),
    tasaQuema: z.object({ percentage: z.number(), trend: z.number() }),
  }),
  ecosystemBalance: z.array(weeklyEvolutionSchema),
  topRewards: z.array(topRewardSchema),
  claimsByCycle: z.array(claimsVolumeByCycleSchema),
  recentClaims: z.array(recentClaimSchema),
});

export type AdminEconomyRewardsData = z.infer<
  typeof adminEconomyRewardsResponseSchema
>;

// GET /api/v1/admin/dashboard/adoption-gamification
export const adminAdoptionGamificationResponseSchema = z.object({
  activityRate: userActivityRateSchema,
  campaignParticipation: campaignParticipationSchema,
  engagement: engagementScoreSchema,
  topEngagedSellers: z.array(sellerComparisonSchema),
});

export type AdminAdoptionGamificationData = z.infer<
  typeof adminAdoptionGamificationResponseSchema
>;
