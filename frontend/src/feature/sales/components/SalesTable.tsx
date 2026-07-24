import { useState } from "react";
import {
  MdChevronRight,
  MdReceipt,
  MdVisibility,
  MdExpandMore,
} from "react-icons/md";
import { DataTable } from "@/core/components/ui/DataTable";
import { Button } from "@/core/components/ui";
import { formatDate, formatCurrency } from "@/core/utils/formatDate";
import type { DataTableColumn, PaginationMeta } from "@/core/types";
import type { Sale } from "../schemas/sale";
import SaleExpandedRow from "./SaleExpandedRow";
import { Link } from "react-router-dom";
import { useAuthStore } from "@/core/stores/authStore";

type SalesTableProps = {
  data: Sale[];
  isLoading: boolean;
  isPlaceholderData: boolean;
  meta?: PaginationMeta;
  onPageChange: (page: number) => void;
  onPerPageChange: (perPage: number) => void;
  onViewDetails: (sale: Sale) => void;
};

export default function SalesTable({
  data,
  isLoading,
  isPlaceholderData,
  meta,
  onPageChange,
  onPerPageChange,
  onViewDetails,
}: SalesTableProps) {
  const user = useAuthStore((state) => state.user);
  const [expandedIds, setExpandedIds] = useState<Set<number>>(new Set());

  const toggleExpand = (id: number) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const columns: DataTableColumn<Sale>[] = [
    {
      label: "",
      render: (sale) => (
        <button
          onClick={() => toggleExpand(sale.id)}
          className={`p-1.5 rounded-lg transition-all ${
            expandedIds.has(sale.id)
              ? "bg-primary text-white rotate-90"
              : "bg-gray-100 text-gray-400 hover:bg-gray-200"
          }`}
        >
          <MdChevronRight className="text-lg" />
        </button>
      ),
    },
    {
      label: "Folio / Vendedor",
      primary: true,
      render: (sale) => (
        <div>
          <p className="font-mono font-bold text-primary text-xs">
            {sale.folio}
          </p>
          <Link to={`/${user?.role}/sellers/${sale.seller?.id}`} className="font-semibold text-gray-900 hover:underline">
            {sale.seller?.username || "Sin vendedor"}
          </Link>
          <p className="text-xs text-gray-400 font-mono">
            {sale.seller?.employeeCode}
          </p>
        </div>
      ),
    },
    {
      label: "Fecha",
      render: (sale) => (
        <span className="text-sm text-gray-600">
          {formatDate(sale.saleDate)}
        </span>
      ),
    },
    {
      label: "Monto Total",
      render: (sale) => (
        <span className="font-bold text-gray-900">
          {formatCurrency(sale.totalAmount)}
        </span>
      ),
    },
    {
      label: "Puntos",
      render: (sale) => (
        <div className="flex items-center gap-1.5">
          <span className="font-bold text-amber-600">
            {sale.pointsEarned.toLocaleString()}
          </span>
          <span className="text-xs text-gray-400">pts</span>
        </div>
      ),
    },
    {
      label: "Items",
      render: (sale) => (
        <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-bold bg-blue-50 text-primary border border-blue-100">
          {sale.itemsCount || 0} producto{sale.itemsCount !== 1 ? "s" : ""}
        </span>
      ),
    },
    {
      label: "Origen",
      mobileHidden: true,
      render: (sale) =>
        sale.uploadMethod === "csv" ? (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 text-purple-700 uppercase">
            <MdReceipt className="text-xs" />
            Archivo
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-green-100 text-green-700 uppercase">
            Manual
          </span>
        ),
    },
    {
      label: "Acciones",
      alignRight: true,
      render: (sale) => (
        <div className="flex justify-end gap-2">
          <Button
            variant="ghost"
            className="w-9 h-9 p-0! flex items-center justify-center text-gray-500 hover:text-primary hover:bg-blue-50"
            onClick={() => onViewDetails(sale)}
            title="Ver Detalles"
          >
            <MdVisibility className="text-lg" />
          </Button>
          <Button
            variant={expandedIds.has(sale.id) ? "primary" : "ghost"}
            className="w-8 h-8 p-0! flex items-center justify-center"
            onClick={() => toggleExpand(sale.id)}
          >
            <MdExpandMore
              className={`text-lg transition-transform duration-300 ${
                expandedIds.has(sale.id) ? "rotate-180" : ""
              }`}
            />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-0">
      <DataTable<Sale>
        title="Registro de Ventas"
        titleIcon={<MdReceipt />}
        columns={columns}
        data={data}
        isLoading={isLoading}
        isPlaceholderData={isPlaceholderData}
        emptyMessage="No se encontraron ventas registradas."
        meta={meta}
        onPageChange={onPageChange}
        onPerPageChange={onPerPageChange}
        perPageOptions={[10, 25, 50, 100]}
        renderExpandedRow={(sale) => 
          expandedIds.has(sale.id) ? (
            <SaleExpandedRow saleId={sale.id} folio={sale.folio} />
          ) : null
        }
      />
    </div>
  );
}
