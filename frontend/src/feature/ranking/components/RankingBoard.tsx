import type { Ranking } from "../schemas/ranking";
import GamePodiumItem from "./GamePodiumItem";
import GameListItem from "./GameListItem";
import CodePodiumItem from "./CodePodiumItem";
import CodeListItem from "./CodeListItem";

type RankingBoardProps = {
  rankingList: Ranking[];
  currentSellerId?: number;
  variant?: "dashboard" | "game";
};

export function RankingBoard({
  rankingList,
  currentSellerId,
  variant = "game",
}: RankingBoardProps) {
  if (!rankingList || rankingList.length === 0) {
    return (
      <div className="text-center p-12 bg-white rounded-3xl border border-slate-200">
        <p className="text-xl font-bold text-(--theme-text-dark)">
          No hay datos para este ranking aún.
        </p>
      </div>
    );
  }

  const top3 = rankingList.slice(0, 3);
  const others = rankingList.slice(3);

  const podiumOrder = [top3[1], top3[0], top3[2]];

  if (variant === "game") {
    return (
      <div className="w-full max-w-5xl mx-auto flex flex-col items-center">
        <div className="flex justify-center items-end w-full max-w-4xl pt-24 md:pt-36 mb-6 md:mb-10 px-2 gap-2 sm:gap-4">
          {podiumOrder.map((seller, i) => (
            <GamePodiumItem
              key={seller?.sellerId || `empty-${i}`}
              seller={seller}
              isMe={seller?.sellerId === currentSellerId}
            />
          ))}
        </div>

        {others.length > 0 ? (
          <div className="flex flex-col gap-3 md:gap-4 w-full max-w-3xl px-2">
            {others.map((seller) => (
              <GameListItem
                key={seller.sellerId}
                seller={seller}
                isMe={seller.sellerId === currentSellerId}
              />
            ))}
          </div>
        ) : (
          <div className="w-full max-w-sm mx-auto mt-2 bg-white rounded-full py-4 px-6 flex items-center justify-center gap-3">
            <div className="w-2 h-2 rounded-full bg-(--theme-accent) animate-pulse"></div>
            <p className="text-sm md:text-base font-bold text-(--theme-text-dark) opacity-80 uppercase tracking-widest">
              Fin del Ranking
            </p>
            <div className="w-2 h-2 rounded-full bg-(--theme-accent) animate-pulse"></div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="flex justify-center items-end gap-3 mb-8 mt-10">
        {podiumOrder.map((seller, i) => (
          <CodePodiumItem
            key={seller?.sellerId || `empty-${i}`}
            seller={seller}
            isMe={seller?.sellerId === currentSellerId}
          />
        ))}
      </div>
      <div className="space-y-2 bg-white rounded-2xl p-4 border border-slate-200">
        {others.map((entry) => (
          <CodeListItem
            key={entry.sellerId}
            entry={entry}
            isMe={entry.sellerId === currentSellerId}
          />
        ))}
      </div>
    </div>
  );
}
