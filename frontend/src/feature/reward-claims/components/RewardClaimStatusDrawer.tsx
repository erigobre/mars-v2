import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  MdSchedule,
  MdCheckCircle,
  MdCancel,
  MdEditNote,
  MdInfo,
  MdSave,
  MdLocalShipping,
  MdHomeWork,
} from "react-icons/md";
import { Drawer } from "@/core/components/ui/Drawer";
import { Button, Textarea } from "@/core/components/ui";
import {
  updateRewardClaimSchema,
  type RewardClaim,
  type UpdateRewardClaimData,
} from "../schema/rewardClaim";
import { useUpdateRewardClaimMutation } from "../services/rewardClaimServices";
import { useEffect } from "react";
import StatusOption from "./StatusOption";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  claim: RewardClaim | null;
}

export default function RewardClaimStatusDrawer({
  isOpen,
  onClose,
  claim,
}: Props) {
  const { mutate, isPending } = useUpdateRewardClaimMutation();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<UpdateRewardClaimData>({
    resolver: zodResolver(updateRewardClaimSchema),
  });

  const currentStatus = watch("status");

  useEffect(() => {
    if (claim) {
      reset({
        status: claim.status,
        notes: claim.notes || "",
        carrier: claim.carrier || "",
        trackingNumber: claim.trackingNumber || "",
      });
    }
  }, [claim, reset]);

  const onSubmit = (data: UpdateRewardClaimData) => {
    if (!claim) return;
    mutate({ id: claim.id, data }, { onSuccess: onClose });
  };

  return (
    <Drawer isOpen={isOpen} onClose={onClose} title="Editar Estatus de Canje">
      <div className="flex flex-col h-full">
        {/* Header informativo dentro del body */}
        <div className="mb-8">
          <p className="text-sm text-gray-500 font-medium">
            Actualizando solicitud
          </p>
          <h3 className="text-xl font-black text-gray-900">
            #REC-{claim?.id} - {claim?.reward.name}
          </h3>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="flex-1 space-y-8 pb-8">
          {/* Selector de Estatus */}
          <section>
            <label className="block text-sm font-black text-gray-700 uppercase tracking-widest mb-4">
              Estatus Actual
            </label>
            <div className="grid grid-cols-1 gap-3">
              {/* Opción: Pendiente */}
              <StatusOption
                icon={<MdSchedule className="text-xl" />}
                label="Pendiente"
                description="En espera de revisión"
                active={currentStatus === "pending"}
                onClick={() => setValue("status", "pending")}
                activeClass="border-orange-500 bg-orange-50/50"
                iconClass="bg-orange-100 text-orange-600"
              />

              {/* Opción: Aprobado / Confirmado */}
              <StatusOption
                icon={<MdCheckCircle className="text-xl" />}
                label="Aprobado"
                description="Confirmado para entrega"
                active={currentStatus === "approved"}
                onClick={() => setValue("status", "approved")}
                activeClass="border-emerald-500 bg-emerald-50/50"
                iconClass="bg-emerald-100 text-emerald-600"
              />

              <StatusOption
                icon={<MdLocalShipping className="text-xl" />}
                label="Enviado"
                description="El paquete está en tránsito"
                active={currentStatus === "shipped"}
                onClick={() => setValue("status", "shipped")}
                activeClass="border-blue-500 bg-blue-50/50"
                iconClass="bg-blue-100 text-blue-600"
              />

              <StatusOption
                icon={<MdHomeWork className="text-xl" />}
                label="Entregado"
                description="El usuario recibió el premio"
                active={currentStatus === "delivered"}
                onClick={() => setValue("status", "delivered")}
                activeClass="border-indigo-500 bg-indigo-50/50"
                iconClass="bg-indigo-100 text-indigo-600"
              />

              {/* Opción: Rechazado */}
              <StatusOption
                icon={<MdCancel className="text-xl" />}
                label="Rechazado"
                description="La solicitud no procede"
                active={currentStatus === "rejected"}
                onClick={() => setValue("status", "rejected")}
                activeClass="border-rose-500 bg-rose-50/50"
                iconClass="bg-rose-100 text-rose-600"
              />
            </div>
            {errors.status && (
              <p className="mt-2 text-xs text-rose-600 font-bold">
                {errors.status.message}
              </p>
            )}
          </section>

          {(currentStatus === "shipped" || currentStatus === "delivered") && (
            <section className="bg-blue-50/50 p-5 rounded-2xl border border-blue-100 space-y-4 animate-in fade-in slide-in-from-top-2">
              <h4 className="text-[10px] font-black text-blue-800 uppercase tracking-widest flex items-center gap-2">
                <MdLocalShipping className="text-sm" /> Datos de Paquetería
              </h4>
              <div className="flex flex-col gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Paquetería
                  </label>
                  <input
                    type="text"
                    placeholder="Ej. DHL, FedEx, Estafeta"
                    {...register("carrier")}
                    disabled={currentStatus === "delivered"}
                    className={`w-full px-3 py-2 text-sm rounded-xl border ${
                      errors.carrier
                        ? "border-rose-500 focus:ring-rose-200"
                        : "border-gray-200 focus:border-primary focus:ring-primary/20"
                    } focus:ring focus:outline-none`}
                  />
                  {errors.carrier && (
                    <p className="text-[10px] text-rose-600 font-bold mt-1">
                      {errors.carrier.message}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Guía de Rastreo
                  </label>
                  <input
                    type="text"
                    placeholder="Ej. 1Z9999999999999999"
                    {...register("trackingNumber")}
                    disabled={currentStatus === "delivered"}
                    className={`w-full px-3 py-2 text-sm rounded-xl border ${
                      errors.trackingNumber
                        ? "border-rose-500 focus:ring-rose-200"
                        : "border-gray-200 focus:border-primary focus:ring-primary/20"
                    } focus:ring focus:outline-none`}
                  />
                  {errors.trackingNumber && (
                    <p className="text-[10px] text-rose-600 font-bold mt-1">
                      {errors.trackingNumber.message}
                    </p>
                  )}
                </div>
              </div>
            </section>
          )}

          {/* Notas Internas */}
          <section className="space-y-3">
            <div className="flex justify-between items-end">
              <label
                className="block text-sm font-black text-gray-700 uppercase tracking-widest"
                htmlFor="notes"
              >
                Notas de Administración
              </label>
              {currentStatus === "rejected" && (
                <span className="text-[10px] uppercase font-black text-rose-500 flex items-center gap-1 animate-pulse">
                  <MdInfo className="text-xs" /> Obligatorio al rechazar
                </span>
              )}
            </div>
            <div className="relative">
              <Textarea
                id="notes"
                {...register("notes")}
                placeholder="Explica la decisión o añade detalles técnicos de seguimiento..."
                rows={5}
                className={`pr-10 ${
                  errors.notes ? "border-rose-500 ring-rose-50" : ""
                }`}
              />
              <MdEditNote className="absolute bottom-3 right-3 text-gray-400 text-xl" />
            </div>
            {errors.notes && (
              <p className="text-xs text-rose-600 font-bold">
                {errors.notes.message}
              </p>
            )}
          </section>

          {/* Audit Log / Info Adicional */}
          <section className="bg-blue-50 p-4 rounded-2xl border border-blue-100">
            <h4 className="text-[10px] font-black text-blue-800 uppercase tracking-widest mb-2">
              Registro de Auditoría
            </h4>
            <ul className="text-xs space-y-1 text-blue-600 font-medium">
              <li className="flex gap-2">
                <span className="opacity-70 italic text-[11px]">
                  Última actualización:{" "}
                  {claim?.updatedAt ? claim.updatedAt : "Sin cambios previos"}
                </span>
              </li>
            </ul>
          </section>

          {/* Footer del Formulario */}
          <div className="flex gap-3 pt-6">
            <Button
              type="button"
              variant="ghost"
              onClick={onClose}
              className="flex-1 font-bold"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isPending}
              className="flex-1 font-black uppercase tracking-widest text-xs shadow-lg shadow-primary/20 gap-2"
            >
              <MdSave className="text-lg" /> Actualizar Canje
            </Button>
          </div>
        </form>
      </div>
    </Drawer>
  );
}
