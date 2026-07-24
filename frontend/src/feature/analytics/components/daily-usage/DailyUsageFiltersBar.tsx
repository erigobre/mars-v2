import { MdBusiness, MdPerson } from "react-icons/md";
import { Select } from "@/core/components/ui/Select";
import { usePublicDistributorsQuery } from "@/feature/auth/services/authServices";
import { ROLE_OPTIONS, type DailyUsageFilters, type DailyUsageRoleFilter } from "../../types/dailyUsageFilters";

interface DailyUsageFiltersProps {
  filters: DailyUsageFilters;
  onChange: (
    key: keyof DailyUsageFilters,
    value: string | number | undefined,
  ) => void;
}

export default function DailyUsageFiltersBar({
  filters,
  onChange,
}: DailyUsageFiltersProps) {
  const { data: distributorsData, isLoading: isLoadingDistributors } =
    usePublicDistributorsQuery();

  const distributors = distributorsData ?? [];

  const showDistributorFilter = !filters.role || filters.role === "seller";

  return (
    <section className="bg-white px-5 py-4 rounded-2xl border border-slate-100 shadow-sm flex flex-col sm:flex-row gap-4 items-center mb-6">

      {/* Role selector — always visible */}
      <div className="flex-1 min-w-0">
        <Select
          label="Rol de usuario"
          leftIcon={<MdPerson size={18} />}
          value={filters.role ?? ""}
          onChange={(e) => {
            const val = e.target.value as DailyUsageRoleFilter;
            onChange("role", val || undefined);
            // Clear distributor when switching away from seller
            if (val && val !== "seller") {
              onChange("distributorId", undefined);
            }
          }}
          options={ROLE_OPTIONS.map((o) => ({
            value: o.value,
            label: o.label,
          }))}
        />
      </div>

      {/* Distributor selector — only meaningful for sellers */}
      <div
        className={`flex-1 min-w-0 transition-opacity duration-200 ${
          showDistributorFilter
            ? "opacity-100"
            : "opacity-40 pointer-events-none"
        }`}
      >
        <Select
          label="Distribuidor"
          leftIcon={<MdBusiness size={18} />}
          value={filters.distributorId ?? ""}
          onChange={(e) => {
            const val = e.target.value;
            onChange("distributorId", val ? Number(val) : undefined);
            // Implicitly narrow to sellers when a distributor is chosen
            if (val && !filters.role) {
              onChange("role", "seller");
            }
          }}
          disabled={!showDistributorFilter || isLoadingDistributors}
          options={[
            {
              value: "",
              label: isLoadingDistributors
                ? "Cargando..."
                : "Todos los distribuidores",
            },
            ...distributors.map((d) => ({
              value: String(d.id),
              label: d.companyName || `Distribuidor #${d.id}`,
            })),
          ]}
        />
      </div>

      {(filters.role || filters.distributorId) && (
        <button
          onClick={() => {
            onChange("role", undefined);
            onChange("distributorId", undefined);
          }}
          className="h-10 px-4 rounded-xl text-xs font-bold text-slate-500 bg-slate-100 hover:bg-slate-200 transition-colors shrink-0 whitespace-nowrap"
        >
          Limpiar filtros
        </button>
      )}
    </section>
  );
}
