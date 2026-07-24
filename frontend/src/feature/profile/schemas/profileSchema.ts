import { z } from "zod";

export const profileSchema = z.object({
  id: z.number(),
  username: z.string(),
  email: z.string().email().nullable(),
  phone: z.string().nullable(),
  birthdate: z.string().nullable().optional(),
  avatarUrl: z.string().url().nullable().optional(),
  avatarThumbnail: z.string().url().nullable().optional(),
  isActive: z.boolean().optional(),
  role: z.string(),
  currentPoints: z.number().optional(),
  employeeCode: z.string().optional(),
  shippingNotes: z.string().nullable().optional(),
  address: z
    .object({
      street: z.string().nullable().optional(),
      colonia: z.string().nullable().optional(),
      city: z.string().nullable().optional(),
      state: z.string().nullable().optional(),
      zip: z.string().nullable().optional(),
    })
    .nullable()
    .optional(),
  companyName: z.string().nullable().optional(),
});

export type Profile = z.infer<typeof profileSchema>;

export const sellerProfileFormSchema = z
  .object({
    username: z.string().max(255).optional(),
    email: z.string().max(255).optional().nullable(),
    phone: z.string().max(20).optional().nullable(),
    password: z.string().optional(),
    passwordConfirmation: z.string().optional(),
    // Address
    addressStreet: z.string().max(255).nullable().optional(),
    addressColonia: z.string().max(255).nullable().optional(),
    addressCity: z.string().max(100).nullable().optional(),
    addressState: z.string().max(100).nullable().optional(),
    addressZip: z.string().max(10).nullable().optional(),
    shippingNotes: z.string().max(1000).nullable().optional(),
  })
  .refine(
    (data) => {
      if (data.password?.trim() && data.password !== data.passwordConfirmation) {
        return false;
      }
      return true;
    },
    { message: "Las contraseñas no coinciden", path: ["passwordConfirmation"] }
  );

export const distributorProfileFormSchema = z
  .object({
    username: z.string().max(255).optional(),
    email: z.string().max(255).optional(),
    phone: z.string().max(20).optional(),
    password: z.string().optional(),
    passwordConfirmation: z.string().optional(),
    companyName: z.string().max(255).optional(),
  })
  .refine(
    (data) => {
      if (data.password?.trim() && data.password !== data.passwordConfirmation) {
        return false;
      }
      return true;
    },
    { message: "Las contraseñas no coinciden", path: ["passwordConfirmation"] }
  );

export type SellerProfileForm = z.infer<typeof sellerProfileFormSchema>;
export type DistributorProfileForm = z.infer<typeof distributorProfileFormSchema>;

export const adminProfileFormSchema = z
  .object({
    username: z.string().max(255).optional(),
    email: z.string().max(255).optional(),
    phone: z.string().max(20).optional(),
    password: z.string().optional(),
    passwordConfirmation: z.string().optional(),
  })
  .refine(
    (data) => {
      if (data.password?.trim() && data.password !== data.passwordConfirmation) {
        return false;
      }
      return true;
    },
    { message: "Las contraseñas no coinciden", path: ["passwordConfirmation"] }
  );

export type AdminProfileForm = z.infer<typeof adminProfileFormSchema>;