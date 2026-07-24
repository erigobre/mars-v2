import { z } from "zod";

export const redemptionWindowSchema = z.object({
  id: z.number(),
  cycleId: z.number(),
  opensAt: z.string().datetime({ message: "Debe ser una fecha y hora válida" }),
  closesAt: z
    .string()
    .datetime({ message: "Debe ser una fecha y hora válida" }),
  isOpen: z.boolean(),
  createdAt: z.string().datetime().optional(),
});

export type RedemptionWindow = z.infer<typeof redemptionWindowSchema>;

export const redemptionCycleSchema = z.object({
  id: z.number(),
  campaignId: z.number(),
  name: z
    .string()
    .min(1, "El nombre es requerido")
    .max(255, "Máximo 255 caracteres"),
  startDate: z.string().datetime({ message: "Debe ser una fecha válida" }),
  endDate: z.string().datetime({ message: "Debe ser una fecha válida" }),
  isActive: z.boolean(),
  hasOpenWindow: z.boolean(),
  windows: z.array(redemptionWindowSchema).optional(),
  createdAt: z.string().datetime().optional(),
  updatedAt: z.string().datetime().optional(),
});

export type RedemptionCycle = z.infer<typeof redemptionCycleSchema>;

export const campaignStatusEnum = z.enum(["RUNNING", "PAUSED", "COMPLETED"]);

export type CampaignStatus = z.infer<typeof campaignStatusEnum>;

export const campaignSchema = z.object({
  id: z.number(),
  name: z
    .string()
    .min(1, "El nombre es requerido")
    .max(255, "Máximo 255 caracteres"),
  startDate: z.string().datetime({ message: "Debe ser una fecha válida" }),
  endDate: z.string().datetime({ message: "Debe ser una fecha válida" }),
  isActive: z.boolean(),
  isRunning: z.boolean(),
  status: campaignStatusEnum,
  cycles: z.array(redemptionCycleSchema).optional(),
  cyclesCount: z.number().optional(),
  createdAt: z.string().datetime().optional(),
  updatedAt: z.string().datetime().optional(),
});

export const campaingsArraySchema = z.array(campaignSchema);

export type Campaign = z.infer<typeof campaignSchema>;

export const campaignFormSchema = campaignSchema
  .pick({
    name: true,
    isActive: true,
  })
  .extend({
    startDate: z.string().date({ message: "Debe ser una fecha válida" }),
    endDate: z.string().date({ message: "Debe ser una fecha válida" }),
    autoGenerate: z.boolean(),
  })
  .refine(
    (data) => {
      const start = new Date(data.startDate);
      const end = new Date(data.endDate);
      return end > start;
    },
    {
      message: "La fecha de fin debe ser posterior a la fecha de inicio",
      path: ["endDate"],
    }
  );

export type CampaignFormData = z.infer<typeof campaignFormSchema>;

export const cycleFormSchema = z
  .object({
    name: z
      .string()
      .min(1, "El nombre es requerido")
      .max(255, "Máximo 255 caracteres"),
    startDate: z.string().min(1, "La fecha de inicio es requerida"),
    endDate: z.string().min(1, "La fecha de fin es requerida"),
    isActive: z.boolean(),
    autoGenerateWindows: z.boolean(),
  })
  .refine((data) => new Date(data.endDate) > new Date(data.startDate), {
    message: "La fecha de fin debe ser posterior a la fecha de inicio",
    path: ["endDate"],
  });

export type CycleFormData = z.infer<typeof cycleFormSchema>;

export const windowFormSchema = z
  .object({
    opensAt: z.string().min(1, "La fecha de apertura es requerida"),
    closesAt: z.string().min(1, "La fecha de cierre es requerida"),
  })
  .refine((data) => new Date(data.closesAt) > new Date(data.opensAt), {
    message: "El cierre debe ser posterior a la apertura",
    path: ["closesAt"],
  });

export type WindowFormData = z.infer<typeof windowFormSchema>;

export const generateWindowsSchema = z.object({
  replace: z.boolean(),
});

export type GenerateWindowsData = z.infer<typeof generateWindowsSchema>;
