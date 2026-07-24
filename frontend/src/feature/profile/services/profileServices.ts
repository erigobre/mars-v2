import { useAuthStore } from "@/core/stores/authStore";
import { handleApiError } from "@/core/utils/handleErrors";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import type { UseFormSetError } from "react-hook-form";
import { toast } from "react-toastify";
import { getProfile, updateProfile } from "../api/profileAPI";
import type {
  SellerProfileForm,
  DistributorProfileForm,
  AdminProfileForm,
} from "../schemas/profileSchema";

export function useProfileQuery() {
  return useQuery({
    queryKey: ["profile"],
    queryFn: getProfile,
    refetchOnReconnect: false,
    refetchOnWindowFocus: false,
    retry: false,
    staleTime: 1000 * 60 * 5,
  });
}

export function useUpdateProfileMutation<
  T extends SellerProfileForm | DistributorProfileForm | AdminProfileForm
>({
  setError,
  onSuccess,
}: {
  setError: UseFormSetError<T>;
  onSuccess?: () => void;
}) {
  const queryClient = useQueryClient();
  const user = useAuthStore((s) => s.user);
  const setUser = useAuthStore((s) => s.setUser);

  return useMutation({
    mutationFn: ({
      formData,
      avatarFile,
    }: {
      formData: T;
      avatarFile?: File | null;
    }) => updateProfile(formData, avatarFile, user?.role),

    onSuccess: async (data) => {
      toast.success(data.message || "Perfil actualizado correctamente");
      // Invalida ambos queries para que refresquen el store y la página de perfil
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["profile"] }),
        queryClient.invalidateQueries({ queryKey: ["fullProfile"] })
      ]);
      if (user) {
        setUser({
          ...user,
          username: data.data.username,
          email: data.data.email,
          avatarUrl: data.data.avatarUrl ?? null,
          avatarThumbnail: data.data.avatarThumbnail ?? null
        });
      }
      onSuccess?.();
    },

    onError: (error) => {
      handleApiError(error, setError as any, "Error al actualizar el perfil");
    },
  });
}
