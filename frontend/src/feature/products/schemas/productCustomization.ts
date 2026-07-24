import { z } from "zod";

export const productCustomizationSchema = z.object({
  productId: z.number().int().positive("ID de producto inválido"),
  customSku: z.string().max(100).optional().nullable(),
  customPrice: z
    .number({ message: "Ingresa un precio válido" })
    .min(0, "El precio no puede ser negativo")
    .optional()
    .nullable(),
  notes: z.string().max(1000).optional().nullable(),
});

export type ProductCustomizationFormData = z.infer<typeof productCustomizationSchema>;

// Esquema para actualización (id de personalización ya existe)
export const updateCustomizationSchema = productCustomizationSchema.omit({ productId: true });
export type UpdateCustomizationFormData = z.infer<typeof updateCustomizationSchema>;
