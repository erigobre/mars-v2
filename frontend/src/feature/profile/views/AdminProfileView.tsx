import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input, Button } from "@/core/components/ui";
import {
  MdAdminPanelSettings,
  MdLock,
  MdEmail,
  MdPhone,
  MdSave,
} from "react-icons/md";
import ProfileAvatarCard from "../components/ProfileAvatarCard";
import { ImageDropzone } from "@/core/components/ui/ImageDropzone";
import { Skeleton } from "@/core/components/ui/Skeleton/Skeleton";
import {
  useProfileQuery,
  useUpdateProfileMutation,
} from "@/feature/profile/services/profileServices";
import {
  adminProfileFormSchema,
  type AdminProfileForm,
} from "@/feature/profile/schemas/profileSchema";

export default function AdminProfileView() {
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const { data: profile, isLoading } = useProfileQuery();

  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isDirty },
  } = useForm<AdminProfileForm>({
    resolver: zodResolver(adminProfileFormSchema),
    mode: "onChange",
  });

  useEffect(() => {
    if (profile) {
      reset({
        username: profile.username,
        email: profile.email ?? "",
        phone: profile.phone ?? "",
        password: "",
        passwordConfirmation: "",
      });
    }
  }, [profile, reset]);

  const { mutate: updateProfile, isPending } = useUpdateProfileMutation({
    setError,
  });

  const onSubmit = (data: AdminProfileForm) => {
    updateProfile({ formData: data, avatarFile });
  };

  if (isLoading) {
    return (
      <div className="flex flex-col lg:flex-row gap-8 mx-auto mt-4 md:mt-0">
        <div className="lg:w-1/3">
          <Skeleton className="h-80 rounded-2xl" />
        </div>
        <div className="lg:w-2/3">
          <Skeleton className="h-96 rounded-2xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col lg:flex-row gap-8 mx-auto mt-4 md:mt-0">
      <div className="lg:w-1/3">
        <div className="sticky top-28">
          <ProfileAvatarCard />
        </div>
      </div>

      <div className="lg:w-2/3">
        <div className="bg-white rounded-2xl md:rounded-xl shadow-sm p-6 md:p-8">
          <form
            onSubmit={handleSubmit(onSubmit)}
            noValidate
            className="space-y-10"
          >
            <section>
              <h3 className="text-lg font-bold text-gray-800 border-b border-gray-100 pb-3 mb-6 flex items-center">
                <MdAdminPanelSettings className="mr-2 text-primary text-xl" />
                Credenciales de Administrador
              </h3>

              <div className="space-y-6">
                <ImageDropzone
                  label="Foto de Perfil"
                  variant="circle"
                  initialImage={profile?.avatarUrl ?? undefined}
                  onFileChange={(file) => setAvatarFile(file)}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="md:col-span-2">
                    <Input
                      label="Nombre Completo"
                      placeholder="Tu nombre"
                      leftIcon={<MdAdminPanelSettings />}
                      error={errors.username}
                      {...register("username")}
                    />
                  </div>
                  <div>
                    <Input
                      label="Correo Electrónico"
                      type="email"
                      placeholder="Tu correo"
                      leftIcon={<MdEmail />}
                      error={errors.email}
                      {...register("email")}
                    />
                  </div>
                  <div>
                    <Input
                      label="Teléfono"
                      type="tel"
                      placeholder="10 dígitos"
                      leftIcon={<MdPhone />}
                      error={errors.phone}
                      {...register("phone")}
                    />
                  </div>
                </div>
              </div>
            </section>

            <section>
              <h3 className="text-lg font-bold text-gray-800 border-b border-gray-100 pb-3 mb-6 flex items-center">
                <MdLock className="mr-2 text-primary text-xl" />
                Seguridad
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <Input
                    label="Nueva Contraseña"
                    type="password"
                    placeholder="Mínimo 8 caracteres"
                    leftIcon={<MdLock />}
                    error={errors.password}
                    hint="Deja en blanco para no cambiarla."
                    {...register("password")}
                  />
                </div>
                <div>
                  <Input
                    label="Confirmar Nueva Contraseña"
                    type="password"
                    placeholder="Repite tu contraseña"
                    leftIcon={<MdLock />}
                    error={errors.passwordConfirmation}
                    {...register("passwordConfirmation")}
                  />
                </div>
              </div>
            </section>

            <div className="mt-8 pt-6 border-t border-gray-100 flex flex-col md:flex-row justify-end gap-4 sticky -bottom-4 bg-white md:static pb-8 md:py-0 z-10">
              <Button
                type="button"
                variant="ghost"
                className="hidden md:flex border border-gray-200"
                onClick={() => {
                  reset();
                  setAvatarFile(null);
                }}
                disabled={!isDirty && !avatarFile}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                variant="primary"
                size="lg"
                leftIcon={<MdSave className="text-xl" />}
                loading={isPending}
                className="w-full md:w-auto shadow-lg md:shadow-none"
              >
                GUARDAR CAMBIOS
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
