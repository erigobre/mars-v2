import {
  MdAccountBalanceWallet,
  MdTrendingUp,
  MdTrendingDown,
  MdInfoOutline,
} from "react-icons/md";
import BaseCard from "../BaseCard";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/core/components/ui/tooltip";
import { formatNumber } from "@/core/utils/formatDate";

type EconomyData = {
  totalPoints: number;
  status: string;
  trend?: {
    vsPreviousCampaign: number;
    direction: "up" | "down" | "stable";
  };
};

export default function DeudaCirculanteCard({ data }: { data: EconomyData }) {
  return (
    <BaseCard className="flex flex-col justify-between p-6">
      <div>
        <div className="flex items-start mb-1 justify-between">
          <div className="flex gap-1.5">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Deuda Circulante
            </span>
            <Tooltip>
              <TooltipTrigger asChild>
                <button className="outline-none">
                  <MdInfoOutline className="text-slate-400 hover:text-slate-600 cursor-help" />
                </button>
              </TooltipTrigger>
              <TooltipContent className="bg-slate-800 text-white border-slate-700">
                <p className="text-[10px]">
                  Suma total de puntos disponibles en las cuentas de los
                  vendedores que aún no han sido canjeados.
                </p>
              </TooltipContent>
            </Tooltip>
          </div>
          <MdAccountBalanceWallet className="text-amber-500 text-xl" />
        </div>
        <h3 className="text-3xl font-black text-slate-900 mt-2">
          {formatNumber(data.totalPoints)}{" "}
          <span className="text-lg font-bold">pts</span>
        </h3>
        <p className="text-sm text-slate-500 mt-1">Puntos por redimir</p>
      </div>

      {data.trend && (
        <div
          className={`mt-4 pt-4 border-t border-slate-50 flex items-center text-xs font-bold ${
            data.trend.direction === "up" ? "text-emerald-600" : "text-rose-600"
          }`}
        >
          {data.trend.direction === "up" ? (
            <MdTrendingUp className="mr-1" />
          ) : (
            <MdTrendingDown className="mr-1" />
          )}
          {data.trend.vsPreviousCampaign}% vs campaña anterior
        </div>
      )}
    </BaseCard>
  );
}
