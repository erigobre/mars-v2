import { z } from 'zod';


export const RedemptionCycleSchema = z.object({
  id: z.number(),
  name: z.string(),
  startDate: z.string().nullable(),
  endDate: z.string().nullable(),
  isActive: z.boolean(),
  hasOpenWindow: z.boolean(),

  campaignId: z.number().optional(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
});

export const RedemptionCyclesArraySchema = z.array(RedemptionCycleSchema);

export type RedemptionCycle = z.infer<typeof RedemptionCycleSchema>;