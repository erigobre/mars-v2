import { Drawer } from "@/core/components/ui/Drawer";
import { Button, Input } from "@/core/components/ui";
import { Switch } from "@/core/components/ui/Switch";
import { MdAddCircle, MdCalendarMonth, MdAutoFixHigh } from "react-icons/md";
import { campaignFormSchema, type Campaign, type CampaignFormData } from "../../schemas/campaign";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useCreateCampaingMutation, useUpdateCampaingMutation } from "../../services/campaignServices";
import { useEffect } from "react";

type CampaignFormDrawerProps = {
  isOpen: boolean;
  onClose: () => void;
  campaignToEdit?: Campaign | null;
};

export default function CampaignFormDrawer({
  isOpen,
  onClose,
  campaignToEdit,
}: CampaignFormDrawerProps) {

  const isEditing = !!campaignToEdit;

  const {
    register,
    handleSubmit,
    setError,
    reset,
    formState: { errors, isDirty },
  } = useForm<CampaignFormData>({
    resolver: zodResolver(campaignFormSchema),
    mode: "onChange",
    defaultValues: {
      name: "",
      startDate: "",
      endDate: "",
      isActive: true,
      autoGenerate: true,
    }
  });

  useEffect(() => {
    if (campaignToEdit && isOpen) {
      reset({
        name: campaignToEdit.name,
        startDate: campaignToEdit.startDate.split('T')[0], 
        endDate: campaignToEdit.endDate.split('T')[0],
        isActive: campaignToEdit.isActive,
        autoGenerate: false,
      });
    } else if (!isOpen) {
      reset({ name: "", startDate: "", endDate: "", isActive: true, autoGenerate: true });
    }
  }, [campaignToEdit, isOpen, reset]);

  const { mutate: createCampaign, isPending: isCreating } = useCreateCampaingMutation({setError, onClose});
  const { mutate: updateCampaign, isPending: isUpdating } = useUpdateCampaingMutation({ setError, onClose });

  const isPending = isCreating || isUpdating;

  const onSubmit = (data: CampaignFormData) => {
    if (isEditing) {
      updateCampaign({ id: campaignToEdit.id, formData: data });
    } else {
      createCampaign(data);
    }
  };

  const FooterActions = (
    <div className="flex flex-col gap-3">
      <Button
        variant="primary"
        size="lg"
        fullWidth
        className="shadow-lg shadow-primary/20"
        loading={isPending}
        onClick={handleSubmit(onSubmit)}
        type="submit"
      >
        Guardar y Continuar
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
      title="Nueva Campaña"
      icon={<MdAddCircle />}
      footer={FooterActions}
      isDirty={isDirty}
    >
      <form className="space-y-6">
        <Input
          label="Nombre de la Campaña"
          placeholder="Ej. Campaña Navideña 2024"
          type="text"
          error={errors.name}
          {...register("name")}
        />

        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Fecha de Inicio"
            type="date"
            leftIcon={<MdCalendarMonth className="text-gray-400" />}
            error={errors.startDate}
            {...register("startDate")}
          />
          <Input
            label="Fecha de Fin"
            type="date"
            leftIcon={<MdCalendarMonth className="text-gray-400" />}
            error={errors.endDate}
            {...register("endDate")}
          />
        </div>

        <Switch
          label="Estado"
          description="Activar campaña inmediatamente al crear"
          error={errors.isActive}
          {...register("isActive")}
        />

        {!isEditing && (
          <div className="p-6 bg-blue-50/50 border border-blue-100 rounded-xl space-y-4">
            <div className="flex items-start gap-3">
              <div className="bg-blue-100 p-2 rounded-lg text-primary shrink-0 mt-1">
                <MdAutoFixHigh className="text-xl" />
              </div>
              <div className="space-y-1">
                <h4 className="text-sm font-bold text-blue-900">Magia</h4>
                <p className="text-xs text-blue-800/70 leading-relaxed">
                  Si marcas esta opción, el sistema calculará y creará los ciclos
                  y ventanas basándose en las fechas de la campaña. Si la dejas
                  desmarcada, podrás configurarlos manualmente más tarde.
                </p>
              </div>
            </div>

            <div className="pt-2 border-t border-blue-100/50">
              <Switch
                label="Generar ciclos automáticamente"
                defaultChecked={true}
                {...register("autoGenerate")}
              />
            </div>
          </div>
        )}
      </form>
    </Drawer>
  );
}
