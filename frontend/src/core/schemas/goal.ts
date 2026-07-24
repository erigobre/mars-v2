import { z } from "zod";

// Enum de tipos de meta
export const goalTypeSchema = z.enum([
  "TOTAL_SALES_AMOUNT",
  "SPECIFIC_PRODUCT_QTY",
  "TOTAL_DISPLAY_QTY",
]);

export type GoalType = z.infer<typeof goalTypeSchema>;

export const goalTypeLabels: Record<GoalType, string> = {
  TOTAL_SALES_AMOUNT: "Monto Total de Ventas",
  SPECIFIC_PRODUCT_QTY: "Cantidad de Producto Específico",
  TOTAL_DISPLAY_QTY: "Cantidad Total de Display",
};

export const baseGoalSchema = z.object({
  id: z.number(),
  cycleId: z.number(),

  name: z.string(),
  description: z.string().nullable().optional(),
  type: goalTypeSchema,
  typeLabel: z.string(),
  targetValue: z.number(),
  rewardPoints: z.number(),
  isActive: z.boolean(),
  representationImage: z.string(),

  product: z
    .object({
      id: z.number(),
      name: z.string(),
      sku: z.string(),
    })
    .optional()
    .nullable()
});

export const goalsArraySchema = z.array(baseGoalSchema);
export type Goal = z.infer<typeof baseGoalSchema>;

export const baseGoalProgressSchema = z.object({
  id: z.number(),
  currentValue: z.number().optional().nullable(),
  targetValue: z.number().optional().nullable(),
  percentage: z.number(),
  reached: z.boolean(),
  bonusAwarded: z.boolean().nullable(),
  reachedAt: z.string().datetime().nullable(),
  updatedAt: z.string().datetime().nullable(),
});

export type GoalProgress = z.infer<typeof baseGoalProgressSchema>;