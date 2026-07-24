import { z } from "zod";

export const requestAccessSchema = z.object({
  username: z
    .string()
    .min(1, "El nombre completo es requerido")
    .max(255, "Máximo 255 caracteres"),
  email: z
    .string()
    .min(1, "El correo electrónico es requerido")
    .email("Correo electrónico inválido"),
  phone: z
    .string()
    .min(1, "El teléfono es requerido")
    .max(20, "Máximo 20 caracteres"),
  birthdate: z
    .string()
    .min(1, "La fecha de nacimiento es requerida"),
  distributor_id: z
    .string()
    .min(1, "Debes seleccionar un distribuidor"),
  employee_code: z
    .string()
    .min(1, "El código de empleado es requerido")
    .max(50, "Máximo 50 caracteres"),
});

export type RequestAccessForm = z.infer<typeof requestAccessSchema>;

export const publicDistributorSchema = z.object({
  id: z.number(),
  companyName: z.string(),
});

export const publicDistributorArraySchema = z.array(publicDistributorSchema);

export type PublicDistributor = z.infer<typeof publicDistributorSchema>;