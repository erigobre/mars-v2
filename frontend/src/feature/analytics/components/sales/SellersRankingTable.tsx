import { MdMoreVert, MdPeopleOutline } from "react-icons/md";
import type { z } from "zod";
import type { sellerComparisonSchema } from "../../schemas/salesAnalytics";

type SellerComparison = z.infer<typeof sellerComparisonSchema>;

export default function SellersRankingTable({
  data,
}: {
  data: SellerComparison[];
}) {
  const isEmpty = !data || data.length === 0;

  const maxPoints = Math.max(...data.map((d) => d.totalPoints), 1);

  return (
    <div className="col-span-12 lg:col-span-8 bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden flex flex-col">
      <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-extrabold text-slate-900 tracking-tight">
            Ranking de Vendedores
          </h2>
          <p className="text-sm text-slate-500">
            Basado en puntos acumulados del periodo
          </p>
        </div>
        <button className="text-primary hover:bg-blue-50 px-3 py-1.5 rounded-lg text-sm font-bold transition-colors">
          Ver reporte completo
        </button>
      </div>

      <div className="overflow-x-auto h-full">
        {isEmpty ? (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-400 py-16">
            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
              <MdPeopleOutline className="text-3xl opacity-40" />
            </div>
            <p className="text-sm text-center leading-relaxed font-medium">
              Aún no hay actividad registrada <br /> para generar el ranking en
              este periodo.
            </p>
          </div>
        ) : (
          <table className="w-full text-left">
            <thead className="bg-slate-50 text-slate-500 uppercase text-[11px] font-black tracking-widest border-b border-slate-100">
              <tr>
                <th className="px-6 py-4">Vendedor</th>
                <th className="px-6 py-4">Distribuidor</th>
                <th className="px-6 py-4">Puntos Totales</th>
                <th className="px-6 py-4">Cumplimiento</th>
                <th className="px-6 py-4 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {data.slice(0, 5).map((seller, index) => {
                const percentage = Math.round(
                  (seller.totalPoints / maxPoints) * 100
                );

                // Lógica de colores simulada para el estado visual
                const isTop = index === 0;
                const barColor = isTop ? "bg-amber-400" : "bg-primary";

                return (
                  <tr
                    key={seller.sellerId}
                    className="hover:bg-slate-50 transition-colors group"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-blue-100 text-primary flex items-center justify-center font-bold text-xs uppercase">
                          {seller.sellerName.substring(0, 2)}
                        </div>
                        <span className="font-bold text-slate-900 text-sm">
                          {seller.sellerName}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">
                      {seller.distributorName}
                    </td>
                    <td className="px-6 py-4 font-black text-sm text-slate-900">
                      {seller.totalPoints.toLocaleString()}{" "}
                      <span className="text-[10px] text-slate-400 font-medium">
                        pts
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="w-full max-w-30 flex items-center gap-3">
                        <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className={`h-full ${barColor} transition-all duration-500`}
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                        <span className="text-xs font-bold text-slate-700">
                          {percentage}%
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button className="text-slate-400 hover:text-primary transition-colors outline-none">
                        <MdMoreVert className="text-xl" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
