import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  MdAddCircle,
  MdEdit,
  MdEmojiEvents,
  MdAttachMoney,
  MdInventory,
  MdViewModule,
  MdLayers,
} from "react-icons/md";
import { Drawer } from "@/core/components/ui/Drawer";
import { Button, Input, Select, Textarea } from "@/core/components/ui";
import { Switch } from "@/core/components/ui/Switch";
import {
  goalFormSchema,
  type AdminGoal,
  type GoalFormData,
} from "../../schemas/goal";
import {
  useCreateGoalMutation,
  useUpdateGoalMutation,
} from "../../services/goalServices";
import {
  useCampaignsQuery,
  useCampaignDetailsQuery,
} from "@/feature/admin/services/campaignServices";
import {
  useProductsQuery
} from "@/feature/products/services/productServices";
import { goalTypeLabels, type GoalType } from "@/core/schemas/goal";
import { useDisplaysQuery } from "../../services/displayServices";

type GoalFormDrawerProps = {
  isOpen: boolean;
  onClose: () => void;
  goalToEdit?: AdminGoal | null;
};

export default function GoalFormDrawer({
  isOpen,
  onClose,
  goalToEdit,
}: GoalFormDrawerProps) {
  const isEditing = !!goalToEdit;

  const { data: campaignsData } = useCampaignsQuery(1, 100);
  const { data: productsData } = useProductsQuery(1, 100);
  const { data: displaysData } = useDisplaysQuery(1, 1000);

  const campaigns = campaignsData?.items ?? [];
  const products = productsData?.items ?? [];
  const displays = displaysData?.items ?? [];

  const [selectedCampaignId, setSelectedCampaignId] = useState<number | "">("");

  const { data: campaignDetails, isLoading: isLoadingCycles } =
    useCampaignDetailsQuery(selectedCampaignId as number, {
      enabled: !!selectedCampaignId,
    });

  const availableCycles = campaignDetails?.cycles ?? [];

  const {
    register,
    handleSubmit,
    setError,
    reset,
    watch,
    setValue,
    formState: { errors, isDirty },
  } = useForm<GoalFormData>({
    resolver: zodResolver(goalFormSchema),
    mode: "onChange",
    defaultValues: {
      cycleId: undefined,
      name: "",
      description: "",
      type: "TOTAL_SALES_AMOUNT",
      targetValue: undefined,
      rewardPoints: undefined,
      isActive: true,
      productId: null,
      displayId: null,
    },
  });

  const selectedType = watch("type");

  useEffect(() => {
    if (isOpen) {
      if (goalToEdit) {
        const parentCampaign = campaigns.find((camp) =>
          camp.cycles?.some((cyc) => cyc.id === goalToEdit.cycleId)
        );

        if (parentCampaign) {
          setSelectedCampaignId(parentCampaign.id);
        }

        reset({
          cycleId: goalToEdit.cycleId,
          name: goalToEdit.name,
          description: goalToEdit.description ?? "",
          type: goalToEdit.type,
          targetValue: goalToEdit.targetValue,
          rewardPoints: goalToEdit.rewardPoints,
          isActive: goalToEdit.isActive,
          productId: goalToEdit.product?.id ?? null,
          displayId: goalToEdit.display?.id ?? null,
        });
      } else {
        setSelectedCampaignId("");
        reset({
          cycleId: undefined,
          name: "",
          description: "",
          type: "TOTAL_SALES_AMOUNT",
          targetValue: undefined,
          rewardPoints: undefined,
          isActive: true,
          productId: null,
          displayId: null,
        });
      }
    }
  }, [goalToEdit, isOpen, reset, campaigns]);

  const { mutate: createGoal, isPending: isCreating } = useCreateGoalMutation({
    setError,
    onClose,
  });

  const { mutate: updateGoal, isPending: isUpdating } = useUpdateGoalMutation({
    setError,
    onClose,
  });

  const isPending = isCreating || isUpdating;

  const onSubmit = (data: GoalFormData) => {
    if (isEditing) {
      updateGoal({ id: goalToEdit.id, formData: data });
    } else {
      createGoal(data);
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
        {isEditing ? "Guardar Cambios" : "Crear Meta"}
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
      title={isEditing ? "Editar Meta" : "Nueva Meta"}
      icon={isEditing ? <MdEdit /> : <MdAddCircle />}
      footer={FooterActions}
      isDirty={isDirty}
    >
      <div className="space-y-6 pb-4">
        <div className="space-y-4 p-4 bg-gray-50 rounded-2xl border border-gray-100">
          <Select
            label="Campaña"
            leftIcon={<MdLayers className="text-gray-400" />}
            value={selectedCampaignId}
            onChange={(e) => {
              const val = e.target.value ? Number(e.target.value) : "";
              setSelectedCampaignId(val);
              setValue("cycleId", undefined as any);
            }}
          >
            <option value="">Selecciona una campaña...</option>
            {campaigns.map((camp) => (
              <option key={camp.id} value={camp.id}>
                {camp.name}
              </option>
            ))}
          </Select>

          <Select
            label={
              isLoadingCycles ? "Cargando ciclos..." : "Ciclo de Redención"
            }
            disabled={!selectedCampaignId || isLoadingCycles}
            error={errors.cycleId?.message}
            {...register("cycleId", { valueAsNumber: true })}
          >
            <option value="">
              {selectedCampaignId
                ? "Selecciona un ciclo..."
                : "Elige primero una campaña"}
            </option>
            {availableCycles.map((cycle) => (
              <option key={cycle.id} value={cycle.id}>
                {cycle.name}
              </option>
            ))}
          </Select>
        </div>

        <Input
          label="Nombre de la Meta"
          placeholder="Ej: Meta de Ventas Q1"
          leftIcon={<MdEmojiEvents />}
          error={errors.name}
          {...register("name")}
        />

        <Select
          label="Tipo de Meta"
          error={errors.type?.message}
          {...register("type")}
        >
          {Object.entries(goalTypeLabels).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </Select>

        <div className="p-4 bg-blue-50/50 border border-blue-100 rounded-xl flex items-start gap-3">
          <div className="bg-blue-100 p-2 rounded-lg text-primary shrink-0">
            {selectedType === "TOTAL_SALES_AMOUNT" && (
              <MdAttachMoney className="text-lg" />
            )}
            {selectedType === "SPECIFIC_PRODUCT_QTY" && (
              <MdInventory className="text-lg" />
            )}
            {selectedType === "TOTAL_DISPLAY_QTY" && (
              <MdViewModule className="text-lg" />
            )}
          </div>
          <div>
            <p className="text-xs font-bold text-blue-900">
              {goalTypeLabels[selectedType as GoalType]}
            </p>
            <p className="text-[10px] text-blue-800/70 leading-relaxed">
              {selectedType === "TOTAL_SALES_AMOUNT" &&
                "Basado en el monto total de dinero vendido."}
              {selectedType === "SPECIFIC_PRODUCT_QTY" &&
                "Basado en unidades vendidas de un producto único."}
              {selectedType === "TOTAL_DISPLAY_QTY" &&
                "Basado en unidades vendidas de productos de un display."}
            </p>
          </div>
        </div>

        {selectedType === "SPECIFIC_PRODUCT_QTY" && (
          <Select
            label="Producto Específico"
            error={errors.productId?.message}
            {...register("productId", { valueAsNumber: true })}
          >
            <option value="">Selecciona un producto...</option>
            {products.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name} ({p.sku})
              </option>
            ))}
          </Select>
        )}

        {selectedType === "TOTAL_DISPLAY_QTY" && (
          <Select
            label="Display"
            error={errors.displayId?.message}
            {...register("displayId", { valueAsNumber: true })}
          >
            <option value="">Selecciona un display...</option>
            {displays.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name}
              </option>
            ))}
          </Select>
        )}

        <div className="grid grid-cols-2 gap-4">
          <Input
            label={
              selectedType === "TOTAL_SALES_AMOUNT" ? "Monto ($)" : "Cantidad"
            }
            type="number"
            step={selectedType === "TOTAL_SALES_AMOUNT" ? "0.01" : "1"}
            error={errors.targetValue}
            {...register("targetValue", { valueAsNumber: true })}
          />
          <Input
            label="Premio (Pts)"
            type="number"
            leftIcon={<MdEmojiEvents />}
            error={errors.rewardPoints}
            {...register("rewardPoints", { valueAsNumber: true })}
          />
        </div>

        <Textarea
          label="Descripción"
          placeholder="Notas adicionales..."
          rows={2}
          error={errors.description}
          {...register("description")}
        />

        <Switch
          label="Meta Activa"
          description="Visible para vendedores"
          checked={watch("isActive")}
          {...register("isActive")}
        />
      </div>
    </Drawer>
  );
}
