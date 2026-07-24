import { useState, useEffect } from "react";
import { usePageBreadcrumbs } from "@/core/hooks/usePageBreadcrumbs";
import { useCampaignsQuery } from "@/feature/admin/services/campaignServices";
import { usePublicDistributorsQuery } from "@/feature/auth/services/authServices";
import { useAuthStore } from "@/core/stores/authStore";
import PageHeader from "@/core/components/common/PageHeader";

import {
  useAdoptionReport,
  useAdoptionByCompany,
} from "../services/sellerAdoptionServices";

// Components
import { AdoptionSkeleton } from "../components/seller-adoption/AdoptionSkeleton";
import { FunnelContent } from "../components/seller-adoption/FunnelContent";
import { SellerStatusListTab } from "../components/seller-adoption/SellerStatusListTab";
import type { SegmentKey } from "../components/seller-adoption/SellerListDrawer";
import type { AdoptionFilters } from "../api/sellerAdoptionApi";

type Tab = "funnel" | "lista";

export default function SellerAdoptionView() {
  usePageBreadcrumbs([{ label: "Adopción de Vendedores" }]);

  const user = useAuthStore((state) => state.user);
  const isAdmin = user?.role === "admin";

  const [activeTab, setActiveTab] = useState<Tab>("funnel");

  // ── Filtros del Funnel ────────────────────────────────────────
  const [selectedCampaignId, setSelectedCampaignId] = useState<string>("");
  const [selectedDistributorId, setSelectedDistributorId] = useState<string>("");
  const [dateFrom, setDateFrom] = useState<string>("");
  const [dateTo, setDateTo] = useState<string>("");
  const [openSegment, setOpenSegment] = useState<SegmentKey | null>(null);

  const { data: campaignsData } = useCampaignsQuery(1, 100, { enabled: isAdmin });
  const campaigns = campaignsData?.items ?? [];

  const { data: distributorsData } = usePublicDistributorsQuery();
  const distributors = distributorsData ?? [];

  useEffect(() => {
    if (!selectedCampaignId) {
      setDateFrom("");
      setDateTo("");
      return;
    }
    const selectedCampaign = campaigns.find((c) => String(c.id) === selectedCampaignId);
    if (selectedCampaign) {
      if (selectedCampaign.startDate) setDateFrom(selectedCampaign.startDate.split("T")[0]);
      if (selectedCampaign.endDate) setDateTo(selectedCampaign.endDate.split("T")[0]);
    }
  }, [selectedCampaignId, campaigns]);

  const filters: AdoptionFilters = {
    ...(selectedCampaignId ? { campaignId: Number(selectedCampaignId) } : {}),
    ...(selectedDistributorId ? { distributorId: Number(selectedDistributorId) } : {}),
    ...(dateFrom ? { dateFrom } : {}),
    ...(dateTo ? { dateTo } : {}),
  };

  const { data: report, isLoading, isError } = useAdoptionReport(filters);

  const { data: byCompany, isLoading: isLoadingByCompany } = useAdoptionByCompany({
    ...(selectedCampaignId ? { campaignId: Number(selectedCampaignId) } : {}),
    ...(dateFrom ? { dateFrom } : {}),
    ...(dateTo ? { dateTo } : {}),
  });

  const displayedByCompany = selectedDistributorId
    ? byCompany?.filter((c) => String(c.distributorId) === selectedDistributorId)
    : byCompany;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Adopción de Vendedores"
        subtitle="Analiza cuántos vendedores están usando activamente la plataforma."
      />

      {/* Tabs */}
      <div className="flex gap-1 bg-slate-100 p-1 rounded-xl w-fit">
        {([
          { key: "funnel", label: "Funnel de Adopción" },
          { key: "lista",  label: "Lista de Vendedores" },
        ] as { key: Tab; label: string }[]).map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-5 py-2 rounded-lg text-sm font-bold transition-all duration-200
              ${activeTab === tab.key
                ? "bg-white text-slate-900 shadow-sm"
                : "text-slate-500 hover:text-slate-700"}`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ── TAB: Funnel ── */}
      {activeTab === "funnel" && (
        <>
          {isLoading ? (
            <AdoptionSkeleton />
          ) : isError || !report ? (
            <div className="flex items-center justify-center py-32 text-slate-500">
              <p className="text-sm font-medium">Error al cargar el reporte de adopción.</p>
            </div>
          ) : (
            <FunnelContent
              report={report}
              isAdmin={isAdmin}
              campaigns={campaigns}
              distributors={distributors}
              selectedCampaignId={selectedCampaignId}
              setSelectedCampaignId={setSelectedCampaignId}
              selectedDistributorId={selectedDistributorId}
              setSelectedDistributorId={setSelectedDistributorId}
              dateFrom={dateFrom}
              setDateFrom={setDateFrom}
              dateTo={dateTo}
              setDateTo={setDateTo}
              openSegment={openSegment}
              setOpenSegment={setOpenSegment}
              displayedByCompany={displayedByCompany ?? []}
              isLoadingByCompany={isLoadingByCompany}
            />
          )}
        </>
      )}

      {/* ── TAB: Lista ── */}
      {activeTab === "lista" && <SellerStatusListTab />}
    </div>
  );
}
