import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  MdAutoFixHigh,
  MdCalendarMonth,
  MdEdit,
  MdSync,
} from "react-icons/md";
import { Drawer } from "@/core/components/ui/Drawer";
import { Button, Input } from "@/core/components/ui";
import { Switch } from "@/core/components/ui/Switch";
import {
  cycleFormSchema,
  type Campaign,
  type CycleFormData,
  type RedemptionCycle,
} from "../../schemas/campaign";
import { useCreateCycleMutation, useUpdateCycleMutation } from "../../services/cycleServices";
import { formatDateForInput } from "@/core/utils/formatDate";

type CycleFormDrawerProps = {
  isOpen: boolean;
  onClose: () => void;
  campaign: Campaign;
  cycleToEdit?: RedemptionCycle | null;
};

export default function CycleFormDrawer({
  isOpen,
  onClose,
  campaign,
  cycleToEdit,
}: CycleFormDrawerProps) {
  const isEditing = !!cycleToEdit;

  const campaignId = campaign.id;

  const campaignMinDate = formatDateForInput(campaign.startDate);
  const campaignMaxDate = formatDateForInput(campaign.endDate);

  const {
    register,
    handleSubmit,
    setError,
    reset,
    watch,
    formState: { errors, isDirty },
  } = useForm<CycleFormData>({
    resolver: zodResolver(cycleFormSchema),
    mode: "onChange",
    defaultValues: {
      name: "",
      startDate: "",
      endDate: "",
      isActive: true,
      autoGenerateWindows: true,
    },
  });

  const currentStartDate = watch("startDate");

  useEffect(() => {
    if (cycleToEdit && isOpen) {
      reset({
        name: cycleToEdit.name,
        startDate: formatDateForInput(cycleToEdit.startDate),
        endDate: formatDateForInput(cycleToEdit.endDate),
        isActive: cycleToEdit.isActive,
        autoGenerateWindows: false, // not relevant when editing
      });
    } else if (!isOpen) {
      reset({
        name: "",
        startDate: "",
        endDate: "",
        isActive: true,
        autoGenerateWindows: true,
      });
    }
  }, [cycleToEdit, isOpen, reset]);

  const { mutate: createCycle, isPending: isCreating } = useCreateCycleMutation(
    { campaignId , setError, onClose }
  );

  const { mutate: updateCycle, isPending: isUpdating } = useUpdateCycleMutation(
    {
      campaignId,
      cycleId: cycleToEdit?.id ?? 0,
      setError,
      onClose,
    }
  );

  const isPending = isCreating || isUpdating;

  const onSubmit = (data: CycleFormData) => {
    if (isEditing) {
      updateCycle(data);
    } else {
      createCycle(data);
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
        {isEditing ? "Guardar Cambios" : "Crear Ciclo"}
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
      title={isEditing ? "Editar Ciclo" : "Nuevo Ciclo"}
      icon={isEditing ? <MdEdit /> : <MdSync />}
      footer={FooterActions}
      isDirty={isDirty}
    >
      <form className="space-y-5">
        <Input
          label="Nombre del ciclo"
          placeholder="Ej. Ciclo Enero 2025"
          error={errors.name}
          {...register("name")}
        />

        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Fecha de inicio"
            type="date"
            min={campaignMinDate}
            max={campaignMaxDate}
            value={currentStartDate}
            leftIcon={<MdCalendarMonth className="text-gray-400" />}
            error={errors.startDate}
            {...register("startDate")}
          />
          <Input
            label="Fecha de fin"
            type="date"
            min={currentStartDate || currentStartDate}
            max={campaignMaxDate}
            leftIcon={<MdCalendarMonth className="text-gray-400" />}
            error={errors.endDate}
            {...register("endDate")}
          />
        </div>

        <Switch
          label="Ciclo activo"
          description="Habilitar este ciclo de redención"
          checked={watch("isActive")}
          error={errors.isActive}
          {...register("isActive")}
        />

        {/* Auto-generate only shown on create */}
        {!isEditing && (
          <div className="p-5 bg-blue-50/50 border border-blue-100 rounded-xl space-y-4">
            <div className="flex items-start gap-3">
              <div className="bg-blue-100 p-2 rounded-lg text-primary shrink-0 mt-0.5">
                <MdAutoFixHigh className="text-xl" />
              </div>
              <div className="space-y-1">
                <h4 className="text-sm font-bold text-blue-900">
                  Generación automática de ventanas
                </h4>
                <p className="text-xs text-blue-800/70 leading-relaxed">
                  El sistema calculará y creará las ventanas de canje basándose
                  en las fechas del ciclo. Si lo dejas desactivado podrás
                  generarlas o crearlas manualmente después.
                </p>
              </div>
            </div>
            <div className="pt-1 border-t border-blue-100/50">
              <Switch
                label="Generar ventanas automáticamente"
                checked={watch("autoGenerateWindows")}
                {...register("autoGenerateWindows")}
              />
            </div>
          </div>
        )}
      </form>
    </Drawer>
  );
} 