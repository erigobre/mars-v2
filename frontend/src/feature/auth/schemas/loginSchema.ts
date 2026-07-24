import { sessionUserSchema } from "@/core/schemas/session";
import { z } from "zod";

export const loginSchema = z.object({
  distributorId: z.string().optional(),
  // phone: z
  //   .string()
  //   .min(1, "El teléfono es requerido")
  //   .regex(/^\d{10}$/, "Ingresa un número de 10 dígitos"),
  identifier: z
    .string()
    .min(1, "El identificador es requerido"),
  password: z.string().min(1, "La contraseña es requerida"),
});

export const loginResponseSchema = z.object({
  accessToken: z.string(),
  tokenType: z.string(),
  user: sessionUserSchema
})

export type LoginResponse = z.infer<typeof loginResponseSchema>;

export type LoginForm = z.infer<typeof loginSchema>;
