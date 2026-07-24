import api from "@/core/api/axios";
import type { ApiResponse, PaginatedData } from "@/core/types";
import {
  type GoalFormData,
  type GoalFilters,
  type AdminGoal,
  adminGoalSchema,
  type AdminGoalProgress,
  adminGoalProgressesArraySchema,
} from "../schemas/goal";
import { safeValidate } from "@/core/utils/zodHelper";
import { cleanObj } from "@/core/utils/cleanObj";

// GET /api/v1/admin/goals
export async function getGoals(
  page: number,
  perPage: number,
  filters?: GoalFilters
) {
  const params = cleanObj({
    page,
    per_page: perPage,
    cycle_id: filters?.cycleId,
    is_active: filters?.isActive,
    type: filters?.type,
  });

  const { data } = await api.get<ApiResponse<PaginatedData<AdminGoal[]>>>(
    "/admin/goals",
    { params }
  );

  safeValidate(adminGoalSchema, data.data.items);
  return data.data;
}

// GET /api/v1/admin/goals/{id}
export async function getGoalById(id: number) {
  const { data } = await api.get<ApiResponse<AdminGoal>>(`/admin/goals/${id}`);
  return safeValidate(adminGoalSchema, data.data);
}

// POST /api/v1/admin/goals
export async function createGoal(formData: GoalFormData) {
  const payload = {
    cycle_id: formData.cycleId,
    name: formData.name,
    description: formData.description || null,
    type: formData.type,
    target_value: formData.targetValue,
    reward_points: formData.rewardPoints,
    is_active: formData.isActive,
    product_id: formData.productId || null,
    display_id: formData.displayId || null,
  };

  const { data } = await api.post<ApiResponse<AdminGoal>>("/admin/goals", payload);
  return data;
}

// PUT /api/v1/admin/goals/{id}
export async function updateGoal(id: number, formData: GoalFormData) {
  const payload = {
    cycle_id: formData.cycleId,
    name: formData.name,
    description: formData.description || null,
    type: formData.type,
    target_value: formData.targetValue,
    reward_points: formData.rewardPoints,
    is_active: formData.isActive,
    product_id: formData.productId || null,
    display_id: formData.displayId || null,
  };

  const { data } = await api.put<ApiResponse<AdminGoal>>(
    `/admin/goals/${id}`,
    payload
  );
  return data;
}

// DELETE /api/v1/admin/goals/{id}
export async function deleteGoal(id: number) {
  const { data } = await api.delete<ApiResponse<null>>(`/admin/goals/${id}`);
  return data;
}

// GET /api/v1/admin/goals/{id}/progresses
export async function getGoalProgresses(goalId: number, page: number = 1) {
  const { data } = await api.get<ApiResponse<PaginatedData<AdminGoalProgress[]>>>(
    `/admin/goals/${goalId}/progresses`,
    { params: { page, per_page: 50 } }
  );

  safeValidate(adminGoalProgressesArraySchema, data.data.items);
  return data.data;
}
