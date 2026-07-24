import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Drawer } from "@/core/components/ui/Drawer";
import { Input } from "@/core/components/ui/Input";
import { Button } from "@/core/components/ui/Button";
import { Switch } from "@/core/components/ui/Switch";
import { ImageDropzone } from "@/core/components/ui/ImageDropzone";
import {
  useCreateLogisticMutation,
  useUpdateLogisticMutation,
} from "../../services/logisticServices";
import {
  logisticFormSchema,
  type Logistic,
  type LogisticFormData,
} from "../../schemas/logistic";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  logisticToEdit?: Logistic | null;
}

export const LogisticFormDrawer = ({
  isOpen,
  onClose,
  logisticToEdit,
}: Props) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
    setError,
  } = useForm<LogisticFormData>({
    resolver: zodResolver(logisticFormSchema),
    defaultValues: { isActive: true },
  });

  const createMutation = useCreateLogisticMutation({
    setError,
    onClose,
  });
  const updateMutation = useUpdateLogisticMutation({
    setError,
    onClose,
  });
  const isPending = createMutation.isPending || updateMutation.isPending;

  useEffect(() => {
    if (isOpen) {
      if (logisticToEdit) {
        reset({
          username: logisticToEdit.username,
          email: logisticToEdit.email,
          phone: logisticToEdit.phone,
          birthdate: logisticToEdit.birthdate
            ? logisticToEdit.birthdate.split("T")[0]
            : undefined,
          isActive: logisticToEdit.isActive,
        });
      } else {
        reset({
          isActive: true,
          username: "",
          email: "",
          phone: "",
          birthdate: "",
        });
      }
    }
  }, [isOpen, logisticToEdit, reset]);

  const onSubmit = (data: LogisticFormData) => {
    const avatarFile = data.avatar instanceof File ? data.avatar : null;

    if (logisticToEdit?.id) {
      updateMutation.mutate({
        id: logisticToEdit.id,
        formData: data,
        avatarFile,
      });
    } else {
      createMutation.mutate({ formData: data, avatarFile });
    }
  };

  return (
    <Drawer
      isOpen={isOpen}
      onClose={onClose}
      title={logisticToEdit ? "Editar Perfil" : "Nuevo Perfil de Logística"}
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <ImageDropzone
          label="Foto de Perfil (Avatar)"
          variant="circle"
          initialImage={
            typeof logisticToEdit?.avatar === "string"
              ? logisticToEdit.avatar
              : undefined
          }
          onFileChange={(file) => {
            setValue("avatar", file, {
              shouldValidate: true,
              shouldDirty: true,
            });
          }}
          error={errors.avatar?.message as string}
        />

        <Input
          label="Nombre Completo"
          {...register("username")}
          error={errors.username}
        />

        <Input
          label="Correo Electrónico"
          type="email"
          {...register("email")}
          error={errors.email}
        />

        <Input label="Teléfono" {...register("phone")} error={errors.phone} />

        {!logisticToEdit && (
          <Input
            label="Fecha de Nacimiento"
            type="date"
            {...register("birthdate")}
            error={errors.birthdate}
          />
        )}

        <Switch
          label="Estado de la cuenta"
          description="¿El usuario puede acceder al sistema?"
          checked={watch("isActive")}
          onChange={(e) => setValue("isActive", e.target.checked)}
        />

        <div className="pt-4 flex justify-end gap-3">
          <Button
            type="button"
            variant="ghost"
            onClick={onClose}
            disabled={isPending}
          >
            Cancelar
          </Button>
          <Button type="submit" loading={isPending}>
            {logisticToEdit ? "Guardar Cambios" : "Crear Perfil"}
          </Button>
        </div>
      </form>
    </Drawer>
  );
};
