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

export const companyBreakdownSchema = z.object({
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

export const adoptionDetailSellerSchema = z.object({
  id: z.number(),
  name: z.string(),
  email: z.string().nullable(),
  distributorName: z.string(),
  lastLoginAt: z.string().nullable(),
  termsAcceptedAt: z.string().nullable(),
  createdAt: z.string(),
});

export type AdoptionFunnel = z.infer<typeof adoptionFunnelSchema>;
export type CompanyBreakdown = z.infer<typeof companyBreakdownSchema>;
export type AdoptionDetailSeller = z.infer<typeof adoptionDetailSellerSchema>;

export interface FullAdoptionReport {
  filters: {
    distributorId: number | null;
    campaignId: number | null;
    dateFrom: string | null;
    dateTo: string | null;
    rangeName: string | null;
  };
  funnel: AdoptionFunnel;
  byCompany: CompanyBreakdown[];
}
