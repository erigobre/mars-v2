import { useRewardTierPrices } from "../../../rewards/services/rewardServices";
import TierBadge from "@/feature/seller-tiers/components/TierBadge";
import { MdSettings } from "react-icons/md";
import { Button } from "@/core/components/ui";
import { useState } from "react";
import RewardTierPricingDrawer from "./RewardTierPricingDrawer";
import type { Reward } from "@/feature/rewards/schemas/reward";

interface Props {
  reward: Reward;
}

export default function RewardExpandedRow({ reward }: Props) {
  const { data: tierPrices, isLoading } = useRewardTierPrices(reward.id);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  return (
    <div className="p-4 bg-gray-50/50 border-b border-gray-200">
      <div className="flex justify-between items-center mb-4">
        <h4 className="text-sm font-bold text-gray-700">
          Precios Especiales por Rango
        </h4>
        <Button size="sm" variant="ghost" onClick={() => setIsDrawerOpen(true)}>
          <MdSettings className="mr-2" /> Gestionar Precios
        </Button>
      </div>

      {isLoading ? (
        <p className="text-xs text-gray-500">Cargando datos de rangos...</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          {tierPrices?.map((tp) => (
            <div
              key={tp.tier!.id}
              className="flex flex-col p-3 bg-white border border-gray-200 rounded-lg shadow-sm"
            >
              <div className="mb-2">
                <TierBadge
                  name={tp.tier?.name ?? "Rango sin nombre"}
                  color={tp.tier?.color}
                  icon={tp.tier?.icon}
                  size="sm"
                />
              </div>
              <span className="text-lg font-black text-primary">
                {tp.price.toLocaleString()}{" "}
                <span className="text-xs text-gray-500 font-normal">pts</span>
              </span>
              {tp.price !== reward.pointsRequired && (
                <span
                  className={`text-[10px] font-bold ${tp.price < reward.pointsRequired ? "text-emerald-500" : "text-red-500"}`}
                >
                  {tp.price < reward.pointsRequired
                    ? "Descuento aplicado"
                    : "Incremento aplicado"}
                </span>
              )}
            </div>
          ))}
        </div>
      )}

      <RewardTierPricingDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        reward={reward}
      />
    </div>
  );
}
