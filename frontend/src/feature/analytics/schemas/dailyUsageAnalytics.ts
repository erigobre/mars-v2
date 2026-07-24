import { z } from "zod";
 
const recentLoginSchema = z.object({
  id: z.number(),
  userName: z.string().nullable(),
  avatarUrl: z.string().nullable(),
  role: z.any(),
  tier: z.any().nullable(),
  timestamp: z.string(),
  device: z.string(),
});
 
export const dailyUsageSchema = z.object({
  date: z.string(),
  timezone: z.string(),
  kpiTotalToday: z.number(),
  kpiActiveUsers: z.number(),
  kpiNewUsers: z.number(),
  chartData: z.object({
    labels: z.array(z.string()),
    series: z.array(z.number()),
  }),
  roleBreakdown: z.array(
    z.object({ role: z.string(), count: z.number() })
  ),
  topActions: z.array(
    z.object({ action: z.string(), occurrences: z.number() })
  ),
  recentLogins: z.array(recentLoginSchema),
});
 
export type DailyUsageData = z.infer<typeof dailyUsageSchema>;
export type RecentLogin = z.infer<typeof recentLoginSchema>;