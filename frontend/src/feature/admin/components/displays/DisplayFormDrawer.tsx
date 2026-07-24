import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  MdAddCircle,
  MdEdit,
  MdLabel,
  MdStars,
  MdViewModule,
} from "react-icons/md";
import { Drawer } from "@/core/components/ui/Drawer";
import { Button, Input } from "@/core/components/ui";
import { Switch } from "@/core/components/ui/Switch";
import {
  displayFormSchema,
  type Display,
  type DisplayFormData,
} from "../../schemas/display";
import {
  useCreateDisplayMutation,
  useUpdateDisplayMutation,
} from "../../services/displayServices";

type DisplayFormDrawerProps = {
  isOpen: boolean;
  onClose: () => void;
  displayToEdit?: Display | null;
};

export default function DisplayFormDrawer({
  isOpen,
  onClose,
  displayToEdit,
}: DisplayFormDrawerProps) {
  const isEditing = !!displayToEdit;

  const {
    register,
    handleSubmit,
    setError,
    reset,
    watch,
    formState: { errors, isDirty },
  } = useForm<DisplayFormData>({
    resolver: zodResolver(displayFormSchema),
    mode: "onChange",
    defaultValues: {
      name: "",
      slug: "",
      valuePoints: 0,
      isActive: true,
    },
  });

  useEffect(() => {
    if (displayToEdit && isOpen) {
      reset({
        name: displayToEdit.name,
        slug: displayToEdit.slug,
        valuePoints: displayToEdit.valuePoints,
        isActive: displayToEdit.isActive,
      });
    } else if (!isOpen) {
      reset({
        name: "",
        slug: "",
        valuePoints: 0,
        isActive: true,
      });
    }
  }, [displayToEdit, isOpen, reset]);

  const { mutate: createDisplay, isPending: isCreating } =
    useCreateDisplayMutation({ setError, onClose });
  const { mutate: updateDisplay, isPending: isUpdating } =
    useUpdateDisplayMutation({ setError, onClose });
  const isPending = isCreating || isUpdating;

  const onSubmit = (data: DisplayFormData) => {
    if (isEditing) {
      updateDisplay({ id: displayToEdit.id, formData: data });
    } else {
      createDisplay(data);
    }
  };

  const FooterActions = (
    <div className="flex flex-col gap-3">
      <Button
        variant="primary"
        size="lg"
        fullWidth
        loading={isPending}
        onClick={handleSubmit(onSubmit)}
        className="shadow-lg shadow-primary/20"
      >
        {isEditing ? "Guardar Cambios" : "Crear Display"}
      </Button>
      <Button
        variant="ghost"
        fullWidth
        onClick={onClose}
        className="text-gray-500"
      >
        Cancelar
      </Button>
    </div>
  );

  return (
    <Drawer
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? "Editar Display" : "Nuevo Display"}
      icon={isEditing ? <MdEdit /> : <MdAddCircle />}
      footer={FooterActions}
      isDirty={isDirty}
    >
      <form className="space-y-5">
        <Input
          label="Nombre del Display"
          placeholder="Ej. Display Navideño"
          leftIcon={<MdViewModule />}
          error={errors.name}
          {...register("name")}
        />

        <Input
          label="Slug (Identificador)"
          placeholder="ej-display-navideno"
          leftIcon={<MdLabel />}
          error={errors.slug}
          {...register("slug")}
        />

        <Input
          label="Puntos de Valor"
          type="number"
          placeholder="0"
          leftIcon={<MdStars />}
          error={errors.valuePoints}
          {...register("valuePoints", { valueAsNumber: true })}
        />

        <Switch
          label="Display Activo"
          description="¿Está disponible este display en el catálogo?"
          error={errors.isActive}
          checked={watch("isActive")}
          {...register("isActive")}
        />
      </form>
    </Drawer>
  );
}
