import { z } from "zod";

export const displaySchema = z.object({
    id: z.number(),
    name: z.string().min(1, "El nombre del display es requerido"),
    slug: z.string().min(1, "El slug del display es requerido").max(255, "Máximo 255 caracteres"),
    valuePoints: z.number().min(0, "Los puntos de valor deben ser un número positivo"),
    isActive: z.boolean(),
    productsCount: z.number().optional(),
    createdAt: z.string().optional(),
    updatedAt: z.string().optional(),
});

export const displaysArraySchema = z.array(displaySchema);

export const displayFormSchema = displaySchema.omit({
    id: true,
    productsCount: true,
    createdAt: true,
    updatedAt: true,
});

export type Display = z.infer<typeof displaySchema>;
export type DisplayFormData = Omit<Display, "id">;

export interface DisplayFilters {
    search?: string;
    isActive?: boolean | 1 | 0 | string;
}