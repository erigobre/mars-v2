import { z } from "zod";
import { periodSchema } from "./salesAnalytics";

export const claimsFunnelSchema = z.object({
  reserved: z.number(),
  pending: z.number(),
  approved: z.number(),
  shipped: z.number(),
  delivered: z.number(),
  rejected: z.number(),
  total: z.number(),
  conversionRate: z.number(),
});

export const topRewardSchema = z.object({
  rewardId: z.number(),
  name: z.string(),
  image: z.string().nullable().optional(),
  pointsRequired: z.number(),
  claimCount: z.number(),
  totalPointsSpent: z.number(),
  percentageOfTotal: z.number(),
});

export type TopReward = z.infer<typeof topRewardSchema>;

export const claimsVolumeByCycleSchema = z.object({
  cycleId: z.number(),
  cycleName: z.string(),
  period: periodSchema,
  claimCount: z.number(),
  totalPoints: z.number(),
});

export const recentClaimSchema = z.object({
  id: z.number(),
  folio: z.string(),
  userName: z.string(),
  userAvatar: z.string().nullable(),
  userInitials: z.string(),
  rewardName: z.string(),
  rewardImage: z.string().nullable(),
  status: z.string(),
  date: z.string(),
});

export const totalDeliveredSchema = z.object({
  totalDelivered: z.number(),
  totalPointsSpent: z.number(),
});

export const distributorRewardsKpisSchema = z.object({
  claimsToday: z.object({
    value: z.number(),
    trend: z.number(),
    trendLabel: z.string(), // "vs ayer"
  }),
  claimsWeek: z.object({
    value: z.number(),
  }),
  totalDelivered: z.object({
    value: z.number(),
    effectivenessPercentage: z.number(),
  }),
  pointsSpent: z.object({
    value: z.number(),
  }),
});

export type TotalDelivered = z.infer<typeof totalDeliveredSchema>;
export type DistributorRewardsKpis = z.infer<
  typeof distributorRewardsKpisSchema
>;
