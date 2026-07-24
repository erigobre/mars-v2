import { useParams, useNavigate } from "react-router-dom";
import {
  MdArrowBack,
  MdReceipt,
  MdPerson,
  MdCalendarToday,
  MdNotes,
  MdLabel,
  MdShoppingCart,
  MdInventory,
} from "react-icons/md";
import { Button } from "@/core/components/ui";
import { formatDate, formatCurrency } from "@/core/utils/formatDate";
import { useSaleDetailsQuery } from "../services/salesServices";
import PageHeader from "@/core/components/common/PageHeader";

export default function SaleDetailsView() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const saleId = Number(id);

  const { data: sale, isLoading } = useSaleDetailsQuery(saleId);

  if (isLoading) {
    return <LoadingSkeleton />;
  }

  if (!sale) {
    return (
      <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border border-gray-100 shadow-sm mt-6">
        <MdReceipt className="text-6xl text-gray-200 mb-4" />
        <p className="text-lg font-medium text-gray-900">
          No se encontró la venta
        </p>
        <p className="text-gray-500 mb-6 text-sm">
          El registro que buscas no existe o fue eliminado.
        </p>
        <Button onClick={() => navigate("/sales")} variant="primary">
          Volver a Ventas
        </Button>
      </div>
    );
  }

  const methodLabels: Record<string, { text: string; class: string }> = {
    manual: {
      text: "Manual",
      class: "bg-blue-50 text-blue-700 border-blue-200",
    },
    bulk: {
      text: "Lote",
      class: "bg-purple-50 text-purple-700 border-purple-200",
    },
    file: {
      text: "Archivo",
      class: "bg-emerald-50 text-emerald-700 border-emerald-200",
    },
  };
  const methodConfig =
    methodLabels[sale.uploadMethod || "manual"] || methodLabels.manual;

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Venta ${sale.folio}`}
        subtitle="Información detallada de la transacción"
      >
        <Button
          variant="ghost"
          onClick={() => navigate(-1)}
          className="bg-white hover:bg-gray-50 border border-gray-200 shadow-sm"
        >
          <MdArrowBack className="mr-2 text-lg" />
          Volver
        </Button>
      </PageHeader>

      <div className="bg-white border border-gray-200 shadow-sm rounded-2xl overflow-hidden">
        <div className="bg-linear-to-r from-slate-50 to-white px-6 py-5 border-b border-gray-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 mb-1">
                <h2 className="text-2xl font-black text-slate-900 tracking-tight">
                  {sale.folio}
                </h2>
                <span
                  className={`px-2.5 py-1 rounded-md text-xs font-bold border ${methodConfig.class} uppercase tracking-wider`}
                >
                  {methodConfig.text}
                </span>
              </div>
              <p className="text-sm text-slate-500 font-medium">
                Registrada el {formatDate(sale.createdAt)}
              </p>
            </div>
          </div>
        </div>

        <div className="p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          <InfoItem
            icon={<MdCalendarToday className="text-xl" />}
            label="Fecha de Venta"
            value={formatDate(sale.saleDate)}
          />

          {sale.seller && (
            <InfoItem
              icon={<MdPerson className="text-xl" />}
              label="Vendedor"
              value={
                <div className="flex flex-col">
                  <span className="font-bold text-slate-900">
                    {sale.seller.username}
                  </span>
                  <span className="text-xs text-slate-500 font-mono mt-0.5 bg-slate-100 px-1.5 py-0.5 rounded w-fit">
                    {sale.seller.employeeCode}
                  </span>
                </div>
              }
            />
          )}

          {sale.createdBy && (
            <InfoItem
              icon={<MdPerson className="text-xl" />}
              label="Registrado Por"
              value={sale.createdBy.username}
            />
          )}

          {sale.batchUuid && (
            <InfoItem
              icon={<MdLabel className="text-xl" />}
              label="ID de Lote (Batch)"
              value={
                <span className="font-mono text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded-md border border-slate-200 break-all">
                  {sale.batchUuid}
                </span>
              }
            />
          )}
        </div>

        {sale.notes && (
          <div className="px-6 pb-6">
            <div className="bg-amber-50/50 border border-amber-200/60 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center shrink-0 mt-0.5">
                  <MdNotes className="text-amber-600 text-lg" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-amber-900 mb-1">
                    Notas de la venta
                  </h4>
                  <p className="text-sm text-amber-800/90 leading-relaxed whitespace-pre-wrap">
                    {sale.notes}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <SummaryCard
          label="Total de Productos"
          value={sale.itemsCount?.toString() || "0"}
          icon={<MdShoppingCart />}
          color="blue"
        />
        <SummaryCard
          label="Monto Total"
          value={formatCurrency(sale.totalAmount)}
          icon={<MdReceipt />}
          color="emerald"
        />
        <SummaryCard
          label="Puntos Generados"
          value={`${sale.pointsEarned.toLocaleString()} pts`}
          icon={<MdLabel />}
          color="amber"
        />
      </div>

      <div className="bg-white border border-gray-200 shadow-sm rounded-2xl overflow-hidden">
        <div className="bg-slate-50 px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-slate-900">Productos</h3>
            <p className="text-sm text-slate-500 font-medium">
              {sale.items?.length || 0} artículo
              {(sale.items?.length || 0) !== 1 ? "s" : ""}
            </p>
          </div>
        </div>

        <div className="divide-y divide-gray-100">
          {sale.items?.map((item) => (
            <div
              key={item.id}
              className="p-6 hover:bg-slate-50/50 transition-colors"
            >
              <div className="flex flex-col md:flex-row items-start gap-5">
                <div className="w-12 h-12 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center shrink-0">
                  <MdInventory className="text-slate-400 text-2xl" />
                </div>

                <div className="flex-1 w-full">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
                    <div>
                      <h4 className="font-bold text-slate-900 text-base">
                        {item.productName}
                      </h4>
                      <p className="text-sm text-slate-500 font-mono mt-0.5">
                        SKU: {item.productSku}
                      </p>
                    </div>
                    {item.appliedRule && (
                      <span className="inline-flex items-center px-2.5 py-1 rounded-md bg-indigo-50 text-indigo-700 text-xs font-bold border border-indigo-100 w-fit">
                        Regla: {item.appliedRule}
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 rounded-xl bg-slate-50 border border-slate-100">
                    <div>
                      <p className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">
                        Cantidad
                      </p>
                      <p className="font-black text-slate-900 text-lg">
                        {item.quantity}
                      </p>
                    </div>
                    <div>
                      <p className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">
                        Precio Unitario
                      </p>
                      <p className="font-bold text-slate-900 text-lg">
                        {formatCurrency(item.unitPriceRef)}
                      </p>
                    </div>
                    <div>
                      <p className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">
                        Monto
                      </p>
                      <p className="font-bold text-slate-900 text-lg">
                        {formatCurrency(item.reportedAmount)}
                      </p>
                    </div>
                    <div className="flex items-center justify-end">
                      <div className="inline-flex flex-col items-end text-right">
                        <span className="text-sm font-black text-amber-600 leading-none">
                          {item.potentialPoints.toLocaleString()}
                        </span>
                        <span className="text-[9px] font-bold text-amber-400 uppercase">
                          Potenciales
                        </span>
                      </div>

                      <div className="text-2xl font-light text-amber-200 mx-2">
                        /
                      </div>

                      <div className="inline-flex flex-col items-start text-left">
                        <span className="text-sm font-black text-amber-600 leading-none">
                          {item.earnedPoints.toLocaleString()}
                        </span>
                        <span className="text-[9px] font-bold text-amber-400 uppercase">
                          Ganados
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}

          {(!sale.items || sale.items.length === 0) && (
            <div className="py-16 flex flex-col items-center justify-center">
              <div className="w-16 h-16 rounded-full bg-slate-50 flex items-center justify-center mb-3">
                <MdShoppingCart className="text-slate-300 text-3xl" />
              </div>
              <p className="text-slate-500 font-medium">
                No hay productos en esta venta
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function InfoItem({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="flex items-start gap-4">
      <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-primary shrink-0">
        {icon}
      </div>
      <div className="flex-1 min-w-0 pt-0.5">
        <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-1">
          {label}
        </p>
        {typeof value === "string" ? (
          <p className="font-bold text-slate-900">{value}</p>
        ) : (
          value
        )}
      </div>
    </div>
  );
}

function SummaryCard({
  label,
  value,
  icon,
  color,
}: {
  label: string;
  value: string;
  icon: React.ReactNode;
  color: "blue" | "emerald" | "amber";
}) {
  const colorClasses = {
    blue: "bg-blue-50/50 border-blue-100 text-blue-600",
    emerald: "bg-emerald-50/50 border-emerald-100 text-emerald-600",
    amber: "bg-amber-50/50 border-amber-100 text-amber-600",
  };

  const iconBgClasses = {
    blue: "bg-blue-100/50",
    emerald: "bg-emerald-100/50",
    amber: "bg-amber-100/50",
  };

  return (
    <div
      className={`border rounded-2xl p-6 shadow-sm ${colorClasses[color]} flex items-center gap-5`}
    >
      <div
        className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl shrink-0 ${iconBgClasses[color]}`}
      >
        {icon}
      </div>
      <div>
        <p className="text-xs font-bold uppercase tracking-wider opacity-80 mb-1">
          {label}
        </p>
        <p className="text-2xl font-black tracking-tight">{value}</p>
      </div>
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="space-y-6 animate-pulse mt-6">
      <div className="h-24 bg-slate-200 rounded-2xl" />
      <div className="h-64 bg-slate-200 rounded-2xl" />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="h-32 bg-slate-200 rounded-2xl" />
        <div className="h-32 bg-slate-200 rounded-2xl" />
        <div className="h-32 bg-slate-200 rounded-2xl" />
      </div>
      <div className="h-96 bg-slate-200 rounded-2xl" />
    </div>
  );
}
