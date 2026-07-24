import { baseGoalProgressSchema, baseGoalSchema, goalTypeSchema } from "@/core/schemas/goal";
import { z } from "zod";

export const adminGoalSchema = baseGoalSchema.extend({
  cycle: z.object({
    id: z.number(),
    name: z.string(),
    startDate: z.string().datetime().optional(),
    endDate: z.string().datetime().optional(),
  }),
  display: z
    .object({
      id: z.number(),
      name: z.string(),
    })
    .optional()
    .nullable(),
  progressesCount: z.number().optional(),
  reachedCount: z.number().optional(),

  createdAt: z.string().datetime().optional(),
  updatedAt: z.string().datetime().optional(),
});

export type AdminGoal = z.infer<typeof adminGoalSchema>; 

export const adminGoalProgressSchema = baseGoalProgressSchema.extend({
  goal: adminGoalSchema.optional(),
  seller: z.object({
    id: z.number(),
    name: z.string(),
    employeeCode: z.string(),
  }).optional().nullable(),
});

export const adminGoalProgressesArraySchema = z.array(adminGoalProgressSchema);
export type AdminGoalProgress = z.infer<typeof adminGoalProgressSchema>;

export const goalFormSchema = z
  .object({
    cycleId: z.number({ message: "El ciclo es requerido" }),
    name: z
      .string()
      .min(1, "El nombre es requerido")
      .max(255, "Máximo 255 caracteres"),
    description: z.string().max(1000, "Máximo 1000 caracteres").optional(),
    type: goalTypeSchema,
    targetValue: z
      .number({ message: "El valor objetivo es requerido" })
      .min(0.01, "Debe ser mayor a 0"),
    rewardPoints: z
      .number({ message: "Los puntos son requeridos" })
      .int("Debe ser un número entero")
      .min(0, "No puede ser negativo"),
    isActive: z.boolean(),
    productId: z.number().optional().nullable(),
    displayId: z.number().optional().nullable(),
  })
  .refine(
    (data) => {
      if (data.type === "SPECIFIC_PRODUCT_QTY") {
        return data.productId != null && data.productId > 0;
      }
      return true;
    },
    {
      message: "Debes seleccionar un producto para este tipo de meta",
      path: ["productId"],
    }
  )
  .refine(
    (data) => {
      if (data.type === "TOTAL_DISPLAY_QTY") {
        return data.displayId != null && data.displayId > 0;
      }
      return true;
    },
    {
      message: "Debes seleccionar un display para este tipo de meta",
      path: ["displayId"],
    }
  );

export type GoalFormData = z.infer<typeof goalFormSchema>;

export const goalFiltersSchema = z.object({
  cycleId: z.number().optional(),
  isActive: z.boolean().optional(),
  type: goalTypeSchema.optional(),
});

export type GoalFilters = z.infer<typeof goalFiltersSchema>;
