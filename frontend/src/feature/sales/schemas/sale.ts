import { z } from "zod";

export const saleItemSchema = z.object({
  id: z.number(),
  productId: z.number().nullable().optional(),
  productName: z.string().nullable().optional(),
  productSku: z.string().nullable().optional(),
  quantity: z.number(),
  reportedAmount: z.number(),
  unitPriceRef: z.number(),
  expectedAmountRef: z.number(),
  pointsPerUnit: z.number(),
  potentialPoints: z.number(),
  earnedPoints: z.number(),
  appliedRule: z.string().nullable().optional(),
});

export type SaleItem = z.infer<typeof saleItemSchema>;

const sellerSummarySchema = z.object({
  id: z.number(),
  username: z.string(),
  employeeCode: z.string().nullable(),
});

const createdBySchema = z.object({
  id: z.number(),
  username: z.string(),
});

export const saleSchema = z.object({
  id: z.number(),
  folio: z.string(),
  batchUuid: z.string().nullable().optional(),
  uploadMethod: z.enum(["manual", "csv"]).nullable().optional(),
  saleDate: z.string(),
  notes: z.string().nullable().optional(),
  totalAmount: z.number(),
  pointsEarned: z.number(),
  seller: sellerSummarySchema.optional(),
  createdBy: createdBySchema.optional(),
  items: z.array(saleItemSchema).optional(),
  itemsCount: z.number().optional(),
  createdAt: z.string().datetime().optional(),
});

export const salesArraySchema = z.array(saleSchema);
export type Sale = z.infer<typeof saleSchema>;

export const saleFormSchema = z.object({
  distributorId: z.number().optional(),
  sellerId: z.number({ message: "Selecciona un vendedor" }),
  saleDate: z.string().min(1, "La fecha es requerida"),
  notes: z.string().optional(),
  items: z
    .array(
      z.object({
        productId: z.number({ message: "Selecciona un producto" }),
        quantity: z
          .number({ message: "Ingresa la cantidad" })
          .min(0.01, "Debe ser mayor a 0"),
        amount: z
          .number({ message: "Ingresa el monto" })
          .min(0, "No puede ser negativo"),
      })
    )
    .min(1, "Debes agregar al menos un producto"),
});

export type SaleFormData = z.infer<typeof saleFormSchema>;

export const bulkSaleFormSchema = z.object({
  distributorId: z.number().min(1, "El distribuidor es obligatorio"),
  sales: z.array(z.object({
    sellerId: z.number().min(1, "El vendedor es obligatorio"),
    saleDate: z.string().min(1, "La fecha es obligatoria"),
    notes: z.string().optional(),
    items: z.array(z.object({
      productId: z.number().min(1, "Selecciona un producto"),
      quantity: z.number().min(1, "La cantidad debe ser mayor a 0"),
      amount: z.number().min(0.01, "El precio debe ser mayor a 0"),
    })).min(1, "Debes agregar al menos un producto por venta")
  })).min(1, "Debes registrar al menos una venta")
});

export type BulkSaleFormData = z.infer<typeof bulkSaleFormSchema>;

export const uploadStatusSchema = z.object({
  job_id: z.string(),
  status: z.enum(["processing", "completed", "failed", "cancelled"]),
  progress: z.number(),
  sales_created: z.number().optional(),
  batch_uuid: z.string().optional(),
  error: z.union([z.string(), z.array(z.string())]).optional(),
}).transform((data) => ({
  jobId: data.job_id,
  status: data.status,
  progress: data.progress,
  salesCreated: data.sales_created,
  batchUuid: data.batch_uuid,
  error: data.error,
}));

export type UploadStatus = z.infer<typeof uploadStatusSchema>;
