import { MdDownload, MdFilterList, MdMoreVert, MdPerson } from "react-icons/md";
import type { DataTableColumn } from "@/core/types";
import DataTable from "@/core/components/ui/DataTable/DataTable";
import type { RewardClaim } from "../../../rewards/schemas/reward";
import { formatDateTime } from "@/core/utils/formatDate";

const STATUS_CONFIG: Record<
  RewardClaim["status"],
  { label: string; dot: string; badge: string }
> = {
  delivered: {
    label: "Entregado",
    dot: "bg-emerald-500",
    badge: "bg-emerald-100 text-emerald-700",
  },
  pending: {
    label: "Pendiente",
    dot: "bg-amber-500",
    badge: "bg-amber-100 text-amber-700",
  },
  cancelled: {
    label: "Cancelado",
    dot: "bg-red-500",
    badge: "bg-red-100 text-red-700",
  },
};

type RewardClaimsSectionProps = {
  claims: RewardClaim[];
  totalClaimsCount?: number;
};

export function RewardClaimsSection({
  claims,
  totalClaimsCount,
}: RewardClaimsSectionProps) {
  const columns: DataTableColumn<RewardClaim>[] = [
    {
      label: "Fecha",
      render: (claim) => (
        <span className="text-sm text-gray-600">
          {formatDateTime(claim.createdAt)}
        </span>
      ),
    },
    {
      label: "Vendedor",
      primary: true,
      render: (claim) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full overflow-hidden bg-primary/10 flex items-center justify-center shrink-0">
            {claim.sellerAvatar ? (
              <img
                src={claim.sellerAvatar}
                alt={claim.sellerName}
                className="w-full h-full object-cover"
              />
            ) : (
              <MdPerson className="text-primary text-lg" />
            )}
          </div>
          <span className="text-sm font-semibold text-gray-900">
            {claim.sellerName}
          </span>
        </div>
      ),
    },
    {
      label: "Distribuidor",
      mobileHidden: true,
      render: (claim) => (
        <span className="text-sm text-gray-600">
          {claim.distributorName ?? "—"}
        </span>
      ),
    },
    {
      label: "Estado",
      render: (claim) => {
        const cfg = STATUS_CONFIG[claim.status];
        return (
          <span
            className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold ${cfg.badge}`}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
            {cfg.label}
          </span>
        );
      },
    },
    {
      label: "Acciones",
      alignRight: true,
      render: () => (
        <button className="text-gray-400 hover:text-primary transition-colors">
          <MdMoreVert className="text-lg" />
        </button>
      ),
    },
  ];

  return (
    <section className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="p-5 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-gray-900">
            Historial de Canjes
          </h2>
          {totalClaimsCount !== undefined && (
            <p className="text-xs text-gray-400 mt-0.5">
              {totalClaimsCount.toLocaleString()} canjes en total
            </p>
          )}
        </div>
        <div className="flex gap-2">
          <button className="flex items-center gap-2 text-sm text-gray-600 px-3 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            <MdFilterList className="text-base" />
            Filtrar
          </button>
          <button className="flex items-center gap-2 text-sm text-gray-600 px-3 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            <MdDownload className="text-base" />
            Exportar
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="p-0 border-none shadow-none bg-transparent">
        <DataTable
          columns={columns}
          data={claims}
          emptyMessage="No hay canjes registrados para este premio."
        />
      </div>
    </section>
  );
}
