// src/feature/analytics/components/GlobalAnalyticsFilters.tsx
import { MdBusiness, MdCampaign } from "react-icons/md";
import { Select } from "@/core/components/ui/Select"; // Asumiendo que exportas Select desde aquí
import { useAuthStore } from "@/core/stores/authStore";

// Ajusta estas importaciones a las rutas reales de tus servicios
import { useCampaignsQuery } from "@/feature/admin/services/campaignServices";
import { useDistributorsQuery } from "@/feature/admin/services/distributorServices";
import type { AnalyticsFilters } from "../types";

interface GlobalAnalyticsFiltersProps {
  filters: Partial<AnalyticsFilters>;
  setFilter: (key: keyof AnalyticsFilters, value: any) => void;
}

export default function GlobalAnalyticsFilters({
  filters,
  setFilter,
}: GlobalAnalyticsFiltersProps) {
  const user = useAuthStore((state) => state.user);
  const isAdmin = user?.role === "admin";

  const { data: campaignsData, isLoading: isCampaignsLoading } =
    useCampaignsQuery(1, 100, { enabled: isAdmin });
  const campaigns = campaignsData?.items ?? [];

  const { data: distributorsData, isLoading: isDistributorsLoading } =
    useDistributorsQuery(1, 100, {}, { enabled: isAdmin });
  const distributors = distributorsData?.items ?? [];

  if (!isAdmin) {
    return null;
  }

  const campaignOptions = [
    { value: "", label: "Todas las campañas" },
    ...campaigns.map((c) => ({
      value: String(c.id),
      label: c.name || `Campaña #${c.id}`,
    })),
  ];

  const distributorOptions = [
    { value: "", label: "Todos los distribuidores" },
    ...distributors.map((d) => ({
      value: String(d.id),
      label: d.companyName || `Distribuidor #${d.id}`,
    })),
  ];

  return (
    <section className="bg-white p-4 md:p-6 rounded-2xl shadow-sm border border-slate-100 mb-6 flex flex-col sm:flex-row gap-4">
      <div className="flex-1">
        <Select
          label="Filtrar por Distribuidor"
          leftIcon={<MdBusiness size={20} />}
          value={filters.distributorId || ""}
          onChange={(e) =>
            setFilter("distributorId", e.target.value || undefined)
          }
          options={distributorOptions}
          disabled={isDistributorsLoading}
        />
      </div>

      <div className="flex-1">
        <Select
          label="Filtrar por Campaña"
          leftIcon={<MdCampaign size={20} />}
          value={filters.campaignId || ""}
          onChange={(e) => setFilter("campaignId", e.target.value || undefined)}
          options={campaignOptions}
          disabled={isCampaignsLoading}
        />
      </div>
    </section>
  );
}
