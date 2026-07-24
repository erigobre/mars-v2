import { MdInfoOutline, MdCardGiftcard } from "react-icons/md";
import { formatNumber } from "@/core/utils/formatDate";
import type { TopReward } from "../../schemas/rewardAnalytics";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/core/components/ui/tooltip";
import { Link } from "react-router-dom";
import { useAuthStore } from "@/core/stores/authStore";

export default function TopRewardsList({ data }: { data: TopReward[] }) {
  const user = useAuthStore((state) => state.user);
  const canViewRewards = user?.role === "admin" || user?.role === "distributor";

  const badgeStyles = [
    "bg-primary text-white",
    "bg-slate-400 text-white",
    "bg-orange-400 text-white",
    "bg-slate-200 text-slate-600",
  ];

  const isEmpty = !data || data.length === 0;

  return (
    <div className="col-span-12 lg:col-span-4 bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex flex-col h-full min-h-87.5">
      <div className="flex items-center gap-2 mb-6">
        <h3 className="font-bold text-slate-900">Top Recompensas</h3>
        <Tooltip>
          <TooltipTrigger asChild>
            <button className="outline-none">
              <MdInfoOutline className="text-slate-400 hover:text-slate-600 cursor-help" />
            </button>
          </TooltipTrigger>
          <TooltipContent className="bg-slate-800 text-white border-slate-700">
            <p className="text-[10px]">
              Los premios más populares basados en la cantidad de reclamos
              procesados.
            </p>
          </TooltipContent>
        </Tooltip>
      </div>

      {isEmpty ? (
        <div className="flex-1 flex flex-col items-center justify-center text-slate-400">
          <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
            <MdCardGiftcard className="text-3xl opacity-40" />
          </div>
          <p className="text-sm text-center font-medium leading-relaxed">
            Aún no hay reclamos de premios <br /> registrados en este periodo.
          </p>
        </div>
      ) : (
        <>
          <div className="space-y-6 flex-1">
            {data.slice(0, 4).map((reward, index) => (
              <div key={reward.rewardId || index} className="flex items-center">
                <div className="relative shrink-0">
                  <div className="w-12 h-12 rounded-lg bg-slate-100 flex items-center justify-center font-bold text-slate-400">
                    {reward.name.substring(0, 2).toUpperCase()}
                  </div>
                  <span
                    className={`absolute -top-2 -left-2 text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full ${
                      badgeStyles[index] || badgeStyles[3]
                    }`}
                  >
                    {index + 1}
                  </span>
                </div>

                <div className="ml-4 flex-1 min-w-0">
                  <p
                    className="text-sm font-bold text-slate-900 leading-none truncate"
                    title={reward.name}
                  >
                    {reward.name}
                  </p>
                  <p className="text-xs text-slate-500 mt-1 truncate">
                    {formatNumber(reward.claimCount)} reclamos este mes
                  </p>
                </div>

                <div className="text-right shrink-0 ml-2">
                  <p className="text-xs font-bold text-emerald-600">
                    {formatNumber(reward.pointsRequired)} pts
                  </p>
                </div>
              </div>
            ))}
          </div>

          {canViewRewards && (
          <Link to={`/${user?.role}/rewards`}
            className="mt-6 w-full py-2 bg-slate-50 text-center hover:bg-slate-100 text-slate-700 text-xs font-bold rounded-lg transition-colors border border-slate-200 outline-none focus:ring-2 focus:ring-primary/20">
            Ver Catálogo Completo
          </Link>
          )}
        </>
      )}
    </div>
  );
}
