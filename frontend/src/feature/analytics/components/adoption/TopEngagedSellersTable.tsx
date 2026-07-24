import { MdInfoOutline, MdVisibility } from "react-icons/md";
import type { z } from "zod";
import type { sellerComparisonSchema } from "../../schemas/salesAnalytics";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/core/components/ui/tooltip";
import { useAuthStore } from "@/core/stores/authStore";
import { useNavigate } from "react-router-dom";

type Seller = z.infer<typeof sellerComparisonSchema>;

export default function TopEngagedSellersTable({ data }: { data: Seller[] }) {
  const user = useAuthStore(state => state.user);
  const canViewSeller = user?.role === 'admin' || user?.role === 'distributor';
  const navigate = useNavigate();

  const getBadgeStyle = (rank: number) => {
    switch (rank) {
      case 1:
        return "bg-amber-400 text-white";
      case 2:
        return "bg-slate-300 text-white";
      case 3:
        return "bg-orange-300 text-white";
      default:
        return "bg-slate-100 text-slate-500";
    }
  };

  const getAvatarStyle = (index: number) => {
    const styles = [
      "bg-blue-100 text-blue-600",
      "bg-emerald-100 text-emerald-600",
      "bg-purple-100 text-purple-600",
      "bg-orange-100 text-orange-600",
      "bg-slate-200 text-slate-600",
    ];
    return styles[index % styles.length];
  };

  return (
    <div className="col-span-12 bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex flex-col h-full overflow-hidden">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-2">
          <h3 className="font-bold text-slate-900">
            Ranking de Actividad y Puntos
          </h3>
          <Tooltip>
            <TooltipTrigger asChild>
              <button className="outline-none">
                <MdInfoOutline className="text-slate-400 hover:text-slate-600 cursor-help" />
              </button>
            </TooltipTrigger>
            <TooltipContent className="bg-slate-800 text-white border-slate-700 max-w-xs">
              <p className="text-[10px] leading-relaxed">
                Identifica a los "Heavy Users" del sistema. No solo considera
                quién vende más, sino quién interactúa más frecuentemente
                subiendo tickets, iniciando sesión y canjeando premios.
              </p>
            </TooltipContent>
          </Tooltip>
        </div>
        {/* <div className="flex space-x-2">
          <select className="text-xs border-slate-200 rounded-lg bg-slate-50 focus:ring-primary focus:border-primary px-3 py-1.5 outline-none font-medium text-slate-700">
            <option>Este Mes</option>
            <option>Esta Semana</option>
          </select>
          <button className="px-3 py-1.5 bg-slate-100 text-slate-700 text-xs font-bold rounded-lg hover:bg-slate-200 transition-colors">
            Ver Todos
          </button>
        </div> */}
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-slate-50 border-b border-slate-100">
            <tr>
              <th className="px-4 py-3 text-[10px] font-black text-slate-500 uppercase tracking-widest rounded-tl-lg">
                Rango
              </th>
              <th className="px-4 py-3 text-[10px] font-black text-slate-500 uppercase tracking-widest">
                Vendedor
              </th>
              <th className="px-4 py-3 text-[10px] font-black text-slate-500 uppercase tracking-widest">
                Distribuidor
              </th>
              <th className="px-4 py-3 text-[10px] font-black text-slate-500 uppercase tracking-widest text-right">
                Puntos Ganados
              </th>
              <th className="px-4 py-3 text-[10px] font-black text-slate-500 uppercase tracking-widest text-center rounded-tr-lg">
                Acción
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {data.slice(0, 5).map((seller, index) => (
              <tr
                key={seller.sellerId}
                className="hover:bg-slate-50/50 transition-colors group"
              >
                <td className="px-4 py-4">
                  <span
                    className={`w-6 h-6 rounded-full text-[10px] font-bold flex items-center justify-center ${getBadgeStyle(
                      seller.rank
                    )}`}
                  >
                    {seller.rank}
                  </span>
                </td>
                <td className="px-4 py-4">
                  <div className="flex items-center">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold mr-3 ${getAvatarStyle(
                        index
                      )}`}
                    >
                      {seller.sellerName.substring(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-slate-900 leading-none">
                        {seller.sellerName}
                      </p>
                      <p className="text-[10px] text-slate-400 mt-1">
                        Cod: {seller.employeeCode || "N/A"}
                      </p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-4">
                  <span className="text-xs font-bold text-slate-600">
                    {seller.distributorName}
                  </span>
                </td>
                <td className="px-4 py-4 text-xs font-black text-primary text-right">
                  {seller.totalPoints.toLocaleString()} pts
                </td>
                {canViewSeller && (
                  <td className="px-4 py-4 text-center">
                    <button onClick={() => navigate(`/${user?.role}/sellers/${seller.sellerId}`)} className="text-slate-400 hover:text-primary hover:bg-primary/5 p-1.5 rounded-lg transition-colors outline-none">
                      <MdVisibility className="text-lg" />
                    </button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
