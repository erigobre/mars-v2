import { MdDelete, MdEdit, MdStar } from "react-icons/md";
import Swal from "sweetalert2";
import { DataTable } from "@/core/components/ui/DataTable";
import type { DataTableColumn, PaginationMeta } from "@/core/types";
import type { SellerTier } from "../schemas/sellerTier";
import { useDeleteSellerTierMutation } from "../services/sellerTierServices";
import { Button } from "@/core/components/ui";
import TierBadge from "./TierBadge";
import { Link } from "react-router-dom";

type SellerTiersTableProps = {
  data: SellerTier[];
  isLoading: boolean;
  isPlaceholderData: boolean;
  meta?: PaginationMeta;
  onPageChange: (page: number) => void;
  onPerPageChange: (perPage: number) => void;
  onEdit: (tier: SellerTier) => void;
};

export default function SellerTiersTable({
  data,
  isLoading,
  isPlaceholderData,
  meta,
  onPageChange,
  onPerPageChange,
  onEdit,
}: SellerTiersTableProps) {
  const { mutate: deleteTier, isPending: isDeleting } =
    useDeleteSellerTierMutation();

  const handleDeleteClick = (tier: SellerTier) => {
    Swal.fire({
      title: "¿Estás seguro?",
      text: `Eliminarás el rango "${tier.name}". Esta acción no se puede deshacer.`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#64748b",
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
      reverseButtons: true,
    }).then((result) => {
      if (result.isConfirmed) deleteTier(tier.id);
    });
  };

  const columns: DataTableColumn<SellerTier>[] = [
    {
      label: "Rango",
      primary: true,
      render: (tier) => (
        <div className="flex items-center gap-3">
          <TierBadge
            name={tier.name}
            color={tier.color}
            icon={tier.icon}
            showName={false}
          />
          <div>
            <p className="font-bold text-slate-900">{tier.name}</p>
            <p className="text-xs text-slate-400">/{tier.slug}</p>
          </div>
        </div>
      ),
    },
    {
      label: "Ventas Requeridas",
      render: (tier) => (
        <div className="text-sm">
          <span className="font-medium text-slate-700">
            ${tier.minAverageSales}
          </span>
          {tier.maxAverageSales ? (
            <span className="text-slate-500"> - ${tier.maxAverageSales}</span>
          ) : (
            <span className="text-slate-500"> o más</span>
          )}
        </div>
      ),
    },
    {
      label: "Tipo",
      render: (tier) => (
        <>
          <span className="flex flex-col gap-0.5 w-fit items-start px-2.5 py-1 rounded-lg text-xs font-bold bg-blue-50 text-theme-accent border border-blue-100">
            {tier.distributorId ? "Distribuidor" : "Global"}
            {tier.distributor && (
              <Link to={`/admin/distributors?search=${tier.distributor.companyName}`} className="text-[10px] mt-0.5 font-medium truncate max-w-30 hover:underline">
                {tier.distributor.companyName}
              </Link>
            )}
          </span>
        </>
      ),
    },
    {
      label: "Vendedores",
      render: (tier) => (
        <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-bold bg-blue-50 text-blue-700 border border-blue-100">
          {tier.sellersCount ?? 0}
        </span>
      ),
    },
    {
      label: "Estado",
      render: (tier) =>
        tier.isActive ? (
          <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-bold bg-emerald-100 text-emerald-700 uppercase">
            Activo
          </span>
        ) : (
          <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-bold bg-slate-200 text-slate-600 uppercase">
            Inactivo
          </span>
        ),
    },
    {
      label: "Acciones",
      alignRight: true,
      render: (tier) => (
        <div className="flex justify-end gap-2">
          <Button
            variant="ghost"
            className="w-9 h-9 p-0! flex items-center justify-center text-primary hover:bg-blue-50"
            onClick={() => onEdit(tier)}
            title="Editar"
          >
            <MdEdit className="text-lg" />
          </Button>
          <Button
            variant="danger"
            className="w-9 h-9 p-0! flex items-center justify-center"
            onClick={() => handleDeleteClick(tier)}
            title="Eliminar"
          >
            <MdDelete className="text-lg" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <DataTable<SellerTier>
      title="Rangos"
      titleIcon={<MdStar />}
      columns={columns}
      data={data}
      isLoading={isLoading || isDeleting}
      isPlaceholderData={isPlaceholderData}
      emptyMessage="No se encontraron rangos registrados."
      meta={meta}
      onPageChange={onPageChange}
      onPerPageChange={onPerPageChange}
      perPageOptions={[10, 25, 50]}
    />
  );
}
