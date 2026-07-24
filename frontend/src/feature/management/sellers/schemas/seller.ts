import { campaignSchema, redemptionCycleSchema } from "@/feature/admin/schemas/campaign";
import { z } from "zod";

const sellerAddressSchema = z.object({
  street: z.string().nullable(),
  colonia: z.string().nullable(),
  city: z.string().nullable(),
  state: z.string().nullable(),
  zip: z.string().nullable(),
});

const sellerDistributorRefSchema = z.object({
  id: z.number(),
  companyName: z.string(),
  username: z.string().optional(),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  isActive: z.boolean(),
});

export const sellerTierSchema = z.object({
  id: z.number(),
  name: z.string(),
  slug: z.string(),
  minAverageSales: z.number().or(z.string()).nullable(),
  maxAverageSales: z.number().or(z.string()).nullable(),
  order: z.number(),
  color: z.string().nullable(),
  icon: z.string().nullable(),
  isActive: z.boolean(),
  createdAt: z.string().nullable().optional(),
  updatedAt: z.string().nullable().optional(),
  sellersCount: z.number().optional(),
});

export const goalProgressSchema = z.object({
  id: z.number(),
  goal: z.any().optional(), 
  currentValue: z.number(),
  targetValue: z.number(),
  percentage: z.number(),
  reached: z.boolean(),
  bonusAwarded: z.boolean(),
  reachedAt: z.string().nullable().optional(),
  updatedAt: z.string().nullable().optional(),
});

export const sellerSalesSnapshotSchema = z.object({
  id: z.number(),
  sellerId: z.number(),
  campaignId: z.number(),
  campaign: campaignSchema.optional().nullable(),
  redemptionCycle: redemptionCycleSchema.optional().nullable(),
  redemptionCycleId: z.number().nullable(),
  totalUnitsSold: z.number(),
  targetAverage: z.number(),
  createdAt: z.string().nullable().optional(),
  updatedAt: z.string().nullable().optional(),
});

export const sellerStatisticsSchema = z.object({
  totalSalesCount: z.number(),
  totalSalesAmount: z.number().optional(),
});

export const sellerSchema = z.object({
  id: z.number(),
  username: z.string(),
  email: z.string().email().nullable(),
  phone: z.string().nullable(),
  avatarUrl: z.string().url().nullable().optional(),
  avatarThumbnail: z.string().url().nullable().optional(),
  isActive: z.boolean(),
  lastLoginAt: z.string().nullable().optional(),
  employeeCode: z.string().nullable(),
  currentPoints: z.number(),
  distributor: sellerDistributorRefSchema.nullable().optional(),
  address: sellerAddressSchema,
  shippingNotes: z.string().nullable().optional(),
  averageMonthlySales: z.number().nullable().optional(),
  createdAt: z.string().datetime().optional(),
  updatedAt: z.string().datetime().optional(),

  tier: sellerTierSchema.nullable().optional(),
  goalProgresses: z.array(goalProgressSchema).optional(),
  salesSnapshots: z.array(sellerSalesSnapshotSchema).optional().nullable(),
  statistics: sellerStatisticsSchema.optional(),
});

export const sellersArraySchema = z.array(sellerSchema);
export type Seller = z.infer<typeof sellerSchema>;

export const sellerFormSchema = z
  .object({
    username: z.string().min(1, "El nombre es requerido").max(255),
    email: z.string().email("Correo electrónico inválido").optional().nullable().or(z.literal("")),
    phone: z.string().min(1, "El teléfono es requerido").max(20).optional().nullable().or(z.literal("")),
    birthdate: z.string().optional().or(z.literal("")),
    distributorId: z
      .number()
      .int()
      .positive("Selecciona un distribuidor")
      .optional(),
    employeeCode: z
      .string()
      .min(1, "El código de empleado es requerido")
      .max(50).optional().nullable().or(z.literal("")),
    isActive: z.boolean(),
    password: z.string().optional(),
    passwordConfirmation: z.string().optional(),
    addressStreet: z.string().max(255).nullable().optional(),
    addressColonia: z.string().max(255).nullable().optional(),
    addressCity: z.string().max(100).nullable().optional(),
    addressState: z.string().max(100).nullable().optional(),
    addressZip: z.string().max(10).nullable().optional(),
    shippingNotes: z.string().max(1000).nullable().optional(),
    averageMonthlySales: z.number().min(0),
    sellerTierId: z.union([z.string(), z.number()]).optional().nullable(),
  })
  .refine(
    (data) =>
      !data.password?.trim() || data.password === data.passwordConfirmation,
    { message: "Las contraseñas no coinciden", path: ["passwordConfirmation"] }
  );

export type SellerFormData = z.infer<typeof sellerFormSchema>;

export type SellerFilters = {
  search?: string;
  username?: string;
  email?: string;
  phone?: string;
  employeeCode?: string;
  isActive?: boolean | string;
  distributorId?: number; // Filtro adicional usado en SellerAPI
}