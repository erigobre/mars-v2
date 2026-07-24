import { z } from "zod";

export const adoptionRatesSchema = z.object({
  loginRate: z.number(),
  termsAcceptanceRate: z.number(),
  platformUsageRate: z.number(),
});

export const adoptionFunnelSchema = z.object({
  totalRegistered: z.number(),
  neverLoggedIn: z.number(),
  loggedInEver: z.number(),
  acceptedTerms: z.number(),
  loggedNoTerms: z.number(),
  registeredInPeriod: z.number(),
  activeInPeriod: z.number(),
  rates: adoptionRatesSchema,
});

export type AdoptionFunnel = z.infer<typeof adoptionFunnelSchema>;

export const byCompanyItemSchema = z.object({
  distributorId: z.number(),
  distributorName: z.string(),
  totalSellers: z.number(),
  loggedInEver: z.number(),
  neverLoggedIn: z.number(),
  acceptedTerms: z.number(),
  loggedNoTerms: z.number(),
  activeInPeriod: z.number(),
  rates: adoptionRatesSchema,
});

export type ByCompanyItem = z.infer<typeof byCompanyItemSchema>;

export const sellerDetailSchema = z.object({
  sellerId: z.number(),
  name: z.string(),
  email: z.string().nullable(),
  phone: z.string().nullable(),
  employeeCode: z.string().nullable(),
  distributorName: z.string().nullable(),
  termsAccepted: z.boolean(),
  lastLoginAt: z.string().nullable(),
  registeredAt: z.string().nullable(),
  isActive: z.boolean(),
});

export type SellerDetail = z.infer<typeof sellerDetailSchema>;

export const adoptionReportSchema = z.object({
  filters: z.object({
    distributorId: z.number().nullable(),
    distributorName: z.string().nullable(),
    campaignId: z.number().nullable(),
    campaignName: z.string().nullable(),
    dateFrom: z.string().nullable(),
    dateTo: z.string().nullable(),
  }),
  funnel: adoptionFunnelSchema,
  byCompany: z.array(byCompanyItemSchema),
  detail: z.object({
    neverLoggedIn: z.array(sellerDetailSchema),
    loggedNoTerms: z.array(sellerDetailSchema),
    acceptedTerms: z.array(sellerDetailSchema),
    activeInPeriod: z.array(sellerDetailSchema),
    registeredInPeriod: z.array(sellerDetailSchema),
  }),
});

export type AdoptionReport = z.infer<typeof adoptionReportSchema>;
