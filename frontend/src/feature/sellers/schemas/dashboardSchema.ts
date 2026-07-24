import { z } from "zod";
import { rewardClaimSchema } from "@/feature/reward-claims/schema/rewardClaim";
import { mainSallerGoalSchema, sellerGoalProgressSchema } from "./goal";


export const dashboardSellerSchema = z.object({
  id: z.number(),
  name: z.string(),
  avatar: z.string().nullable(),
  currentPoints: z.number().int(),
});

export const dashboardCycleSchema = z.object({
  id: z.number(),
  name: z.string(),
  startDate: z.string().nullable(),
  endDate: z.string().nullable(),
});

export const dashboardStoreStatusSchema = z.object({
  isOpen: z.boolean(),
  opensAt: z.string().nullable(),
  closesAt: z.string().nullable(),
  nextOpeningAt: z.string().nullable(),
  claimedThisCycle: z.boolean(),
  pendingReservationsCount: z.number().default(0),
  pendingReservations: z.array(rewardClaimSchema).default([]),
});

export const dashboardStatsSchema = z.object({
  cyclePoints: z.number(),
  totalSalesAmount: z.number(),
});

export const goalFallbackSchema = z.object({
  goalPoints: z.number(),
  currentPoints: z.number(),
  percentage: z.number(),
  reached: z.boolean(),
  source: z.string(),
  goalName: z.string(),
});

// export const dashboardGoalsSchema = z.object({
//   closest: sellerGoalProgressSchema.nullable(),
//   newest: sellerGoalProgressSchema.nullable(),
//   fallback: goalFallbackSchema.nullable()
// });
export const dashboardGoalsSchema = z.object({
  mainGoal: mainSallerGoalSchema.nullable(),
  secondaryGoal: sellerGoalProgressSchema.nullable(),
});

export const sellerDashboardSchema = z.object({
  seller: dashboardSellerSchema,
  cycle: dashboardCycleSchema.nullable(),
  storeStatus: dashboardStoreStatusSchema,
  stats: dashboardStatsSchema,
  goals: dashboardGoalsSchema,
});

export type SellerDashboard = z.infer<typeof sellerDashboardSchema>;
export type DashboardSeller = z.infer<typeof dashboardSellerSchema>;
export type DashboardCycle = z.infer<typeof dashboardCycleSchema>;
export type DashboardStoreStatus = z.infer<typeof dashboardStoreStatusSchema>;
export type DashboardStats = z.infer<typeof dashboardStatsSchema>;
export type DashboardGoals = z.infer<typeof dashboardGoalsSchema>;