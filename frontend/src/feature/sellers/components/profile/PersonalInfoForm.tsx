import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input, Button } from "@/core/components/ui";
import { ImageDropzone } from "@/core/components/ui/ImageDropzone";
import {
  MdPerson,
  MdEmail,
  MdPhone,
  MdLocalShipping,
  MdSignpost,
  MdHomeWork,
  MdLocationOn,
  MdMap,
  MdPinDrop,
  MdLock,
} from "react-icons/md";
import { useUpdateProfileMutation } from "@/feature/profile/services/profileServices";
import {
  sellerProfileFormSchema,
  type SellerProfileForm,
} from "@/feature/profile/schemas/profileSchema";

export default function PersonalInfoForm({ profile }: { profile: any }) {
  const [avatarFile, setAvatarFile] = useState<File | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isDirty },
  } = useForm<SellerProfileForm>({
    resolver: zodResolver(sellerProfileFormSchema),
    mode: "onChange",
  });

  useEffect(() => {
    if (profile) {
      reset({
        username: profile.username,
        email: profile.email,
        phone: profile.phone,
        password: "",
        passwordConfirmation: "",
        addressStreet: profile.address?.street ?? "",
        addressColonia: profile.address?.colonia ?? "",
        addressCity: profile.address?.city ?? "",
        addressState: profile.address?.state ?? "",
        addressZip: profile.address?.zip ?? "",
        shippingNotes: profile.shippingNotes ?? "",
      });
    }
  }, [profile, reset]);

  const { mutate: updateProfile, isPending } = useUpdateProfileMutation({
    setError,
  });

  const onSubmit = (data: SellerProfileForm) => {
    updateProfile({ formData: data, avatarFile });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-12">
      <section>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
          <div className="md:col-span-2">
            <ImageDropzone
              label="Actualizar Foto de Perfil"
              variant="circle"
              initialImage={profile?.avatarUrl ?? undefined}
              onFileChange={(file) => setAvatarFile(file)}
            />
          </div>
          <div className="md:col-span-2">
            <Input
              label="Nombre Completo"
              error={errors.username}
              leftIcon={<MdPerson />}
              {...register("username")}
            />
          </div>
          <div>
            <Input
              label="Correo Electrónico"
              type="email"
              error={errors.email}
              leftIcon={<MdEmail />}
              {...register("email")}
            />
          </div>
          <div>
            <Input
              label="Teléfono"
              type="tel"
              error={errors.phone}
              leftIcon={<MdPhone />}
              {...register("phone")}
            />
          </div>
        </div>
      </section>

      <section className="pt-8 border-t border-gray-100">
        <h3 className="text-2xl font-bold text-theme-primary mb-8 flex items-center gap-2">
          <MdLocalShipping /> Dirección de Envío
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-6 gap-8">
          <div className="md:col-span-4">
            <Input
              label="Calle y Número"
              error={errors.addressStreet}
              leftIcon={<MdSignpost />}
              {...register("addressStreet")}
            />
          </div>
          <div className="md:col-span-2">
            <Input
              label="Colonia"
              error={errors.addressColonia}
              leftIcon={<MdHomeWork />}
              {...register("addressColonia")}
            />
          </div>
          <div className="md:col-span-2">
            <Input
              label="Ciudad / Municipio"
              error={errors.addressCity}
              leftIcon={<MdLocationOn />}
              {...register("addressCity")}
            />
          </div>
          <div className="md:col-span-2">
            <Input
              label="Estado"
              error={errors.addressState}
              leftIcon={<MdMap />}
              {...register("addressState")}
            />
          </div>
          <div className="md:col-span-2">
            <Input
              label="Código Postal"
              maxLength={10}
              error={errors.addressZip}
              leftIcon={<MdPinDrop />}
              {...register("addressZip")}
            />
          </div>
          <div className="md:col-span-6">
            <Input
              label="Notas de Envío (opcional)"
              error={errors.shippingNotes}
              {...register("shippingNotes")}
            />
          </div>
        </div>
      </section>

      <section className="pt-8 border-t border-gray-100">
        <h3 className="text-2xl font-bold text-theme-primary mb-8 flex items-center gap-2">
          <MdLock /> Seguridad
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <Input
              label="Nueva Contraseña"
              type="password"
              placeholder="Dejar en blanco para mantener actual"
              error={errors.password}
              leftIcon={<MdLock />}
              {...register("password")}
            />
          </div>
          <div>
            <Input
              label="Confirmar Nueva Contraseña"
              type="password"
              error={errors.passwordConfirmation}
              leftIcon={<MdLock />}
              {...register("passwordConfirmation")}
            />
          </div>
        </div>
      </section>

      <div className="flex flex-col md:flex-row justify-end items-center gap-6 pt-12 border-t border-gray-100">
        <Button
          type="button"
          variant="ghost"
          className="w-full md:w-auto text-gray-400 hover:text-gray-600 font-bold"
          onClick={() => {
            reset();
            setAvatarFile(null);
          }}
          disabled={!isDirty && !avatarFile}
        >
          CANCELAR
        </Button>
        <Button
          type="submit"
          variant="secondary"
          size="lg"
          loading={isPending}
          className="w-full md:w-auto shadow-xl shadow-secondary/20 uppercase tracking-widest font-extrabold"
        >
          GUARDAR CAMBIOS
        </Button>
      </div>
    </form>
  );
}
