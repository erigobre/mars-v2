import { DataTable } from "@/core/components/ui/DataTable";
import { useAuthStore } from "@/core/stores/authStore";
import type { DataTableColumn } from "@/core/types";
import { useNavigate } from "react-router-dom";

export interface BaseRecentClaim {
  id?: number | string;
  folio: string;
  userName: string;
  userAvatar?: string | null;
  userInitials: string;
  rewardName: string;
  rewardImage?: string | null;
  status: string;
  date: string;
}

interface RecentClaimsTableProps {
  claims?: BaseRecentClaim[];
}

type ClaimWithId = BaseRecentClaim & { id: number | string };

export default function RecentClaimsTable({ claims }: RecentClaimsTableProps) {
  const user = useAuthStore((state) => state.user);
  const navigate = useNavigate();

  const tableData: ClaimWithId[] =
    claims?.map((claim) => ({
      ...claim,
      id: claim.id || claim.folio,
    })) || [];

  const columns: DataTableColumn<ClaimWithId>[] = [
    {
      label: "ID Reclamo",
      primary: true,
      render: (claim) => (
        <span className="text-sm font-mono text-slate-600">#{claim.folio}</span>
      ),
    },
    {
      label: "Usuario",
      render: (claim) => (
        <div className="flex items-center">
          {claim.userAvatar ? (
            <img
              src={claim.userAvatar}
              alt="Avatar"
              className="w-6 h-6 rounded-full object-cover mr-2"
            />
          ) : (
            <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center text-[10px] font-bold text-blue-600 mr-2">
              {claim.userInitials}
            </div>
          )}
          <span className="text-xs font-semibold text-slate-900">
            {claim.userName}
          </span>
        </div>
      ),
    },
    {
      label: "Premio",
      render: (claim) => (
        <span className="text-xs text-slate-600">{claim.rewardName}</span>
      ),
    },
    {
      label: "Estado",
      render: (claim) => {
        const styles: Record<string, string> = {
          reserved: "bg-slate-100 text-slate-700",
          pending: "bg-orange-100 text-orange-700",
          approved: "bg-blue-100 text-blue-700",
          shipped: "bg-emerald-100 text-emerald-700",
          delivered: "bg-green-100 text-green-700",
          rejected: "bg-red-100 text-red-700",
          cancelled: "bg-slate-100 text-slate-700",
        };
        const labels: Record<string, string> = {
          reserved: "Reservado",
          pending: "Pendiente",
          approved: "Aprobado",
          shipped: "Enviado",
          delivered: "Entregado",
          rejected: "Rechazado",
          cancelled: "Cancelado",
        };

        const statusKey = claim.status.toLowerCase();

        return (
          <span
            className={`px-2 py-1 ${
              styles[statusKey] || styles.pending
            } text-[10px] font-bold rounded-full uppercase`}
          >
            {labels[statusKey] || "Desconocido"}
          </span>
        );
      },
    }
  ];

  return (
    <div className="col-span-12 lg:col-span-7 bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex flex-col h-full">
      <div className="flex justify-between items-center mb-6">
        <h3 className="font-bold text-slate-900">Últimos Canjes Registrados</h3>
        <button
          onClick={() => navigate(`/${user?.role}/reward-claims`)}
          className="px-4 py-2 bg-slate-100 text-slate-700 text-xs font-bold rounded-lg hover:bg-slate-200 transition-colors cursor-pointer"
        >
          Ir a Gestión de Canjes
        </button>
      </div>

      <div className="flex-1 overflow-x-auto">
        <DataTable<ClaimWithId>
          columns={columns}
          data={tableData}
          isLoading={false}
          emptyMessage="No hay canjes recientes para mostrar."
        />
      </div>
    </div>
  );
}
