import { DataTable } from "@/core/components/ui/DataTable";
import type { RecentClaim } from "../../schemas/distributorDashboardSchema";
import type { DataTableColumn } from "@/core/types";
import { MdCardGiftcard, MdHistory } from "react-icons/md";

const getStatusStyles = (status: string) => {
  switch (status) {
    case "pending":
      return {
        bg: "bg-yellow-100",
        text: "text-yellow-700",
        dot: "bg-yellow-600",
        label: "Pendiente",
      };
    case "approved":
      return {
        bg: "bg-emerald-50 border border-emerald-100",
        text: "text-emerald-600",
        dot: "bg-emerald-500",
        label: "Aprobado",
      };
    case "shipped":
      return {
        bg: "bg-blue-100",
        text: "text-blue-700",
        dot: "bg-blue-600",
        label: "En Camino",
      };
    case "delivered":
      return {
        bg: "bg-emerald-100",
        text: "text-emerald-700",
        dot: "bg-emerald-600",
        label: "Entregado",
      };
    case "rejected":
      return {
        bg: "bg-red-100",
        text: "text-red-700",
        dot: "bg-red-600",
        label: "Rechazado",
      };
    case "reserved":
    default:
      return {
        bg: "bg-slate-100",
        text: "text-slate-700",
        dot: "bg-slate-500",
        label: "Reservado",
      };
  }
};

interface RecentClaimsTableProps {
  claims: RecentClaim[];
}

export default function RecentClaimsTable({ claims }: RecentClaimsTableProps) {
  const columns: DataTableColumn<RecentClaim>[] = [
    {
      label: "Nombre del Empleado",
      primary: true,
      render: (claim) => (
        <div className="flex items-center gap-3">
          {claim.userAvatar ? (
            <img
              src={claim.userAvatar}
              alt="Avatar"
              className="w-10 h-10 rounded-lg object-cover"
            />
          ) : (
            <div className="w-10 h-10 rounded-lg bg-slate-200 flex items-center justify-center text-slate-500 font-bold text-xs uppercase">
              {claim.userInitials}
            </div>
          )}
          <div>
            <p className="text-sm font-bold text-slate-900">{claim.userName}</p>
            <p className="text-xs text-slate-500">Folio: {claim.folio}</p>
          </div>
        </div>
      ),
    },
    {
      label: "Premio Solicitado",
      render: (claim) => (
        <div className="flex items-center gap-2">
          <MdCardGiftcard className="text-slate-400 text-lg" />
          <span className="text-sm text-slate-700">{claim.rewardName}</span>
        </div>
      ),
    },
    {
      label: "Fecha",
      render: (claim) => (
        <span className="text-sm text-slate-600">{claim.date}</span>
      ),
    },
    {
      label: "Estado",
      render: (claim) => {
        const statusStyle = getStatusStyles(claim.status);
        return (
          <span
            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold ${statusStyle.bg} ${statusStyle.text}`}
          >
            <span
              className={`w-1.5 h-1.5 rounded-full ${statusStyle.dot}`}
            ></span>
            {statusStyle.label}
          </span>
        );
      },
    },
    {
      label: "Acciones",
      alignRight: true,
      render: () => (
        <button className="text-xs font-bold text-primary hover:underline">
          Ver Detalle
        </button>
      ),
    },
  ];

  return (
    <DataTable<RecentClaim>
      title="Historial de Premios del Equipo"
      titleIcon={<MdHistory />}
      columns={columns}
      data={claims}
      emptyMessage="No hay canjes recientes registrados."
    />
  );
}
