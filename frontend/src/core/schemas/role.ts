import z from "zod"

export const roleSlugSchema = z.enum(["admin", "seller", "distributor", "logistics"]);
export type RoleSlug = z.infer<typeof roleSlugSchema>;

export const roleSchema = z.object({
    name: z.string(),
    slug: roleSlugSchema,
    description: z.string(),
})