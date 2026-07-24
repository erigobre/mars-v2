import { baseGoalProgressSchema, baseGoalSchema } from "@/core/schemas/goal";
import { z } from "zod";

export const sellerGoalProgressSchema = baseGoalProgressSchema.extend({
  id: z.number().nullable().optional(),

  goal: baseGoalSchema
    .pick({
      cycleId: true,
      name: true,
      description: true,
      type: true,
      typeLabel: true,
      targetValue: true,
      rewardPoints: true,
      representationImage:true
    })
    .extend({
      id: z.number().nullable().optional(),
    }),
});

export const mainSallerGoalSchema = sellerGoalProgressSchema.pick({
  targetValue: true,
  currentValue: true,
  percentage: true,
  reached: true,
}).extend({
  name: z.string(),
  description: z.string(),
  growthPercentage: z.number().optional().default(0),
})

export type SellerGoalProgress = z.infer<typeof sellerGoalProgressSchema>;
export type MainSellerGoal = z.infer<typeof mainSallerGoalSchema>;
