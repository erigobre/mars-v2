import { z } from "zod";

export const CampaignSchema = z.object({
  id: z.number(),
  name: z.string(),
  startDate: z.string().nullable(),
  endDate: z.string().nullable(),
  isActive: z.boolean().optional(),
});

export const CycleSchema = z.object({
  id: z.number(),
  name: z.string(),
  startDate: z.string().nullable(),
  endDate: z.string().nullable(),
});

export const RankingSchema = z.object({
  rank: z.number(),
  sellerId: z.number(),
  sellerName: z.string().nullable(),
  employeeCode: z.string().nullable(),
  avatarUrl: z.string().nullable(),
  totalPoints: z.number(),
  distributorName: z.string().nullable().optional(),
});

export const CurrentCampaignRankingDataSchema = z.object({
  campaign: CampaignSchema.optional(),
  scope: z.enum(["global", "distribuidor"]),
  ranking: z.array(RankingSchema),
  canGenerate: z.boolean().optional(),
});

export const CurrentCycleRankingDataSchema =
  CurrentCampaignRankingDataSchema.extend({
    cycle: CycleSchema,
  });


export type Ranking = z.infer<typeof RankingSchema>;
export type CurrentCampaignRankingData = z.infer<
  typeof CurrentCampaignRankingDataSchema
>;
export type CurrentCycleRankingData = z.infer<
  typeof CurrentCycleRankingDataSchema
>;
