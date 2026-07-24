import { MdPeople, MdPerson, MdStars } from "react-icons/md";
import Swal from "sweetalert2";
import { DataTable } from "@/core/components/ui/DataTable";
import type { DataTableColumn, PaginationMeta } from "@/core/types";
import type { Seller } from "../schemas/seller";
import { useDeleteSellerMutation } from "../services/sellerServices";
import { useAuthStore } from "@/core/stores/authStore";
import TableActionsMenu from "@/core/components/common/TableActionsMenu";

type SellersTableProps = {
  data: Seller[];
  isLoading: boolean;
  isPlaceholderData: boolean;
  meta?: PaginationMeta;
  onPageChange: (page: number) => void;
  onPerPageChange: (perPage: number) => void;
  onEdit: (seller: Seller) => void;
  onView?: (seller: Seller) => void;
  onAssignSale?: (seller: Seller) => void;
};

export default function SellersTable({
  data,
  isLoading,
  isPlaceholderData,
  meta,
  onPageChange,
  onPerPageChange,
  onEdit,
  onView,
  onAssignSale
}: SellersTableProps) {
  const user = useAuthStore((state) => state.user);
  const isAdmin = user?.role === "admin";

  const { mutate: deleteSeller, isPending: isDeleting } =
    useDeleteSellerMutation();

  const handleDeleteClick = (seller: Seller) => {
    Swal.fire({
      title: "¿Estás seguro?",
      text: `Vas a eliminar al vendedor "${seller.username}". Esta acción no se puede deshacer.`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#64748b",
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
      reverseButtons: true,
    }).then((result) => {
      if (result.isConfirmed) deleteSeller(seller.id);
    });
  };

  const columns: DataTableColumn<Seller>[] = [
    {
      label: "Vendedor",
      primary: true,
      render: (seller) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-secondary/10 overflow-hidden flex items-center justify-center shrink-0 border border-secondary/20">
            {seller.avatarThumbnail ? (
              <img
                src={seller.avatarThumbnail}
                alt={seller.username}
                className="w-full h-full object-cover"
              />
            ) : (
              <MdPerson className="text-secondary text-xl" />
            )}
          </div>
          <div>
            <p className="font-bold text-gray-900">{seller.username}</p>
            <p className="text-xs text-gray-400 font-mono">
              {seller.employeeCode}
            </p>
          </div>
        </div>
      ),
    },
    {
      label: "Contacto",
      render: (seller) => (
        <div>
          <p className="text-sm text-gray-700">{seller.email}</p>
          <p className="text-xs text-gray-400">{seller.phone}</p>
        </div>
      ),
    },
    ...(isAdmin
      ? [
          {
            label: "Distribuidor",
            render: (seller: Seller) => (
              <span className="text-sm text-gray-600">
                {seller.distributor?.companyName ?? (
                  <span className="text-gray-300 italic">Sin asignar</span>
                )}
              </span>
            ),
          },
        ]
      : []),
    {
      label: "Puntos",
      render: (seller) => (
        <div className="flex items-center gap-1.5">
          <MdStars className="text-amber-400 text-base shrink-0" />
          <span className="font-bold text-sm text-gray-800">
            {seller.currentPoints.toLocaleString()}
          </span>
        </div>
      ),
    },
    {
      label: "Estado",
      render: (seller) =>
        seller.isActive ? (
          <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-bold bg-emerald-100 text-emerald-700 uppercase">
            Activo
          </span>
        ) : (
          <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-bold bg-gray-200 text-gray-600 uppercase">
            Inactivo
          </span>
        ),
    },
    {
      label: "Acciones",
      alignRight: true,
      render: (seller) => (
        // <div className="flex justify-end gap-2">
        //   <Button
        //     variant="ghost"
        //     className="w-9 h-9 p-0! flex items-center justify-center text-primary hover:bg-blue-50"
        //     onClick={() => onEdit(seller)}
        //     title="Editar"
        //   >
        //     <MdEdit className="text-lg" />
        //   </Button>
        //   <Button
        //     variant="danger"
        //     className="w-9 h-9 p-0! flex items-center justify-center"
        //     onClick={() => handleDeleteClick(seller)}
        //     title="Eliminar"
        //   >
        //     <MdDelete className="text-lg" />
        //   </Button>
        // </div>
        <div className="flex justify-end">
          <TableActionsMenu
            onView={onView ? () => onView(seller) : undefined}
            onEdit={() => onEdit(seller)}
            onDelete={() => handleDeleteClick(seller)}
            onAssignSale={onAssignSale ? () => onAssignSale(seller) : undefined}
          />
        </div>
      ),
    },
  ];

  return (
    <DataTable<Seller>
      title="Vendedores"
      titleIcon={<MdPeople />}
      columns={columns}
      data={data}
      isLoading={isLoading || isDeleting}
      isPlaceholderData={isPlaceholderData}
      emptyMessage="No se encontraron vendedores registrados."
      meta={meta}
      onPageChange={onPageChange}
      onPerPageChange={onPerPageChange}
      perPageOptions={[5, 10, 25, 50]}
    />
  );
}
