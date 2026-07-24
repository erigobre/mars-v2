import axios, { isAxiosError } from "axios";
import { useAuthStore } from "../stores/authStore";
import { ApiValidationError } from "../errors/ApiValidationError";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  withCredentials: true,
  headers: {
    Accept: "application/json",
    "X-Requested-With": "XMLHttpRequest",
  },
});

api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

  if (token) config.headers.Authorization = `Bearer ${token}`;

  config.headers["X-Timezone"] = timezone;
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    console.log(error);

    if (isAxiosError(error) && error.response) {
      const { status, data } = error.response;
      const { clearSession, token } = useAuthStore.getState();

      if (data?.errors && typeof data.errors === "object") {
        return Promise.reject(
          new ApiValidationError(
            data.errors as Record<string, string[]>,
            data.message ?? "Errores de validación",
          ),
        );
      }

      if (status === 401) {
        if (token) {
          clearSession();
        }
      }

      const authError = new Error(data?.message ?? "Sesión expirada");
      authError.name = "AuthError";
      return Promise.reject(authError);
    }
    return Promise.reject(
      new Error("Ha ocurrido un error inesperado de conexión"),
    );
  },
);

export default api;
