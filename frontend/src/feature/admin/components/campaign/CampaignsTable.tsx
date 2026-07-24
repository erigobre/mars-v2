import { MdCampaign, MdDelete, MdEdit, MdVisibility } from "react-icons/md";
import { useNavigate } from "react-router-dom";
import Swal from 'sweetalert2'
import { DataTable } from "@/core/components/ui/DataTable";
import { Button } from "@/core/components/ui";
import { formatDate } from "@/core/utils/formatDate";
import type { DataTableColumn } from "@/core/types";
import type { Campaign } from "../../schemas/campaign";
import { useDeleteCampaignMutation } from "../../services/campaignServices";

type Props = {
  data: Campaign[];
  isLoading: boolean;
  isPlaceholderData: boolean;
  meta?: any;
  onPageChange: (page: number) => void;
  onPerPageChange: (perPage: number) => void;
  onEdit: (campaign: Campaign) => void;
};

export default function CampaignsTable({ 
  data, 
  isLoading, 
  isPlaceholderData, 
  meta, 
  onPageChange, 
  onPerPageChange,
  onEdit 
}: Props) {
  const navigate = useNavigate();
  const { mutate: deleteCampaign, isPending: isDeleting } = useDeleteCampaignMutation();

  const handleDeleteClick = (campaign: Campaign) => {
    Swal.fire({
      title: "¿Estás seguro?",
      text: `Vas a eliminar la campaña "${campaign.name}". Esta acción no se puede deshacer.`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444", // Rojo danger
      cancelButtonColor: "#64748b", // Slate
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
      reverseButtons: true
    }).then((result) => {
      if (result.isConfirmed) {
        deleteCampaign(campaign.id);
      }
    });
  };

  const columns: DataTableColumn<Campaign>[] = [
    {
      label: "Nombre de la Campaña",
      primary: true,
      render: (campaign) => <span className="font-bold text-gray-900">{campaign.name}</span>,
    },
    {
      label: "Inicio",
      render: (campaign) => <span className="text-gray-600 text-sm">{formatDate(campaign.startDate)}</span>,
    },
    {
      label: "Fin",
      render: (campaign) => <span className="text-gray-600 text-sm">{formatDate(campaign.endDate)}</span>,
    },
    {
      label: "Estado",
      render: (campaign) => (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${
          campaign.isActive ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"
        }`}>
          {campaign.isActive ? "Activa" : "Inactiva"}
        </span>
      ),
    },
    {
      label: "Acciones",
      alignRight: true,
      render: (campaign) => (
        <div className="flex justify-end gap-2">
          <Button
            variant="ghost"
            className="text-gray-500 hover:text-primary hover:bg-blue-50 w-8 h-8 p-0! flex items-center justify-center"
            onClick={() => navigate(`${campaign.id}`)}
            title="Ver Detalles"
          >
            <MdVisibility className="text-lg" />
          </Button>

          <Button
            variant="ghost"
            className="text-primary hover:bg-blue-50 w-8 h-8 p-0! flex items-center justify-center"
            onClick={() => onEdit(campaign)}
            title="Editar"
          >
            <MdEdit className="text-lg" />
          </Button>

          <Button
            variant="danger"
            className="w-8 h-8 p-0! flex items-center justify-center"
            onClick={() => handleDeleteClick(campaign)}
            title="Eliminar"
          >
            <MdDelete className="text-lg" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <DataTable<Campaign>
      title="Historial de Campañas"
      titleIcon={<MdCampaign />}
      columns={columns}
      data={data}
      isLoading={isLoading || isDeleting}
      isPlaceholderData={isPlaceholderData}
      emptyMessage="No se encontraron campañas registradas."
      meta={meta}
      onPageChange={onPageChange}
      onPerPageChange={onPerPageChange}
      perPageOptions={[5, 10, 25, 50]}
    />
  );
}