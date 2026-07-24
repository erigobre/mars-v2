// Tipamos exactamente lo que acepta tu backend
export interface RewardFilters {
  page?: number;
  per_page?: number;
  name?: string;
  description?: string;
  category?: string;
  points?: number | string;
  status?: "active" | "inactive" | "out_of_stock";
  createdAt?: string;
  onlyAffordable?: string;
  minPoints?: string;
  maxPoints?: string;
}

export interface GetRewardsParams {
  page: number;
  perPage: number;
  search?: string;
  filters?: RewardFilters;
}
