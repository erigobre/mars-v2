import { z } from "zod";
import { periodSchema } from "./salesAnalytics";

export const engagementStatusSchema = z.enum([
  "highly_engaged",
  "engaged",
  "healthy",
  "moderately_engaged",
  "low_engagement",
]);

export const userActivityRateSchema = z.object({
  activeUsers: z.number(),
  inactiveUsers: z.number(),
  totalUsers: z.number(),
  adoptionRate: z.number(),
  percentage: z.number().optional(),
  sampleAvatars: z.array(z.string()),
  periodDays: z.number(),
  status: z.enum(["excellent", "good", "fair", "poor"]),
});

export type UserActivityRate = z.infer<typeof userActivityRateSchema>

export const campaignParticipationSchema = z.object({
  campaignName: z.string().nullable(),
  participants: z.number(),
  totalEligible: z.number(),
  participationRate: z.number(),
  period: periodSchema.optional(),
});

export const engagementScoreSchema = z.object({
  engagementScore: z.number(),
  breakdown: z.object({
    sellersWithSales: z.number(),
    sellersWithClaims: z.number(),
    sellersWithGoals: z.number(),
    totalSellers: z.number(),
  }),
  periodDays: z.number(),
  status: engagementStatusSchema,
});
