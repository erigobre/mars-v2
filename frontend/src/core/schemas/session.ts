import { z } from "zod";
import { roleSlugSchema } from "./role";

export const sessionUserSchema = z.object({
  id: z.number(),
  username: z.string(),
  email: z.string().email().nullable(),
  avatarUrl: z.string().url().nullable(),
  avatarThumbnail: z.string().url().nullable(),
  role: roleSlugSchema,

  // Solo presente si role === 'seller'
  termsAccepted: z.boolean().optional(),
  currentPoints: z.number().optional(),

  // Solo presente si role === 'distributor'
  companyName: z.string().optional(),
});

export type SessionUser = z.infer<typeof sessionUserSchema>;
