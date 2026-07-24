import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { getTheme, updateTheme, type ThemeMap } from "../api/themeAPI";
import { useThemeStore } from "@/core/stores/themeStore";

export const themeKeys = {
  all: ["theme"] as const,
};

export function useThemeQuery() {
  return useQuery({
    queryKey: themeKeys.all,
    queryFn: getTheme,
    staleTime: 1000 * 60 * 5,
  });
}

export function useUpdateThemeMutation() {
  const queryClient = useQueryClient();
  const updateStore = useThemeStore((s) => s.update);

  return useMutation<ThemeMap, Error, ThemeMap>({
    mutationFn: updateTheme,
    onSuccess: (data) => {
      toast.success("Tema actualizado correctamente");
      queryClient.setQueryData(themeKeys.all, data);
      updateStore(data);
    },
    onError: () => {
      toast.error("Error al actualizar el tema");
    },
  });
}
