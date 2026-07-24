import { z } from 'zod';

export const ActivityLogUserSchema = z.object({
  id: z.number(),
  username: z.string(),
  email: z.string().email(),
});

export const ActivityLogSchema = z.object({
  id: z.number(),
  actionType: z.string(),
  modelType: z.string(),
  modelId: z.number().or(z.string()),
  description: z.string(),
  
  oldValues: z.record(z.string(), z.unknown()).nullable().optional(),
  newValues: z.record(z.string(), z.unknown()).nullable().optional(),
  
  ipAddress: z.string().nullable().optional(),
  userAgent: z.string().nullable().optional(),
  
  createdAt: z.string().datetime().optional(), 
  
  user: ActivityLogUserSchema.optional(),
});

export type ActivityLogUser = z.infer<typeof ActivityLogUserSchema>;
export type ActivityLog = z.infer<typeof ActivityLogSchema>;