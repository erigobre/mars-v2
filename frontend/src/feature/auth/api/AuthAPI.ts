import api from "@/core/api/axios";
import { loginResponseSchema, type LoginForm, type LoginResponse } from "@/feature/auth/schemas/loginSchema";
import type { ApiResponse } from "@/core/types";
import { publicDistributorArraySchema, type PublicDistributor, type RequestAccessForm } from "../schemas/requestAccessSchema";

export async function loginUser(formData: LoginForm) {
  const { data } = await api.post<ApiResponse<LoginResponse>>("/auth/login", formData);
  const result = loginResponseSchema.parse(data.data);
  if (!result.accessToken) {
    throw new Error("Token de acceso no proporcionado");
  }
  return result;
}

export async function logoutUser() {
  const { data } = await api.post<ApiResponse<any>>('/auth/logout'); 
  return data;
}

export async function registerUser(formData: RequestAccessForm) {
  const { data } = await api.post<ApiResponse<any>>("/auth/register", formData);
  return data;
}

export async function getPublicDistributors() {
  const { data } = await api.get<ApiResponse<PublicDistributor[]>>("/public/distributors");
  
  return publicDistributorArraySchema.parse(data.data);
}