import { MdWbSunny, MdCalendarMonth, MdPause, MdEdit, MdPlayArrow, MdCheckCircle } from "react-icons/md";
import type { Campaign } from "../../schemas/campaign";
import { Button } from "@/core/components/ui";
import { formatDateTime } from "@/core/utils/formatDate";
import {
  useChangeCampaignStatusMutation,
  useCloseCampaignMutation,
} from "../../services/campaignServices";
import Swal from "sweetalert2";

type CampaignHeaderCardProps = {
  campaign: Campaign;
  onEdit: () => void;
};

export function CampaignHeaderCard({
  campaign,
  onEdit,
}: CampaignHeaderCardProps) {
  const status = campaign.status || "RUNNING";

  const { mutate: changeStatus, isPending: isChangingStatus } =
    useChangeCampaignStatusMutation();
  const { mutate: closeCampaign, isPending: isClosing } =
    useCloseCampaignMutation();

  const handleToggleStatus = () => {
    const newStatus = status === "RUNNING" ? "PAUSED" : "RUNNING";
    changeStatus({ id: campaign.id, status: newStatus });
  };

  const handleCloseCampaign = () => {
    Swal.fire({
      title: "¿Cerrar Campaña?",
      text: "Al cerrar la campaña se detendrán todas las acciones y podrás ver el ranking final. Esta acción no se puede deshacer.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      confirmButtonText: "Sí, cerrar campaña",
      cancelButtonText: "Cancelar",
    }).then((r) => {
      if (r.isConfirmed) closeCampaign(campaign.id);
    });
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6 flex flex-col items-start lg:flex-row lg:items-center justify-between gap-6">
      <div className="flex items-start gap-4">
        <div className="w-24 h-24 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
          <MdWbSunny className="text-primary text-4xl" />
        </div>

        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <h2 className="text-2xl font-bold text-slate-900">
              {campaign.name}
            </h2>
            <span
              className={`px-2.5 py-0.5 rounded-full text-xs font-bold border 
              ${
                status === "RUNNING"
                  ? "bg-green-100 text-green-700 border-green-200"
                  : status === "PAUSED"
                  ? "bg-amber-100 text-amber-700 border-amber-200"
                  : "bg-slate-100 text-slate-700 border-slate-200"
              }`}
            >
              {status === "RUNNING"
                ? "EN CURSO"
                : status === "PAUSED"
                ? "PAUSADA"
                : "COMPLETADA"}
            </span>
          </div>
          <div className="flex items-center gap-2 text-slate-500">
            <MdCalendarMonth className="text-sm" />
            <span className="text-sm font-medium">
              {formatDateTime(campaign.startDate)} -{" "}
              {formatDateTime(campaign.endDate)}
            </span>
          </div>
        </div>
      </div>

      <div className="flex flex-row lg:flex-col xl:flex-row gap-3 shrink-0">
        {status !== "COMPLETED" && (
          <Button
            onClick={handleToggleStatus}
            disabled={isChangingStatus}
            variant="ghost"
            className="rounded-md"
          >
            {status === "RUNNING" ? (
              <MdPause className="text-sm" />
            ) : (
              <MdPlayArrow className="text-sm" />
            )}
            {status === "RUNNING" ? "Pausar" : "Reanudar"}
          </Button>
        )}

        {status !== "COMPLETED" && (
          <Button
            onClick={handleCloseCampaign}
            disabled={isClosing}
            variant="danger"
            className="rounded-md"
          >
            <MdCheckCircle className="text-sm" />
            Cerrar Campaña
          </Button>
        )}
        <Button onClick={onEdit} variant="primary" className="rounded-md">
          <MdEdit className="text-sm" />
          Editar Campaña
        </Button>
      </div>
    </div>
  );
}
