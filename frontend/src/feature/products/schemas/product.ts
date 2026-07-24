import { z } from "zod";

export const unitTypeSchema = z.enum(["PIECE", "PACKAGE", "BOX", "KG", "SPECIFY"])

export const UNIT_TYPE_OPTIONS = [
  { value: "PIECE", label: "Pieza" },
  { value: "PACKAGE", label: "Paquete" },
  { value: "BOX", label: "Caja" },
  { value: "KG", label: "Kilogramo" },
  { value: "SPECIFY", label: "Otro (especificar)" },
] as const;

export const productDisplaySchema = z.object({
  id: z.number().nullable().optional(),
  name: z.string().nullable().optional(),
  slug: z.string().nullable().optional(),
  valuePoints: z.number().nullable().optional(),
  isActive: z.boolean().optional().nullable()
});

export const productCustomizationSchema = z.object({
  id: z.number(),
  distributorId: z.number(),
  customSku: z.string(),
  customPrice: z.number().nullable().optional(),
  maxSaleQuantity: z.number().nullable().optional(),
  notes: z.string().nullable().optional(),
  createdAt: z.string().nullable().optional(),
  updatedAt: z.string().nullable().optional(),
})

export type ProductDisplay = z.infer<typeof productDisplaySchema>;

export const productSchema = z.object({
  id: z.number(),
  sku: z.string(),
  upc: z.string().nullable().optional(),
  name: z.string(),
  description: z.string().nullable().optional(),
  image: z.string().url().nullable().optional(),
  imageThumb: z.string().url().nullable().optional(),
  unitType: unitTypeSchema,
  customUnitType: z.string().nullable().optional(),
  category: z.string().nullable().optional(),
  isActive: z.boolean(),
  // UnifiedProductResource uses `price`, ProductResource uses `defaultPrice`
  price: z.number().nullable().optional(),
  defaultPrice: z.number().nullable().optional(),
  display: productDisplaySchema.nullable().optional(),
  // Distributor-specific fields (from UnifiedProductResource)
  distributorProductId: z.number().nullable().optional(),
  basePrice: z.number().nullable().optional(),
  isCustomized: z.boolean().nullable().optional(),
  customization: productCustomizationSchema.optional().nullable(),
  createdAt: z.string().nullable().optional(),
  updatedAt: z.string().nullable().optional(),
});

export const productsArraySchema = z.array(productSchema);
export type Product = z.infer<typeof productSchema>;

// Simple display option for the select in the form
export const displayOptionSchema = z.object({
  id: z.number(),
  name: z.string(),
  valuePoints: z.number().optional(),
});
export type DisplayOption = z.infer<typeof displayOptionSchema>;

export const productFormSchema = z
  .object({
    displayId: z
      .number({ message: "Selecciona un display" })
      .int()
      .positive("Selecciona un display válido"),
    sku: z.string().min(1, "El SKU es requerido").max(100),
    upc: z.string().max(100).optional().or(z.literal("")),
    name: z.string().min(1, "El nombre es requerido").max(255),
    description: z.string().optional(),
    defaultPrice: z
      .number({ message: "Ingresa un precio válido" })
      .min(0, "El precio no puede ser negativo"),
    unitType: unitTypeSchema,
    customUnitType: z.string().max(100).optional(),
    category: z.string().max(100).optional(),
    isActive: z.boolean(),
  })
  .refine(
    (data) =>
      data.unitType !== "SPECIFY" ||
      (data.customUnitType && data.customUnitType.trim().length > 0),
    {
      message: "Especifica el tipo de unidad personalizado",
      path: ["customUnitType"],
    }
  );

export type ProductFormData = z.infer<typeof productFormSchema>;


export type ProductFilters = {
  search?: string;
  category?: string;
  displayId?: number;
  isActive?: boolean | string;
  active_only?: boolean;
}