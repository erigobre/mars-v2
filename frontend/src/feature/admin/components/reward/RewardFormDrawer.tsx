import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { MdAddCircle, MdEdit, MdStars, MdInventory2 } from "react-icons/md";
import { Drawer } from "@/core/components/ui/Drawer";
import { Button, Input, Select, Textarea } from "@/core/components/ui";
import { Switch } from "@/core/components/ui/Switch";
import {
  rewardFormSchema,
  rewardVisibilitySchema,
  type Reward,
  type RewardFormData,
  type RewardVisibility,
} from "../../../rewards/schemas/reward";
import {
  useCreateRewardMutation,
  useUpdateRewardMutation,
} from "../../../rewards/services/rewardServices";
import { ImageDropzone } from "@/core/components/ui/ImageDropzone";

type RewardFormDrawerProps = {
  isOpen: boolean;
  onClose: () => void;
  rewardToEdit?: Reward | null;
};

const visibilityLabels: Record<RewardVisibility, string> = {
  always: "Siempre",
  campaign_end: "Al final de la campaña",
  cycle_end: "Al final del ciclo",
};

export default function RewardFormDrawer({
  isOpen,
  onClose,
  rewardToEdit,
}: RewardFormDrawerProps) {
  const isEditing = !!rewardToEdit;

  const [imageFile, setImageFile] = useState<File | null>(null);

  const {
    register,
    handleSubmit,
    setError,
    reset,
    formState: { errors, isDirty },
  } = useForm<RewardFormData>({
    resolver: zodResolver(rewardFormSchema),
    mode: "onChange",
    defaultValues: {
      name: "",
      description: "",
      pointsRequired: undefined,
      stock: undefined,
      category: "",
      isActive: true,
      isFeatured: false,
      visibility: "always",
      maxGlobalClaims: undefined,
      baseCost: null,
    },
  });

  useEffect(() => {
    if (rewardToEdit && isOpen) {
      reset({
        name: rewardToEdit.name,
        description: rewardToEdit.description ?? "",
        pointsRequired: rewardToEdit.pointsRequired,
        stock: rewardToEdit.stock ?? 0,
        category: rewardToEdit.category ?? "",
        isActive: rewardToEdit.isActive ?? true,
        isFeatured: rewardToEdit.isFeatured ?? false,
        visibility: rewardToEdit.visibility ?? "always",
        maxGlobalClaims: rewardToEdit.maxGlobalClaims ?? undefined,
        baseCost: rewardToEdit.baseCost ?? null,
      });
      setImageFile(null);
    } else if (!isOpen) {
      reset({
        name: "",
        description: "",
        pointsRequired: undefined,
        stock: undefined,
        category: "",
        isActive: true,
        isFeatured: false,
        visibility: "always",
        maxGlobalClaims: undefined,
        baseCost: null,
      });
      setImageFile(null);
    }
  }, [rewardToEdit, isOpen, reset]);

  const { mutate: createReward, isPending: isCreating } =
    useCreateRewardMutation({ setError, onClose });
  const { mutate: updateReward, isPending: isUpdating } =
    useUpdateRewardMutation({ setError, onClose });
  const isPending = isCreating || isUpdating;

  const onSubmit = (data: RewardFormData) => {
    if (isEditing) {
      updateReward({ id: rewardToEdit.id, formData: data, imageFile });
    } else {
      createReward({ formData: data, imageFile });
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
        {isEditing ? "Guardar Cambios" : "Guardar Premio"}
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
      title={isEditing ? "Editar Premio" : "Nuevo Premio"}
      icon={isEditing ? <MdEdit /> : <MdAddCircle />}
      footer={FooterActions}
      isDirty={isDirty || imageFile !== null}
    >
      <form className="space-y-5">
        {/* Image Upload */}
        <ImageDropzone
          label="Imagen del Premio"
          initialImage={rewardToEdit?.image || undefined}
          onFileChange={(file: File | null) => setImageFile(file)}
          error={errors.image?.message} // Si usas validación de error
        />

        {/* Name */}
        <Input
          label="Nombre del Premio"
          placeholder="Ej: Vaso Térmico Frigolazo"
          error={errors.name}
          {...register("name")}
        />

        {/* Points + Stock */}
        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Puntos Requeridos"
            type="number"
            placeholder="0"
            leftIcon={<MdStars />}
            error={errors.pointsRequired}
            {...register("pointsRequired", { valueAsNumber: true })}
          />
          <Input
            label="Inventario"
            type="number"
            placeholder="0"
            leftIcon={<MdInventory2 />}
            error={errors.stock}
            {...register("stock", { valueAsNumber: true })}
          />
        </div>

        {/* Category */}
        <Input
          label="Categoría"
          placeholder="Ej: Electrónica, Hogar..."
          error={errors.category}
          {...register("category")}
        />

        {/* Description */}
        <Textarea
          label="Descripción"
          placeholder="Describe los beneficios y detalles del premio..."
          rows={4}
          error={errors.description}
          {...register("description")}
        />

        <Select
          label="Visibilidad"
          error={errors.visibility?.message}
          options={rewardVisibilitySchema.options.map((option) => ({
            value: option,
            label: visibilityLabels[option] || option,
          }))}
          {...register("visibility")}
        />

        <Select
          label="Categoría de Costo Base (Para Matriz de Precios)"
          error={errors.baseCost?.message}
          hint="Determina a qué grupo pertenece en la matriz de precios masiva"
          options={[
            { value: "", label: "Ninguna (No se verá afectado por matriz)" },
            { value: 1500, label: "Bajo ($1,500)" },
            { value: 3000, label: "Medio ($3,000)" },
            { value: 6000, label: "Alto ($6,000)" },
          ]}
          {...register("baseCost", { 
            setValueAs: (v) => v === "" ? null : Number(v)
          })}
        />

        {/* Max Global Claims */}
        <Input
          label="Límite global de canjes (opcional)"
          type="number"
          placeholder="Sin límite"
          hint="Deja vacío para no establecer límite"
          error={errors.maxGlobalClaims}
          {...register("maxGlobalClaims", {
            setValueAs: (value) => {
              if (value === "") return undefined;

              const parsed = parseInt(value, 10);

              return isNaN(parsed) ? undefined : parsed;
            },
          })}
        />

        {/* Status toggle */}
        <Switch
          label="Estado del Premio"
          description="Visible y disponible para los vendedores"
          error={errors.isActive}
          {...register("isActive")}
        />

        <Switch
          label="Premio Destacado"
          description="Resaltar en el catálogo"
          error={errors.isFeatured}
          {...register("isFeatured")}
        />
      </form>
    </Drawer>
  );
}
