import { cleanObj } from "./cleanObj";

/**
 * Convierte los parámetros base y los filtros del frontend 
 * al formato exacto que espera el backend (ej: minPoints -> points[gte])
 */
export function buildQueryParams(
  baseParams: { page?: number; perPage?: number; search?: string },
  filters?: Record<string, any>,
  filterMap?: Record<string, string>
) {
  const queryParams: Record<string, any> = {
    page: baseParams.page,
    per_page: baseParams.perPage,
    search: baseParams.search,
  };

  if (filters) {
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== "") {
        const targetKey = filterMap?.[key] || key;
        queryParams[targetKey] = value;
      }
    });
  }

  // cleanObj se encarga de quitar undefined y null de queryParams
  return cleanObj(queryParams);
}