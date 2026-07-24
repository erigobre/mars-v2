import { z } from "zod";

export const periodSchema = z.object({
  start: z.string(), // ISO String
  end: z.string(), // ISO String
});

export const salesAnalyticsStatusSchema = z.enum([
  "achieved",
  "on_track",
  "at_risk",
  "critical",
  "no_campaign",
]);

export const salesVsGoalsSchema = z.object({
  currentSales: z.number(),
  goal: z.number(),
  percentage: z.number(),
  status: salesAnalyticsStatusSchema,
  campaignName: z.string().nullable().optional(),
  period: periodSchema.optional(),
});

export const topProductSchema = z.object({
  productId: z.number(),
  name: z.string(),
  image: z.string().nullable().optional(),
  sku: z.string(),
  totalSold: z.number(),
  totalRevenue: z.number(),
  totalPoints: z.number(),
  percentageOfTotal: z.number(),
});

export const sellerComparisonSchema = z.object({
  rank: z.number(),
  sellerId: z.number(),
  sellerName: z.string(),
  employeeCode: z.string().nullable(),
  distributorName: z.string(),
  totalPoints: z.number(),
});

export const salesByDistributorSchema = z.object({
  distributorId: z.number(),
  distributorName: z.string(),
  totalSales: z.number(),
  activeSellers: z.number(),
  totalTransactions: z.number(),
  percentage: z.number(),
});
