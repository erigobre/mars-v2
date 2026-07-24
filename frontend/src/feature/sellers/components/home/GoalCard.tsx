// GoalCard.tsx — versión actualizada
import bgMetaPeriodo from "/images/meta_periodo.webp";

type GoalCardProps = {
  goalName: string;
  percent: number;
  daysLeft?: number;
  reached?: boolean;
  description?: string;
  growthPercentage?: number; // ← NUEVO: viene de mainGoal.growthPercentage
};

export default function GoalCard({
  goalName,
  percent,
  daysLeft,
  reached = false,
  description,
  growthPercentage = 0,
}: GoalCardProps) {
  const clampedPercent = Math.min(100, Math.max(0, Math.round(percent)));

  const showGrowthMessage = reached && growthPercentage;

  return (
    <div
      className="w-full min-h-[300px] sm:min-h-[340px] flex flex-col justify-center rounded-3xl p-5 sm:p-8 shadow-sm border-2 border-theme-warning relative overflow-hidden gap-1"
      style={{
        backgroundImage: `url(${bgMetaPeriodo})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <div className="flex flex-col">
        <div className="flex items-end justify-between mb-2">
          <div className="w-full pr-2">
            <h3 className="text-xl sm:text-3xl lg:text-4xl font-bold text-white leading-tight">
              {goalName}
            </h3>
          </div>
          <span className="text-5xl sm:text-6xl lg:text-7xl font-extrabold text-white leading-none tracking-tighter shrink-0">
            {clampedPercent}%
          </span>
        </div>

        {/* Barra de progreso */}
        <div className="w-full bg-theme-light-accent border-2 border-white rounded-full h-8 sm:h-14 overflow-hidden shadow-inner mt-2 sm:mt-3">
          <div
            className={`h-full rounded-l-full transition-all duration-700 ${
              reached
                ? "bg-theme-primary border-r-2 border-white animate-pulse"
                : "bg-theme-accent border-r-2 border-white"
            }`}
            style={{ width: reached ? "100%" : `${clampedPercent}%` }}
          />
        </div>
      </div>

      {/* Footer */}
      <div className="mt-3 sm:mt-4 flex flex-col items-center justify-center gap-2">
        {reached ? (
          <>
            <div className="inline-flex items-center gap-1.5 sm:gap-2 rounded-full px-2 sm:px-4 py-1 sm:py-1.5 animate-[pop-in_0.5s_ease-out_both]">
              <span className="text-xl sm:text-2xl">🏆</span>
              <span className="text-xs sm:text-sm font-extrabold text-white text-center">
                ¡Lograste tu meta! Ya estás acumulando puntos
              </span>
            </div>

            {showGrowthMessage && (
              <div
                className="inline-flex items-center gap-2 px-2 sm:px-4"
                style={{ animation: "slide-up 0.4s ease-out 0.3s both" }}
              >
                <span className="text-xs sm:text-sm text-center font-normal text-white leading-snug">
                  Entre más vendas, más posibilidades tienes de llevarte un
                  premio. Actualmente tienes un crecimiento del{" "}
                  <span className="text-sm sm:text-lg font-bold text-white">
                    {growthPercentage}%
                  </span>{" "}
                  por arriba del promedio de tus ventas.
                </span>
              </div>
            )}
          </>
        ) : (
          <>
            <div className="inline-flex items-center rounded-full px-4 py-1.5">
              <span className="font-medium text-white text-lg md:text-xl text-center">
                {description}
              </span>
            </div>
            {daysLeft !== undefined && (
              <p className="text-xs sm:text-sm text-white truncate max-w-45">
                Termina en {daysLeft} días
              </p>
            )}
          </>
        )}
      </div>

      {/* Keyframes via style tag — solo cuando reached */}
      {reached && (
        <style>{`
          @keyframes shimmer {
            0% { background-position: -200% center; }
            100% { background-position: 200% center; }
          }
          @keyframes pop-in {
            0% { transform: scale(0.8); opacity: 0; }
            70% { transform: scale(1.05); opacity: 1; }
            100% { transform: scale(1); opacity: 1; }
          }
          @keyframes slide-up {
            from { transform: translateY(10px); opacity: 0; }
            to { transform: translateY(0); opacity: 1; }
          }
        `}</style>
      )}
    </div>
  );
}
