import {
  MdEmojiEvents,
  MdClose,
  MdStars,
} from "react-icons/md";
import {
  useCycleRankingQuery,
  useGenerateCycleRankingMutation,
} from "../../services/campaignServices";
import { Button } from "@/core/components/ui";
import { RankingBoard } from "@/feature/ranking/components/RankingBoard";

type CycleRankingModalProps = {
  campaignId: number;
  cycleId: number;
  cycleName: string;
  onClose: () => void;
};

export function CycleRankingModal({
  campaignId,
  cycleId,
  cycleName,
  onClose,
}: CycleRankingModalProps) {
  const { data: rankingResponse, isLoading, isError } = useCycleRankingQuery(
    campaignId,
    cycleId,
    true
  );
  const rankingList = rankingResponse?.data ?? [];

  const { mutate: generateRanking, isPending: isGenerating } =
    useGenerateCycleRankingMutation();

  const handleGenerate = () => {
    generateRanking({ campaignId, cycleId });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        <div className="flex items-center justify-between p-6 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <MdEmojiEvents className="text-primary text-xl" />
            </div>
            <div>
              <h2 className="text-lg font-bold">Ranking del Periodo</h2>
              <p className="text-sm text-slate-500">{cycleName}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
          >
            <MdClose size={24} />
          </button>
        </div>

        <div className="p-6 overflow-y-auto">
          {isLoading && (
            <div className="text-center py-12 text-slate-500">
              Cargando datos del ranking...
            </div>
          )}

          {(isError && !isLoading) || rankingList.length === 0 && (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                <MdStars className="text-4xl text-slate-300" />
              </div>
              <h3 className="text-lg font-bold text-slate-700 mb-2">
                Aún no hay ranking
              </h3>
              <p className="text-slate-500 max-w-sm mb-6">
                No se ha generado el ranking para este periodo. Puedes generarlo
                ahora mismo evaluando los puntos acumulados.
              </p>
              <Button
                onClick={handleGenerate}
                disabled={isGenerating}
                variant="primary"
              >
                Generar Ranking Ahora
              </Button>
            </div>
          )}

          {rankingList.length > 0 && (
            <RankingBoard rankingList={rankingList} variant="dashboard" />
          )}
        </div>
      </div>
    </div>
  );
}
