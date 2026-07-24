import { z } from "zod";

export const identifierSchema = z.enum([
  'phone',
  'email',
  'employee_code'
]);

export type IdentifierType = z.infer<typeof identifierSchema>;

export const IDENTIFIER_LABELS: Record<IdentifierType, string> = {
  'phone': 'Teléfono',
  'email': 'Correo electrónico',
  'employee_code': 'Código de empleado',
};

export const credentialSchema = z.enum([
  'phone',
  'email',
  'birthdate',
  'employee_code'
]);

export type CredentialType = z.infer<typeof credentialSchema>;

export const CREDENTIAL_LABELS: Record<CredentialType, string> = {
  'phone': 'Teléfono',
  'email': 'Correo electrónico',
  'birthdate': 'Fecha de nacimiento (DDMMAAAA)',
  'employee_code': 'Código de empleado',
};


export const distributorSchema = z.object({
  id: z.number(),
  username: z.string(),
  email: z.string().email("Correo electrónico inválido").optional().or(z.literal("")),
  phone: z.string().max(20).optional().or(z.literal("")),
  birthdate: z.string().nullable().optional(),
  avatarUrl: z.string().url().nullable().optional(),
  avatarThumbnail: z.string().url().nullable().optional(),
  isActive: z.boolean(),
  lastLoginAt: z.string().nullable().optional(),
  companyName: z.string(),

  pointsCalculationStrategy: z.string().optional().nullable(),
  growthPercentage: z.number().optional().nullable(),
  averageEvaluationScope: z.enum(["cycle", "campaign"]).optional().nullable(),
  sellersCount: z.number().optional(),

  identifierType: identifierSchema,
  credentialType: credentialSchema,

  createdAt: z.string().datetime().optional(),
  updatedAt: z.string().datetime().optional(),
});

export const distributorsArraySchema = z.array(distributorSchema);
export type Distributor = z.infer<typeof distributorSchema>;

export const pointsCalculationStrategies = z.enum(["display", "average"]);

export const distributorFormSchema = z
  .object({
    username: z.string().min(1, "El nombre es requerido").max(255),
    email: z.string().email("Correo electrónico inválido"),
    phone: z.string().min(1, "El teléfono es requerido").max(20),
    birthdate: z.string().optional().or(z.literal("")),
    companyName: z
      .string()
      .min(1, "El nombre de la empresa es requerido")
      .max(255),
    isActive: z.boolean(),

    pointsCalculationStrategy: z.enum(["", "display", "average"]).optional().nullable(),
    averageEvaluationScope: z.enum(["", "cycle", "campaign"]).optional().nullable(),

    growthPercentage: z.union([z.string(), z.number()]).optional().nullable(),

    identifierType: identifierSchema,
    credentialType: credentialSchema,

    password: z.string().optional(),
    passwordConfirmation: z.string().optional(),
  })
  .refine(
    (data) => {
      if (data.password?.trim() && data.password !== data.passwordConfirmation) {
        return false;
      }
      if (data.growthPercentage !== "" && data.growthPercentage != null) {
        const num = Number(data.growthPercentage);
        return !isNaN(num) && num >= 0;
      }
      return true;
    },
  );

export type DistributorFormData = z.infer<typeof distributorFormSchema>;

export type DistributorFilters = {
  search?: string;
  username?: string;
  phone?: string;
  email?: string;
  companyName?: string;
  isActive?: boolean | string;
}