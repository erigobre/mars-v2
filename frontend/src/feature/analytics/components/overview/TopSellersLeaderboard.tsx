import { useAuthStore } from "@/core/stores/authStore";
import { MdPersonOff } from "react-icons/md";
import { Link } from "react-router-dom";

type SellerRank = {
  sellerId: number;
  rank: number;
  sellerName: string;
  distributorName: string;
  totalPoints: number;
};

export default function TopSellersLeaderboard({
  data,
}: {
  data: SellerRank[];
}) {
  const user = useAuthStore((state) => state.user);
  const isEmpty = !data || data.length === 0;

  const getRankStyle = (rank: number) => {
    switch (rank) {
      case 1:
        return "bg-amber-400 text-white"; // Oro
      case 2:
        return "bg-slate-300 text-white"; // Plata
      case 3:
        return "bg-amber-700 text-white"; // Bronce
      default:
        return "bg-slate-100 text-slate-500";
    }
  };

  return (
    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <h3 className="font-bold text-slate-900">Top 5 Vendedores</h3>
        <span className="text-xs font-bold text-primary px-2 py-1 bg-primary/10 rounded-full">
          Global
        </span>
      </div>

      <div className="flex-1 space-y-5">
        <div className="flex-1 flex flex-col justify-center">
          {isEmpty ? (
            <div className="flex flex-col items-center justify-center text-slate-400 space-y-3 py-8">
              <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center">
                <MdPersonOff className="text-2xl opacity-30" />
              </div>
              <p className="text-xs text-center leading-relaxed">
                Aún no hay actividad registrada <br /> para generar el ranking.
              </p>
            </div>
          ) : (
            <div className="space-y-5">
              {data.map((seller) => (
                <div
                  key={seller.rank}
                  className="flex items-center justify-between group cursor-default"
                >
                  <div className="flex items-center space-x-3">
                    <div className="relative">
                      <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 font-bold border border-slate-200 uppercase">
                        {seller.sellerName.substring(0, 2)}
                      </div>
                      <div
                        className={`absolute -top-1 -right-1 w-5 h-5 text-[10px] font-bold flex items-center justify-center rounded-full border-2 border-white ${getRankStyle(
                          seller.rank
                        )}`}
                      >
                        {seller.rank}
                      </div>
                    </div>
                    <div>
                      <Link
                        to={`/${user?.role}/sellers/${seller.sellerId}`}
                        className="text-sm font-bold text-slate-900 group-hover:text-primary transition-colors">
                        {seller.sellerName}
                      </Link>
                      <Link
                        to={`/${user?.role}/distributors?search=${seller.distributorName}`}
                        className="text-[10px] text-slate-500 uppercase tracking-tight block hover:underline">
                        {seller.distributorName}
                      </Link>
                    </div>
                  </div>
                  <span className="text-sm font-black text-slate-900">
                    {seller.totalPoints.toLocaleString()}{" "}
                    <span className="text-[10px] text-slate-400">pts</span>
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* <button className="mt-8 text-sm font-bold text-primary hover:text-primary-container transition-all flex items-center justify-center space-x-1 group">
        <span>Ver ranking completo</span>
        <MdChevronRight className="text-lg group-hover:translate-x-1 transition-transform" />
      </button> */}
    </div>
  );
}
