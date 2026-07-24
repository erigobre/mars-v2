import { MdBusiness } from "react-icons/md";
import type { ByCompanyItem } from "../../schemas/sellerAdoptionSchemas";
import { pct } from "./utils";

export function ByCompanyTable({ data }: { data: ByCompanyItem[] }) {
  return (
    <div className="bg-white border border-slate-100 rounded-2xl shadow-sm overflow-hidden">
      <div className="px-5 py-4 border-b border-slate-100 bg-slate-50/60">
        <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
          <MdBusiness className="text-primary text-base" />
          Desglose por Empresa
        </h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-slate-50 border-b border-slate-100">
            <tr>
              {["Empresa", "Total", "Iniciaron", "Aceptaron T&C", "Sin T&C", "Nunca", "Adopción"].map(
                (h) => (
                  <th
                    key={h}
                    className="px-4 py-3 text-[10px] font-black text-slate-500 uppercase tracking-widest"
                  >
                    {h}
                  </th>
                )
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {data.map((c) => {
              const adopRate = pct(c.acceptedTerms, c.totalSellers);
              return (
                <tr
                  key={c.distributorId}
                  className="hover:bg-slate-50/60 transition-colors"
                >
                  <td className="px-4 py-3">
                    <span className="text-sm font-bold text-slate-900 truncate block max-w-[140px]">
                      {c.distributorName}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm font-bold text-slate-700">
                    {c.totalSellers}
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-600">
                    {c.loggedInEver}
                    <span className="text-[10px] text-slate-400 ml-1">
                      ({pct(c.loggedInEver, c.totalSellers)}%)
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-sm font-bold text-emerald-600">
                      {c.acceptedTerms}
                    </span>
                    <span className="text-[10px] text-slate-400 ml-1">
                      ({pct(c.acceptedTerms, c.totalSellers)}%)
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-sm text-amber-600">
                      {c.loggedNoTerms}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-sm text-slate-400">
                      {c.neverLoggedIn}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full"
                          style={{
                            width: `${adopRate}%`,
                            backgroundColor:
                              adopRate >= 70
                                ? "#10B981"
                                : adopRate >= 40
                                ? "#F59E0B"
                                : "#EF4444",
                          }}
                        />
                      </div>
                      <span className="text-xs font-black text-slate-900">
                        {adopRate}%
                      </span>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
