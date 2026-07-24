import { z } from "zod";
import { roleSchema } from "./role";

const baseUserSchema = z.object({
  id: z.number(),
  username: z.string(),
  email: z.string().email(),
  phone: z.string(),
  birthdate: z.string().nullable(),
  avatarUrl: z.string().url().nullable(),
  avatarThumbnail: z.string().url().nullable(),
  isActive: z.boolean(),
  lastLoginAt: z.string().nullable(),
});

const addressSchema = z.object({
  street: z.string().nullable(),
  colonia: z.string().nullable(),
  city: z.string().nullable(),
  state: z.string().nullable(),
  zip: z.string().nullable(),
});

type BaseUser = z.infer<typeof baseUserSchema>;
type Address = z.infer<typeof addressSchema>;
type Role<T extends string> = { name: string; slug: T; description: string };

export type Admin = BaseUser & { role: Role<"admin"> };

export type Distributor = BaseUser & {
  role: Role<"distributor">;
  companyName: string;
  sellersCount?: number;
  sellers?: Seller[];
};

export type Seller = BaseUser & {
  role: Role<"seller">;
  employeeCode: string;
  currentPoints: number;
  shippingNotes: string | null;
  address: Address;
  distributor?: Distributor;
};

export const adminSchema: z.ZodType<Admin> = baseUserSchema.extend({
  role: roleSchema.extend({ slug: z.literal("admin") }),
});

export const distributorSchema: z.ZodType<Distributor> = baseUserSchema.extend({
  role: roleSchema.extend({ slug: z.literal("distributor") }),
  companyName: z.string(),
  sellersCount: z.number().optional(),
  sellers: z.array(z.lazy(() => sellerSchema)).optional(),
});

export const sellerSchema: z.ZodType<Seller> = baseUserSchema.extend({
  role: roleSchema.extend({ slug: z.literal("seller") }),
  employeeCode: z.string(),
  currentPoints: z.number().int(),
  shippingNotes: z.string().nullable(),
  address: addressSchema,
  distributor: z.lazy(() => distributorSchema).optional(),
});