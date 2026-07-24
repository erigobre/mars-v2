import { MdBusiness, MdPerson } from "react-icons/md";
import Swal from "sweetalert2";
import { DataTable } from "@/core/components/ui/DataTable";
import type { DataTableColumn, PaginationMeta } from "@/core/types";
import type { Distributor } from "../../schemas/distributor";
import { useDeleteDistributorMutation } from "../../services/distributorServices";
import TableActionsMenu from "@/core/components/common/TableActionsMenu";

type DistributorsTableProps = {
  data: Distributor[];
  isLoading: boolean;
  isPlaceholderData: boolean;
  meta?: PaginationMeta;
  onPageChange: (page: number) => void;
  onPerPageChange: (perPage: number) => void;
  onEdit: (distributor: Distributor) => void;
  // onView: (distributor: Distributor) => void;
};

export default function DistributorsTable({
  data,
  isLoading,
  isPlaceholderData,
  meta,
  onPageChange,
  onPerPageChange,
  onEdit,
  // onView,
}: DistributorsTableProps) {
  const { mutate: deleteDistributor, isPending: isDeleting } =
    useDeleteDistributorMutation();

  const handleDeleteClick = (distributor: Distributor) => {
    Swal.fire({
      title: "¿Estás seguro?",
      text: `Vas a eliminar al distribuidor "${distributor.companyName}". Esta acción no se puede deshacer.`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#64748b",
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
      reverseButtons: true,
    }).then((result) => {
      if (result.isConfirmed) deleteDistributor(distributor.id);
    });
  };

  const columns: DataTableColumn<Distributor>[] = [
    {
      label: "Distribuidor",
      primary: true,
      render: (distributor) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary/10 overflow-hidden flex items-center justify-center shrink-0 border border-primary/20">
            {distributor.avatarThumbnail ? (
              <img
                src={distributor.avatarThumbnail}
                alt={distributor.username}
                className="w-full h-full object-cover"
              />
            ) : (
              <MdPerson className="text-primary text-xl" />
            )}
          </div>
          <div>
            <p className="font-bold text-gray-900">{distributor.username}</p>
            <p className="text-xs text-gray-400">{distributor.companyName}</p>
          </div>
        </div>
      ),
    },
    {
      label: "Empresa",
      mobileHidden: true,
      render: (distributor) => (
        <div className="flex items-center gap-2">
          <MdBusiness className="text-gray-400 shrink-0" />
          <span className="text-sm font-medium text-gray-700">
            {distributor.companyName}
          </span>
        </div>
      ),
    },
    {
      label: "Contacto",
      mobileHidden: true,
      render: (distributor) => (
        <div>
          <p className="text-sm text-gray-700">{distributor.email}</p>
          <p className="text-xs text-gray-400">{distributor.phone}</p>
        </div>
      ),
    },
    {
      label: "Vendedores",
      render: (distributor) => (
        <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-bold bg-blue-50 text-primary border border-blue-100 text-nowrap">
          {distributor.sellersCount ?? 0} vendedor
          {(distributor.sellersCount ?? 0) !== 1 ? "es" : ""}
        </span>
      ),
    },
    {
      label: "Estado",
      render: (distributor) =>
        distributor.isActive ? (
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
      render: (distributor) => (
        <div className="flex justify-end">
          <TableActionsMenu 
            // onView={() => onView(distributor)}
            onEdit={() => onEdit(distributor)}
            onDelete={() => handleDeleteClick(distributor)}
          />
        </div>
        // <div className="flex justify-end gap-2">
        //   <Button
        //     variant="ghost"
        //     className="w-9 h-9 p-0! flex items-center justify-center text-primary hover:bg-blue-50"
        //     onClick={() => onEdit(distributor)}
        //     title="Editar"
        //   >
        //     <MdEdit className="text-lg" />
        //   </Button>
        //   <Button
        //     variant="danger"
        //     className="w-9 h-9 p-0! flex items-center justify-center"
        //     onClick={() => handleDeleteClick(distributor)}
        //     title="Eliminar"
        //   >
        //     <MdDelete className="text-lg" />
        //   </Button>
        // </div>
      ),
    },
  ];

  return (
    <DataTable<Distributor>
      title="Distribuidores"
      titleIcon={<MdBusiness />}
      columns={columns}
      data={data}
      isLoading={isLoading || isDeleting}
      isPlaceholderData={isPlaceholderData}
      emptyMessage="No se encontraron distribuidores registrados."
      meta={meta}
      onPageChange={onPageChange}
      onPerPageChange={onPerPageChange}
      perPageOptions={[5, 10, 25, 50]}
    />
  );
}
