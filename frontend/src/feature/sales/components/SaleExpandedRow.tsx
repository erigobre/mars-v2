import { formatCurrency } from "@/core/utils/formatDate";
import { useSaleDetailsQuery } from "../services/salesServices";
import { MdInventory2, MdLocalOffer, MdStar } from "react-icons/md";

export default function SaleExpandedRow({
  saleId,
  folio,
}: {
  saleId: number;
  folio: string;
}) {
  const { data: sale, isLoading } = useSaleDetailsQuery(saleId);

  if (isLoading) {
    return (
      <div className="p-6 bg-gray-100 border-x border-b border-gray-100 rounded-b-2xl animate-pulse">
        <div className="h-3 w-32 bg-gray-200 rounded mb-4" />
        <div className="space-y-3">
          {[1, 2].map((i) => (
            <div
              key={i}
              className="h-12 bg-white border border-gray-100 rounded-xl"
            />
          ))}
        </div>
      </div>
    );
  }

  if (!sale || !sale.items || sale.items.length === 0) {
    return (
      <div className="p-6 text-center bg-gray-100 border-x border-b border-gray-100 rounded-b-2xl">
        <p className="text-sm text-gray-400 italic">
          No hay productos registrados para esta venta.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-gray-100 border-x border-b border-gray-100 rounded-b-2xl p-4 md:p-6 animate-in slide-in-from-top-2 duration-300">
      <div className="flex items-center gap-2 mb-4 px-1">
        <div className="w-1.5 h-4 bg-primary rounded-full" />
        <h4 className="text-[11px] font-black text-gray-500 uppercase tracking-widest">
          Desglose de Productos <span className="text-gray-300 mx-1">•</span>{" "}
          Folio {folio}
        </h4>
      </div>

      <div className="md:hidden space-y-3">
        {sale.items.map((item) => (
          <div
            key={item.id}
            className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm active:scale-[0.98] transition-transform"
          >
            <div className="flex justify-between items-start gap-4 mb-3">
              <div className="min-w-0">
                <p className="font-bold text-gray-900 text-sm truncate leading-tight">
                  {item.productName}
                </p>
                <p className="text-[10px] font-mono text-gray-400 mt-0.5">
                  SKU: {item.productSku}
                </p>
              </div>
              <div className="bg-amber-50 text-amber-700 px-2 py-1 rounded-lg flex items-center gap-1 shrink-0">
                <MdStar className="text-xs" />
                <span className="text-xs font-bold">
                  {item.potentialPoints}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between border-t border-gray-50 pt-3 text-xs">
              <div className="flex flex-col">
                <span className="text-gray-400 font-medium">Cantidad</span>
                <span className="text-gray-700 font-bold">
                  {item.quantity.toLocaleString()} un.
                </span>
              </div>
              <div className="flex flex-col text-right">
                <span className="text-gray-400 font-medium">Subtotal</span>
                <span className="text-gray-900 font-bold">
                  {formatCurrency(item.reportedAmount)}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="hidden md:block bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50/50 border-b border-gray-100">
              <th className="text-left py-4 px-6 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                <div className="flex items-center gap-2">
                  <MdInventory2 className="text-sm" /> Producto
                </div>
              </th>
              <th className="text-right py-4 px-6 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                Cantidad
              </th>
              <th className="text-right py-4 px-6 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                <div className="flex items-center justify-end gap-2">
                  <MdLocalOffer className="text-sm" /> Monto
                </div>
              </th>
              <th className="text-right py-4 px-6 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                <div className="flex items-center justify-end gap-2">
                  <MdStar className="text-sm" /> Puntos
                </div>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {sale.items.map((item) => (
              <tr
                key={item.id}
                className="hover:bg-blue-50/30 transition-colors"
              >
                <td className="py-4 px-6">
                  <p className="font-bold text-gray-800 text-sm leading-none">
                    {item.productName}
                  </p>
                  <p className="text-[10px] text-gray-400 font-mono mt-1.5 bg-gray-50 inline-block px-1.5 py-0.5 rounded uppercase tracking-tighter border border-gray-100">
                    SKU: {item.productSku}
                  </p>
                </td>
                <td className="py-4 px-6 text-right">
                  <span className="text-sm font-semibold text-gray-600 bg-gray-50 px-2 py-1 rounded-md">
                    {item.quantity.toLocaleString()}
                  </span>
                </td>
                <td className="py-4 px-6 text-right font-bold text-gray-900 text-sm">
                  {formatCurrency(item.reportedAmount)}
                </td>
                <td className="py-4 px-6">
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
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
