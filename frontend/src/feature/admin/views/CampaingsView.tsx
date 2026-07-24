import { useState } from "react";
import PageHeader from "@/core/components/common/PageHeader";
import { Button } from "@/core/components/ui";
import { MdAdd } from "react-icons/md";
import { useCampaignsQuery } from "../services/campaignServices";
import type { Campaign } from "../schemas/campaign";
import CampaignFormDrawer from "../components/campaign/CampaignFormDrawer";
import CampaignsTable from "../components/campaign/CampaignsTable";
import { usePageBreadcrumbs } from "@/core/hooks/usePageBreadcrumbs";

export default function CampaingsView() {
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(
    null
  );

  usePageBreadcrumbs([{ label: "Campañas" }]);

  const {
    data: paginatedData,
    isLoading,
    isPlaceholderData,
  } = useCampaignsQuery(page, perPage);

  const handleEdit = (campaign: Campaign) => {
    setSelectedCampaign(campaign);
    setIsDrawerOpen(true);
  };

  return (
    <div>
      <PageHeader
        title="Campañas"
        subtitle="Gestiona las campañas, periodos de redención y ciclos activos."
      >
        <Button
          variant="secondary"
          onClick={() => {
            setSelectedCampaign(null);
            setIsDrawerOpen(true);
          }}
          leftIcon={<MdAdd className="text-xl" />}
          className="shadow-sm rounded-md"
        >
          Crear Nueva Campaña
        </Button>
      </PageHeader>

      <CampaignsTable
        data={paginatedData?.items ?? []}
        isLoading={isLoading}
        isPlaceholderData={isPlaceholderData}
        meta={paginatedData?.meta}
        onPageChange={setPage}
        onPerPageChange={(newPerPage) => {
          setPerPage(newPerPage);
          setPage(1);
        }}
        onEdit={handleEdit}
      />

      <CampaignFormDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        campaignToEdit={selectedCampaign}
      />
    </div>
  );
}
