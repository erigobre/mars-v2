import api from "@/core/api/axios";
import type { ActivityLog } from "../schemas/activityLog";
import type { ApiResponse, PaginatedData } from "@/core/types";
import type { ActivityLogFilters } from "../types/activityLogFilters";

const formatBracketParams = (filters: ActivityLogFilters): URLSearchParams => {
  const params = new URLSearchParams();

  // Paginación directa
  if (filters.page) params.append("page", String(filters.page));
  if (filters.per_page) params.append("per_page", String(filters.per_page));

  // Mapeo manual de propiedades simples a sus operadores específicos
  if (filters.userId) params.append("userId[eq]", String(filters.userId));
  if (filters.actionType)
    params.append("actionType[like]", `%${String(filters.actionType)}%`);
  if (filters.modelType)
    params.append("modelType[like]", String(filters.modelType));
  if (filters.modelId) params.append("modelId[eq]", String(filters.modelId));

  // Para la IP suele ser más útil un 'like'
  if (filters.ipAddress)
    params.append("ipAddress[like]", String(filters.ipAddress));

  // Para la fecha, puedes mapearlo al operador que mejor te convenga (ej. gte = mayor o igual)
  if (filters.createdAt)
    params.append("createdAt[gte]", String(filters.createdAt));

  return params;
};

export const getActivityLogs = async (filters: ActivityLogFilters) => {
  const params = formatBracketParams(filters);
  const { data } = await api.get<ApiResponse<PaginatedData<ActivityLog[]>>>(
    "/admin/activity-logs",
    { params }
  );
  return data.data;
};
