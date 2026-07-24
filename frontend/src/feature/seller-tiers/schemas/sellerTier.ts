import { z } from "zod";

export const sellerTierDistributorSchema = z.object({
  id: z.number(),
  username: z.string(),
  email: z.string().email(),
  phone: z.string(),
  avatarUrl: z.string().url().nullable().optional(),
  avatarThumbnail: z.string().url().nullable().optional(),
  isActive: z.boolean(),
  companyName: z.string(),
});

export const sellerTierSchema = z.object({
  id: z.number(),
  distributorId: z.number().nullable().optional(),
  distributor: sellerTierDistributorSchema.nullable().optional(),
  name: z.string(),
  slug: z.string(),
  minAverageSales: z.number(),
  maxAverageSales: z.number().nullable(),
  order: z.number().nullable(),
  color: z.string().nullable(),
  icon: z.string().nullable(),
  isActive: z.boolean(),
  createdAt: z.string().datetime().optional(),
  updatedAt: z.string().datetime().optional(),
  sellersCount: z.number().optional(),
});

export const sellerTiersArraySchema = z.array(sellerTierSchema);
export type SellerTier = z.infer<typeof sellerTierSchema>;

export const sellerTierFormSchema = z
  .object({
    distributorId: z.union([z.string(), z.number()]).optional().nullable(),
    name: z.string().min(1, "El nombre es requerido").max(100),
    slug: z.string().min(1, "El slug es requerido").max(50),
    minAverageSales: z.union([z.string(), z.number()]),
    maxAverageSales: z.union([z.string(), z.number()]).optional().nullable(),
    order: z.union([z.string(), z.number()]).optional().nullable(),
    color: z
      .string()
      .regex(/^#[0-9A-Fa-f]{6}$/, "Debe ser un hex válido (ej. #FF0000)")
      .optional()
      .nullable()
      .or(z.literal("")),
    icon: z.string().max(50).optional().nullable(),
    isActive: z.boolean(),
  })
  .refine(
    (data) => {
      if (data.minAverageSales !== "" && data.minAverageSales != null) {
        const num = Number(data.minAverageSales);
        return !isNaN(num) && num >= 0;
      }
      return false;
    },
    {
      message: "Debe ser un número válido mayor o igual a 0",
      path: ["minAverageSales"],
    },
  )
  .refine(
    (data) => {
      if (!data.maxAverageSales || data.maxAverageSales === "") return true;
      const min = Number(data.minAverageSales);
      const max = Number(data.maxAverageSales);
      return !isNaN(max) && max > min;
    },
    {
      message: "Debe ser mayor que el promedio mínimo",
      path: ["maxAverageSales"],
    },
  );

export type SellerTierFormData = z.infer<typeof sellerTierFormSchema>;

export type SellerTierFilters = {
  search?: string;
  isActive?: boolean | string;
  distributor_id?: number | string;
};
