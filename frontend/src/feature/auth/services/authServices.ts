import { useMutation, useQuery } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { useAuthStore } from "@/core/stores/authStore";
import { getPublicDistributors, loginUser, registerUser } from "@/feature/auth/api/AuthAPI";
import type { LoginForm } from "@/feature/auth/schemas/loginSchema";
import type { UseFormSetError } from "react-hook-form";
import { handleApiError } from "@/core/utils/handleErrors";
import type { RequestAccessForm } from "../schemas/requestAccessSchema";


export function useLoginMutation(setError: UseFormSetError<LoginForm>) {
  const setToken = useAuthStore((s) => s.setToken);
  const setUser = useAuthStore((state) => state.setUser);

  return useMutation({
    mutationFn: loginUser,

    onSuccess: (data) => {
      setToken(data.accessToken);
      setUser(data.user)
      toast.success('Sesión iniciada correctamente');
    },

    onError: (error) => {
      handleApiError(error, setError, "Teléfono o contraseña incorrectos")
    },
  });
}

export function usePublicDistributorsQuery() {
  return useQuery({
    queryKey: ["public-distributors"],
    queryFn: getPublicDistributors,
    staleTime: 1000 * 60 * 60, // 1 hora (los distribuidores no suelen cambiar frecuentemente)
  });
}

export function useRegisterMutation(setError: UseFormSetError<RequestAccessForm>) {
  return useMutation({
    mutationFn: registerUser,
    onSuccess: (data) => {
      toast.success(data.message || 'Solicitud enviada correctamente. Espera a que tu distribuidor la valide.');
    },

    onError: (error) => {
      handleApiError(error, setError, "Error al enviar la solicitud de acceso");
    },
  });
}