export interface ActivityLogFilters {
  page?: number;
  per_page?: number;
  userId?: string | number;
  actionType?: string;
  modelType?: string;
  modelId?: string | number;
  ipAddress?: string;
  createdAt?: string;
}
