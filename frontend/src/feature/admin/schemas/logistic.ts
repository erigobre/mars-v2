import { z } from "zod";

export const logisticSchema = z.object({
  id: z.number(),
  username: z
    .string()
    .min(1, "El nombre de usuario es requerido")
    .max(255, "Máximo 255 caracteres"),
  email: z.string().email("Debe ser un correo electrónico válido"),
  phone: z
    .string()
    .min(1, "El teléfono es requerido")
    .max(20, "Máximo 20 caracteres"),
  birthdate: z.string().min(1, "La fecha de nacimiento es requerida").nullable().optional(),
  isActive: z.boolean(),
  avatar: z.any().optional(),
  lastLoginAt: z.string().optional().nullable(),
  avatarUrl: z.string().optional().nullable(),
  avatarThumbnail: z.string().optional().nullable(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
});

export const logisticsArraySchema = z.array(logisticSchema);

export const logisticFormSchema = logisticSchema.omit({
  id: true,
  lastLoginAt: true,
  avatarUrl: true,
  avatarThumbnail: true,
  createdAt: true,
  updatedAt: true,
});

export type Logistic = z.infer<typeof logisticSchema>;
export type LogisticFormData = Omit<Logistic, "id">;

export interface LogisticFilters {
    search?: string;
    isActive?: boolean | 1 | 0 | string;
}