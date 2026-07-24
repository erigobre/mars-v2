import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  MdAddCircle,
  MdEdit,
  MdStar,
  MdAttachMoney,
  MdNumbers,
  MdEmojiEvents,
  MdWorkspacePremium,
  MdMilitaryTech,
  MdDiamond,
  MdShield,
  MdWhatshot,
  MdTrendingUp,
} from "react-icons/md";
import { Drawer } from "@/core/components/ui/Drawer";
import { Button, Input, Select } from "@/core/components/ui";
import { Switch } from "@/core/components/ui/Switch";
import {
  sellerTierFormSchema,
  type SellerTier,
  type SellerTierFormData,
} from "../schemas/sellerTier";
import {
  useCreateSellerTierMutation,
  useUpdateSellerTierMutation,
} from "../services/sellerTierServices";
import { useDistributorsQuery } from "@/feature/admin/services/distributorServices";

// Definimos los iconos disponibles para los rangos
const AVAILABLE_ICONS = [
  { id: "MdStar", icon: MdStar },
  { id: "MdEmojiEvents", icon: MdEmojiEvents },
  { id: "MdWorkspacePremium", icon: MdWorkspacePremium },
  { id: "MdMilitaryTech", icon: MdMilitaryTech },
  { id: "MdDiamond", icon: MdDiamond },
  { id: "MdShield", icon: MdShield },
  { id: "MdWhatshot", icon: MdWhatshot },
  { id: "MdTrendingUp", icon: MdTrendingUp },
];

type SellerTierFormDrawerProps = {
  isOpen: boolean;
  onClose: () => void;
  tierToEdit?: SellerTier | null;
  defaultDistributorId?: string | number;
};

export default function SellerTierFormDrawer({
  isOpen,
  onClose,
  tierToEdit,
  defaultDistributorId,
}: SellerTierFormDrawerProps) {
  const { data: distributorsData } = useDistributorsQuery(1, 100, {});
  const distributorOptions = [
    { value: "", label: "Global (Aplica a todos los vendedores)" },
    ...(distributorsData?.items ?? []).map((d) => ({
      value: String(d.id),
      label: d.companyName,
    })),
  ];

  const isEditing = !!tierToEdit;

  const {
    register,
    handleSubmit,
    setError,
    reset,
    watch,
    setValue, // Extraemos setValue para actualizar el icono manualmente
    formState: { errors, isDirty },
  } = useForm<SellerTierFormData>({
    resolver: zodResolver(sellerTierFormSchema),
    mode: "onChange",
    defaultValues: {
      distributorId: "",
      name: "",
      slug: "",
      minAverageSales: "",
      maxAverageSales: "",
      order: "",
      color: "#0f172a",
      icon: "",
      isActive: true,
    },
  });

  const selectedIcon = watch("icon");
  const selectedColor = watch("color") || "#0f172a";

  useEffect(() => {
    if (tierToEdit && isOpen) {
      reset({
        distributorId: tierToEdit.distributorId ?? "",
        name: tierToEdit.name,
        slug: tierToEdit.slug,
        minAverageSales: tierToEdit.minAverageSales,
        maxAverageSales: tierToEdit.maxAverageSales ?? "",
        order: tierToEdit.order ?? "",
        color: tierToEdit.color ?? "#0f172a",
        icon: tierToEdit.icon ?? "",
        isActive: tierToEdit.isActive,
      });
    } else if (!isOpen) {
      reset({
        distributorId: defaultDistributorId ?? "",
        name: "",
        slug: "",
        minAverageSales: "",
        maxAverageSales: "",
        order: "",
        color: "#0f172a",
        icon: "",
        isActive: true,
      });
    }
  }, [tierToEdit, isOpen, reset, defaultDistributorId]);

  const { mutate: createTier, isPending: isCreating } =
    useCreateSellerTierMutation({
      setError,
      onClose,
    });
  const { mutate: updateTier, isPending: isUpdating } =
    useUpdateSellerTierMutation({
      setError,
      onClose,
    });

  const isPending = isCreating || isUpdating;

  const onSubmit = (data: SellerTierFormData) => {
    const sanitizedData = {
      ...data,
      distributorId:
        data.distributorId === "" || data.distributorId == null
          ? null
          : Number(data.distributorId),
      maxAverageSales:
        data.maxAverageSales === "" || data.maxAverageSales == null
          ? null
          : Number(data.maxAverageSales),
      order:
        data.order === "" || data.order == null ? null : Number(data.order),
      color: data.color === "" ? null : data.color,
      icon: data.icon === "" ? null : data.icon,
      minAverageSales: Number(data.minAverageSales),
    };

    if (isEditing) {
      updateTier({ id: tierToEdit.id, formData: sanitizedData });
    } else {
      createTier(sanitizedData);
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
      >
        {isEditing ? "Guardar Cambios" : "Crear Rango"}
      </Button>
      <Button
        variant="ghost"
        fullWidth
        onClick={onClose}
        className="text-slate-500"
      >
        Cancelar
      </Button>
    </div>
  );

  return (
    <Drawer
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? "Editar Rango" : "Nuevo Rango"}
      icon={isEditing ? <MdEdit /> : <MdAddCircle />}
      footer={FooterActions}
      isDirty={isDirty}
    >
      <form className="space-y-5">
        <Input
          label="Nombre del Rango"
          placeholder="Ej. Platino"
          leftIcon={<MdStar />}
          error={errors.name}
          {...register("name")}
        />

        <Input
          label="Slug (Identificador)"
          placeholder="Ej. platino"
          error={errors.slug}
          {...register("slug")}
        />

        <Select
          label="Contexto del Rango (Distribuidor)"
          error={errors.distributorId?.message}
          options={distributorOptions}
          {...register("distributorId")}
        />

        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Ventas Promedio Mínimas"
            type="number"
            step="0.01"
            leftIcon={<MdAttachMoney />}
            error={errors.minAverageSales}
            {...register("minAverageSales")}
          />
          <Input
            label="Ventas Promedio Máximas"
            type="number"
            step="0.01"
            placeholder="Sin límite"
            leftIcon={<MdAttachMoney />}
            error={errors.maxAverageSales}
            {...register("maxAverageSales")}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Orden de Jerarquía"
            type="number"
            leftIcon={<MdNumbers />}
            error={errors.order}
            {...register("order")}
          />
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-slate-700">
              Color Distintivo
            </label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={selectedColor}
                onChange={(e) => {
                  setValue("color", e.target.value, {
                    shouldValidate: true,
                    shouldDirty: true,
                  });
                }}
                className="h-11 w-14 rounded-xl border border-slate-200 cursor-pointer p-1 bg-white"
              />

              <Input
                placeholder="#000000"
                error={errors.color}
                {...register("color")}
                className="flex-1"
              />
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-1.5 border-t border-slate-100 pt-5">
          <label className="text-sm font-medium text-slate-700">
            Icono Distintivo
          </label>
          <div className="grid grid-cols-4 gap-2">
            {AVAILABLE_ICONS.map(({ id, icon: Icon }) => (
              <button
                key={id}
                type="button"
                onClick={() =>
                  setValue("icon", selectedIcon === id ? "" : id, {
                    shouldDirty: true,
                  })
                }
                className={`flex justify-center items-center p-3 rounded-xl border transition-all ${
                  selectedIcon === id
                    ? "bg-blue-50 border-blue-200 text-blue-600 shadow-sm ring-1 ring-blue-600"
                    : "bg-white border-slate-200 text-slate-400 hover:bg-slate-50 hover:text-slate-600"
                }`}
                title={id}
              >
                <Icon size={24} />
              </button>
            ))}
          </div>
          {errors.icon && (
            <p className="text-xs text-red-500 mt-1">{errors.icon.message}</p>
          )}
        </div>

        <Switch
          label="Rango activo"
          description="Habilita o deshabilita este rango en el sistema"
          error={errors.isActive}
          checked={watch("isActive")}
          {...register("isActive")}
        />
      </form>
    </Drawer>
  );
}
