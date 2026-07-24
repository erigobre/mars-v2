import { MdCardGiftcard, MdEdit, MdPauseCircle } from "react-icons/md";
import type { Reward } from "../../../rewards/schemas/reward";
import { Button } from "@/core/components/ui";

type RewardHeaderCardProps = {
  reward: Reward;
  onEdit: () => void;
  onTogglePause: () => void;
};

export function RewardHeaderCard({
  reward,
  onEdit,
  onTogglePause,
}: RewardHeaderCardProps) {
  return (
    <section className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="flex flex-col md:flex-row p-6 gap-8">
        {/* Image */}
        <div className="w-full md:w-48 h-48 bg-gray-100 rounded-xl overflow-hidden shrink-0 border border-gray-200 flex items-center justify-center">
          {reward.image ? (
            <img
              src={reward.image}
              alt={reward.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <MdCardGiftcard className="text-gray-300 text-6xl" />
          )}
        </div>

        {/* Info */}
        <div className="flex flex-1 flex-col justify-between py-1">
          <div>
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3">
              <div>
                {reward.category && (
                  <p className="text-primary font-bold text-xs tracking-wider uppercase mb-1">
                    {reward.category}
                  </p>
                )}
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
                  {reward.name}
                </h1>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                {reward.isActive ? (
                  <span className="px-3 py-1 bg-emerald-100 text-emerald-700 text-xs font-bold rounded-full border border-emerald-200 uppercase">
                    Activo
                  </span>
                ) : (
                  <span className="px-3 py-1 bg-gray-100 text-gray-600 text-xs font-bold rounded-full border border-gray-200 uppercase">
                    Inactivo
                  </span>
                )}
                {reward.isFeatured && (
                  <span className="px-3 py-1 bg-amber-100 text-amber-600 text-xs font-bold rounded-full border border-amber-200 uppercase">
                    Destacado
                  </span>
                )}
                {reward.visibility === "campaign_end" && (
                  <span className="px-3 py-1 bg-amber-100 text-amber-700 text-xs font-bold rounded-full border border-amber-200 uppercase">
                    Solo disponible al final de la campaña
                  </span>
                )}
              </div>
            </div>

            {reward.description && (
              <p className="mt-3 text-sm text-gray-500 leading-relaxed max-w-lg">
                {reward.description}
              </p>
            )}

            <div className="mt-5 grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="flex flex-col">
                <span className="text-gray-400 text-xs font-medium uppercase tracking-wide">
                  Puntos requeridos
                </span>
                <span className="text-xl font-bold text-primary mt-0.5">
                  {reward.pointsRequired.toLocaleString()} pts
                </span>
              </div>
              <div className="flex flex-col">
                <span className="text-gray-400 text-xs font-medium uppercase tracking-wide">
                  Stock restante
                </span>
                <span
                  className={`text-xl font-bold mt-0.5 ${
                    (reward.stock ?? 0) === 0 ? "text-red-500" : "text-gray-800"
                  }`}
                >
                  {reward.stock ?? 0} u.
                </span>
              </div>
              <div className="flex flex-col">
                <span className="text-gray-400 text-xs font-medium uppercase tracking-wide">
                  Total canjeado
                </span>
                <span className="text-xl font-bold text-gray-800 mt-0.5">
                  {reward.totalClaimed ?? 0}
                </span>
              </div>
              {reward.maxGlobalClaims != null && (
                <div className="flex flex-col">
                  <span className="text-gray-400 text-xs font-medium uppercase tracking-wide">
                    Límite global
                  </span>
                  <span className="text-xl font-bold text-gray-800 mt-0.5">
                    {reward.maxGlobalClaims}
                  </span>
                </div>
              )}
            </div>
          </div>

          <div className="flex flex-wrap gap-3 mt-6">
            <Button onClick={onEdit} variant="primary" className="rounded-lg">
              <MdEdit className="text-base" />
              Editar Premio
            </Button>
            <Button
              onClick={onTogglePause}
              variant="ghost"
              className="rounded-lg"
            >
              <MdPauseCircle className="text-base" />
              {reward.isActive ? "Pausar Disponibilidad" : "Activar Premio"}
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
