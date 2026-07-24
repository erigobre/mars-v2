import { MdLock, MdTimelapse, MdRedeem } from "react-icons/md";
import StockBadge from "./StockBadge";
import type { Reward } from "@/feature/rewards/schemas/reward";
import { deriveStockStatus } from "../../utils/rewardMappers";

type RewardCardProps = {
  reward: Reward;
  isStoreOpen: boolean;
  userPoints: number;
  onRedeem: (reward: Reward) => void;
};

export default function RewardCard({
  reward,
  isStoreOpen,
  userPoints,
  onRedeem,
}: RewardCardProps) {
  const hasPoints = userPoints >= reward.pointsRequired;

  const isLimitReached =
    reward.maxGlobalClaims !== null &&
    reward.maxGlobalClaims !== undefined &&
    (reward.totalClaimed ?? 0) >= reward.maxGlobalClaims;

  const isSoldOut = !reward.isAvailable || reward.stock === 0 || isLimitReached;

  const canRedeem = hasPoints && !isSoldOut && isStoreOpen;

  const missingPoints = reward.pointsRequired - userPoints;

  const progress = Math.min((userPoints / reward.pointsRequired) * 100, 100);

  const stockStatus = deriveStockStatus(reward);

  return (
    <div className="h-full bg-linear-to-br from-theme-light-accent to-theme-light-primary rounded-3xl border-2 border-theme-light-accent shadow-sm overflow-hidden flex flex-col transition-all duration-200">
      <div className="flex gap-4 p-4 relative pt-16">
        {reward.isFeatured && (
          <div className="absolute top-0 right-0 bg-theme-secondary text-white text-lg md:text-xl font-extrabold px-5 py-2 rounded-bl-full rounded-tr-xl">
            DESTACADO
          </div>
        )}

        <div className="w-24 h-24 md:w-36 md:h-36 rounded-xl shrink-0 overflow-hidden relative flex items-center justify-center">
          {reward.image ? (
            <img
              src={reward.image}
              alt={reward.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <span className="text-4xl">🎁</span>
          )}
          {isSoldOut && (
            <div className="absolute inset-0 bg-black/10 flex items-center justify-center rounded-xl">
              <MdLock className="text-gray-500 text-3xl" />
            </div>
          )}
        </div>

        <div className="flex-1 flex flex-col justify-center gap-1.5 pt-1">
          <h3
            className={[
              "font-bold text-xl leading-tight",
              !isSoldOut ? "text-theme-text-dark" : "text-gray-500",
            ].join(" ")}
          >
            {reward.name}
          </h3>
          <p className="font-extrabold text-5xl flex items-baseline gap-1 text-theme-text-dark">
            {reward.pointsRequired.toLocaleString() ?? 0} pts
          </p>
          <StockBadge status={stockStatus} count={reward.stock} />
        </div>
      </div>

      <div className="px-4 pb-4 mt-auto">
        {canRedeem ? (
          <button
            onClick={() => onRedeem(reward)}
            className="w-full bg-theme-primary hover:bg-theme-primary/80 cursor-pointer text-white font-bold py-3 px-4 rounded-xl shadow-lg shadow-green-500/20 transition-all active:scale-95 flex items-center justify-center gap-2"
          >
            <MdRedeem className="text-xl" />
            CANJEAR AHORA
          </button>
        ) : (
          <div className="space-y-2.5">
            <div className="w-full bg-transparent text-theme-text-dark font-semibold py-4 px-4 rounded-full flex items-center justify-center gap-2 border-2 border-gray-200 cursor-not-allowed">
              {/* Prioridad de iconos y mensajes */}
              {!isStoreOpen ? (
                <MdLock />
              ) : isSoldOut ? (
                <MdLock />
              ) : (
                <MdTimelapse />
              )}

              <span className="text-sm uppercase text-center">
                {!isStoreOpen
                  ? "Aun no se pueden obtener premios"
                  : isSoldOut
                    ? "Agotado"
                    : `Te faltan ${missingPoints.toLocaleString()} pts`}
              </span>
            </div>

            {!isSoldOut && (
              <div className="w-full bg-transparent border-2 border-gray-200 rounded-full h-8">
                <div
                  className={`bg-theme-warning h-7 transition-all duration-500 
                    ${progress === 0 ? "border-none" : "border-r-2 border-gray-200"}
                    ${progress >= 100 ? "rounded-full border-none" : "rounded-l-full"}
                    `}
                  style={{ width: `${progress}%` }}
                />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
