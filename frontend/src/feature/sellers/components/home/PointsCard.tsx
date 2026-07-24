import bgPuntosAcumulados from "/images/puntos_acumulados.webp";

type PointsCardProps = {
  points: number;
};

export default function PointsCard({ points }: PointsCardProps) {
  const getDynamicTextSize = (text: string) => {
    const length = text.length;

    if (length <= 4) return "text-8xl";
    if (length <= 6) return "text-5xl sm:text-6xl md:text-5xl lg:text-6xl";
    return "text-5xl sm:text-6xl md:text-4xl lg:text-6xl";
  };

  const dynamicSizeClass = getDynamicTextSize(points.toString());

  return (
    <div
      className="w-full h-full min-h-45 flex flex-col items-center justify-center rounded-3xl py-7 px-10 text-center text-white shadow-xl border-2 border-theme-light-warning relative"
      style={{
        backgroundImage: `url(${bgPuntosAcumulados})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <p className="text-white font-extrabold text-xl md:text-3xl uppercase z-10 drop-shadow-md">
        Puntos de este periodo
      </p>

      <div
        className={`font-heading tracking-tight drop-shadow-xl text-center leading-none -mt-1 z-10 transition-all duration-300 ${dynamicSizeClass}`}
      >
        {points}
      </div>

      {points > 0 && (
        <div className="inline-flex items-center bg-theme-secondary backdrop-blur-sm border-2 border-theme-warning rounded-full px-4 py-1.5 z-10 mt-2 shadow-lg w-full justify-center">
          <span className="font-extrabold text-white uppercase md:text-xl pt-1">
            ¡Excelente ritmo!
          </span>
        </div>
      )}
    </div>
  );
}
