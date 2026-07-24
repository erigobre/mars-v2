import { MdHistory, MdVisibility } from "react-icons/md";
import { DataTable } from "@/core/components/ui/DataTable";
import { Button } from "@/core/components/ui";
import type { DataTableColumn, PaginationMeta } from "@/core/types";
import { formatDate } from "@/core/utils/formatDate";
import type { RewardClaim } from "../schema/rewardClaim";
import { CLAIM_STATUS_CONFIG } from "../constants/claimStatusStyles";

type RewardClaimsTableProps = {
  data: RewardClaim[];
  isLoading: boolean;
  isPlaceholderData: boolean;
  meta?: PaginationMeta;
  onPageChange: (page: number) => void;
  onPerPageChange: (perPage: number) => void;
  onViewDetails: (claim: RewardClaim) => void;
};

export default function RewardClaimsTable({
  data,
  isLoading,
  isPlaceholderData,
  meta,
  onPageChange,
  onPerPageChange,
  onViewDetails,
}: RewardClaimsTableProps) {
  const columns: DataTableColumn<RewardClaim>[] = [
    {
      label: "ID / Premio",
      primary: true,
      render: (claim) => (
        <div>
          <p className="font-mono font-bold text-primary text-xs tracking-tight">
            #REC-{claim.id}
          </p>
          <p className="font-bold text-gray-900 leading-tight">
            {claim.reward.name}
          </p>
        </div>
      ),
    },
    {
      label: "Usuario",
      render: (claim) => (
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-linear-to-br from-gray-100 to-gray-200 border border-gray-200 flex items-center justify-center shrink-0 shadow-sm text-gray-600 font-bold">
            {claim.seller?.username?.charAt(0).toUpperCase() || "U"}
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-bold text-gray-900 leading-none">
              {claim.seller?.username || "Usuario"}
            </span>
            <span className="text-xs text-gray-400 mt-1">
              {claim.seller?.email || "Sin email"}
            </span>
          </div>
        </div>
      ),
    },
    {
      label: "Estatus",
      render: (claim) => {
        const config = CLAIM_STATUS_CONFIG[claim.status] || {
          container: "bg-gray-100 text-gray-600",
          dot: "bg-gray-400",
        };
        return (
          <span
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${config.container}`}
          >
            <span
              className={`w-1.5 h-1.5 rounded-full animate-pulse ${config.dot}`}
            />
            {claim.statusLabel}
          </span>
        );
      },
    },
    {
      label: "Fecha",
      mobileHidden: true,
      render: (claim) => (
        <span className="text-sm font-medium text-gray-500">
          {formatDate(claim.createdAt)}
        </span>
      ),
    },
    {
      label: "Puntos utilizados",
      alignRight: true,
      render: (claim) => (
        <span className="font-black text-gray-900 bg-gray-50 px-2 py-1 rounded-lg border border-gray-100">
          {claim.pointsSpent.toLocaleString()}
        </span>
      ),
    },
    {
      label: "Acciones",
      alignRight: true,
      render: (claim) => (
        <div className="flex justify-end gap-2">
          <Button
            variant="ghost"
            className="w-9 h-9 p-0! rounded-full text-primary hover:bg-primary/10 transition-colors"
            onClick={() => onViewDetails(claim)}
          >
            <MdVisibility className="text-xl" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <DataTable<RewardClaim>
      title="Canjes de Premios"
      titleIcon={<MdHistory />}
      columns={columns}
      data={data}
      isLoading={isLoading}
      isPlaceholderData={isPlaceholderData}
      emptyMessage="No hay canjes para mostrar."
      meta={meta}
      onPageChange={onPageChange}
      onPerPageChange={onPerPageChange}
    />
  );
}
