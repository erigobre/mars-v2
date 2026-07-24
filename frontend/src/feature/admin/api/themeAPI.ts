import api from "@/core/api/axios";
import type { ApiResponse } from "@/core/types";

export type ThemeMap = Record<string, string>;

export async function getTheme(): Promise<ThemeMap> {
  const { data } = await api.get<ApiResponse<ThemeMap>>("/admin/theme");
  return data.data;
}

export async function updateTheme(settings: ThemeMap): Promise<ThemeMap> {
  const payload = Object.entries(settings).map(([key, value]) => ({ key, value }));
  const { data } = await api.put<ApiResponse<ThemeMap>>("/admin/theme", { settings: payload });
  return data.data;
}
