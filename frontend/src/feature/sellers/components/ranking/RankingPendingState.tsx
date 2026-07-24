import {
  MdPendingActions,
  MdHome,
  MdTrendingUp,
  MdEmojiEvents,
  MdInfo,
} from "react-icons/md";

type RankingPendingStateProps = {
  onGoHome: () => void;
  title?: string;
  highlightedWord?: string;
  description?: string;
  infoMessage?: string;
  buttonText?: string;
  ButtonIcon?: React.ElementType;
  MainIcon?: React.ElementType;
};

export default function RankingPendingState({
  onGoHome,
  title = "¡RANKING EN",
  highlightedWord = "PROCESO",
  description = "Estamos calculando las posiciones finales. Los rankings estarán disponibles al finalizar el periodo.",
  infoMessage = "¡Sigue participando para mejorar tu posición en el siguiente periodo!",
  buttonText = "REGRESAR A HOME",
  ButtonIcon = MdHome,
  MainIcon = MdPendingActions,
}: RankingPendingStateProps) {
  return (
    <main className="flex-1 flex flex-col items-center justify-center px-4 w-full">
      <div className="relative w-full max-w-xs aspect-square flex items-center justify-center">
        <div className="absolute inset-0"></div>
        <div className="relative z-10 flex flex-col items-center">
          <div className="w-48 h-48 rounded-full bg-white/10 backdrop-blur-xl border-4 border-white flex items-center justify-center">
            {/* <MdPendingActions className="text-[120px] text-white" /> */}
            <MainIcon className="text-[120px] text-white" />
          </div>
          <div className="absolute -top-4 -right-4 w-16 h-16 rounded-2xl bg-theme-secondary flex items-center justify-center rotate-12">
            <MdTrendingUp className="text-white text-3xl" />
          </div>
          <div className="absolute -bottom-2 -left-6 w-14 h-14 rounded-2xl bg-white flex items-center justify-center -rotate-12">
            <MdEmojiEvents className="text-theme-secondary text-3xl" />
          </div>
        </div>
      </div>

      <div className="bg-white p-8 rounded-xl w-full max-w-md text-center">
        <h1 className="text-theme-text-dark text-3xl font-extrabold leading-tight tracking-tight mb-4">
          {title} <span className="text-theme-secondary">{ highlightedWord }</span>!
        </h1>
        {description && (
          <p className="text-theme-text-dark text-lg font-medium leading-relaxed mb-8">
            {description}
          </p>
        )}

        {infoMessage && (
          <div className="flex items-center gap-4 bg-white p-4 rounded-lg border border-theme-secondary/20 mb-8">
            <MdInfo className="text-theme-secondary text-4xl shrink-0" />
            <p className="text-left text-theme-secondary font-semibold text-base leading-snug">
              {infoMessage}
            </p>
          </div>
        )}

        <button
          onClick={onGoHome}
          className="w-full bg-theme-secondary hover:bg-theme-secondary/90 text-white text-xl font-bold py-5 rounded-full shadow-lg transition-transform active:scale-95 flex items-center justify-center gap-3"
        >
          <ButtonIcon className="text-2xl" />
          {buttonText}
        </button>
      </div>
    </main>
  );
}
