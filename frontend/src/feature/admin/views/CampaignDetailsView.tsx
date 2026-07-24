import { Link, useParams } from "react-router-dom"; // Asumiendo que usas react-router
import { CampaignHeaderCard } from "../components/campaign/CampaignHeaderCard";
import { CampaignCyclesSection } from "../components/campaign/CampaignCyclesSection";
import { useCampaignDetailsQuery } from "../services/campaignServices";
import CampaignDetailsSkeleton from "../components/campaign/CampaignDetailsSkeleton";
import { useState } from "react";
import CampaignFormDrawer from "../components/campaign/CampaignFormDrawer";
import { usePageBreadcrumbs } from "@/core/hooks/usePageBreadcrumbs";

export default function CampaignDetailsView() {

  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  
  const { id } = useParams<{ id: string }>();

  const { 
    data: currentCampaign, 
    isLoading, 
    isError 
  } = useCampaignDetailsQuery(Number(id));

  const handleEditClick = () => {
    setIsDrawerOpen(true);
  }

  usePageBreadcrumbs([
    { label: "Campañas", to: "/admin/campaigns" },
    { label: currentCampaign?.name || "Cargando..." }
  ]);

  if (isLoading) {
    return <CampaignDetailsSkeleton />;
  }

  if (isError || !currentCampaign) {
    return (
      <div className="flex-1 flex items-center justify-center h-screen bg-slate-50">
        <div className="text-center space-y-4">
          <h2 className="text-2xl font-bold text-slate-800">Campaña no encontrada</h2>
          <p className="text-slate-500">Hubo un error al cargar los detalles o la campaña no existe.</p>
          <Link to="/admin/campaigns" className="text-primary hover:underline font-bold">
            Volver a Campañas
          </Link>
        </div>
      </div>
    );
  }
  

  return (
    <main className="flex-1 flex flex-col overflow-hidden h-screen bg-slate-50/50">

      <div className="flex-1 overflow-y-auto space-y-6">
        <CampaignHeaderCard
          campaign={currentCampaign}
          onEdit={handleEditClick}
        />

        <CampaignCyclesSection campaign={currentCampaign} />
      </div>

      <CampaignFormDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)} // Función para cerrarlo
        campaignToEdit={currentCampaign}
      />
    </main>
  );
}
