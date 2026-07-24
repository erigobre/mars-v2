import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { MdAddCircle, MdCalendarMonth, MdEdit, MdWindow } from "react-icons/md";
import { Drawer } from "@/core/components/ui/Drawer";
import { Button, Input } from "@/core/components/ui";
import {
  windowFormSchema,
  type RedemptionCycle,
  type RedemptionWindow,
  type WindowFormData,
} from "../../schemas/campaign";
import {
  useCreateWindowMutation,
  useUpdateWindowMutation,
} from "../../services/cycleServices";
import { toDatetimeLocal } from "@/core/utils/formatDate";

type WindowFormDrawerProps = {
  isOpen: boolean;
  onClose: () => void;
  campaignId: number;
  cycle?: RedemptionCycle;
  windowToEdit?: RedemptionWindow | null;
};

export default function WindowFormDrawer({
  isOpen,
  onClose,
  campaignId,
  cycle,
  windowToEdit,
}: WindowFormDrawerProps) {
  const isEditing = !!windowToEdit;
  const cycleId = cycle?.id ?? 0;
  const cycleName = cycle?.name ?? "";

  const cycleMinDate = toDatetimeLocal(cycle?.startDate);
  const cycleMaxDate = toDatetimeLocal(cycle?.endDate);

  const {
    register,
    handleSubmit,
    setError,
    reset,
    watch,
    formState: { errors, isDirty },
  } = useForm<WindowFormData>({
    resolver: zodResolver(windowFormSchema),
    mode: "onChange",
    defaultValues: { opensAt: "", closesAt: "" },
  });

  const currentOpensAt = watch("opensAt");

  useEffect(() => {
    if (windowToEdit && isOpen) {
      reset({
        opensAt: toDatetimeLocal(windowToEdit.opensAt),
        closesAt: toDatetimeLocal(windowToEdit.closesAt),
      });
    } else if (!isOpen) {
      reset({ opensAt: "", closesAt: "" });
    }
  }, [windowToEdit, isOpen, reset]);

  const { mutate: createWindow, isPending: isCreating } =
    useCreateWindowMutation({
      campaignId,
      cycleId,
      setError,
      onClose,
    });

  const { mutate: updateWindow, isPending: isUpdating } =
    useUpdateWindowMutation({
      campaignId,
      cycleId,
      windowId: windowToEdit?.id ?? 0,
      setError,
      onClose,
    });

  const isPending = isCreating || isUpdating;

  const onSubmit = (data: WindowFormData) => {
    if (isEditing) {
      updateWindow(data);
    } else {
      createWindow(data);
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
        {isEditing ? "Guardar Cambios" : "Crear Ventana"}
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
      title={isEditing ? "Editar Ventana" : "Nueva Ventana de Canje"}
      icon={isEditing ? <MdEdit /> : <MdAddCircle />}
      footer={FooterActions}
      isDirty={isDirty}
    >
      <form className="space-y-5">
        {cycleName && (
          <div className="flex items-center gap-2 px-4 py-3 bg-gray-50 rounded-xl border border-gray-100">
            <MdWindow className="text-primary shrink-0" />
            <div>
              <p className="text-xs text-gray-400 font-medium">Ciclo</p>
              <p className="text-sm font-bold text-gray-800">{cycleName}</p>
            </div>
          </div>
        )}

        <Input
          label="Fecha y hora de apertura"
          type="datetime-local"
          leftIcon={<MdCalendarMonth className="text-gray-400" />}
          error={errors.opensAt}
          min={cycleMinDate}
          max={cycleMaxDate}
          {...register("opensAt")}
        />

        <Input
          label="Fecha y hora de cierre"
          type="datetime-local"
          leftIcon={<MdCalendarMonth className="text-gray-400" />}
          error={errors.closesAt}
          min={currentOpensAt || cycleMinDate}
          max={cycleMaxDate}
          {...register("closesAt")}
        />
      </form>
    </Drawer>
  );
}
