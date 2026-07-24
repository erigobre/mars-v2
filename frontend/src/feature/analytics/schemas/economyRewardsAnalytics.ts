import { z } from "zod";

export const economyTrendSchema = z.object({
  vsPreviousCampaign: z.number(),
  direction: z.enum(["up", "down", "stable"]),
});

export const economyStatusSchema = z.enum([
  "low_engagement",
  "high_liability",
  "healthy",
  "high_redemption",
  "normal",
]);

export const pointsEconomySchema = z.object({
  totalIssued: z.number(),
  totalRedeemed: z.number(),
  circulatingDebt: z.number(),
  redemptionRate: z.number(),
  status:economyStatusSchema,
  trend: economyTrendSchema.nullable(),
});

export const monthlyEvolutionSchema = z.object({
  month: z.string(), // YYYY-MM
  issued: z.number(),
  redeemed: z.number(),
  net: z.number(),
});

export type MonthlyEvolution = z.infer<typeof monthlyEvolutionSchema>;

export const weeklyEvolutionSchema = z.object({
  day: z.string(),
  issued: z.number(),
  redeemed: z.number(),
});

export type WeeklyEvolution = z.infer<typeof weeklyEvolutionSchema>;