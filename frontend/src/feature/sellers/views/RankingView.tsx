import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FadeUp } from "@/core/components/common/FadeUp";
import RankingPendingState from "../components/ranking/RankingPendingState";
import { useAuthStore } from "@/core/stores/authStore";
import { DotsLoader } from "@/core/components/common/DotsLoader";
import {
  MdErrorOutline,
  MdLeaderboard,
  MdHistory,
  MdKeyboardArrowDown,
  MdInfoOutline,
} from "react-icons/md";
import {
  useCurrentCampaignCycles,
  useCurrentCycleRanking,
  useCycleRanking,
} from "@/feature/ranking/services/rankingServices";
import { RankingBoard } from "@/feature/ranking/components/RankingBoard";
import { formatDate } from "@/core/utils/formatDate";

type TabType = "current" | "history";

export default function RankingView() {
  const navigate = useNavigate();
  const { user } = useAuthStore();

  const [activeTab, setActiveTab] = useState<TabType>("current");
  const [selectedCycleId, setSelectedCycleId] = useState<number | "">("");

  const { data: currentData, isLoading: loadingCurrent } =
    useCurrentCycleRanking();

  const {
    data: cycles,
    isLoading: loadingCyclesList,
    error: cyclesError,
  } = useCurrentCampaignCycles();

  const { data: pastRankingData, isLoading: loadingPast } =
    useCycleRanking(selectedCycleId);

  const isCurrentAvailable =
    currentData?.ranking && currentData.ranking.length > 0;

  const errorMessage = cyclesError
    ? (cyclesError as any)?.response?.data?.message ||
      cyclesError.message ||
      "No se pudieron cargar los ciclos anteriores."
    : null;

  return (
    <div className="flex flex-col items-center px-4 py-6 md:px-8 w-full max-w-4xl lg:max-w-5xl mx-auto space-y-8">
      <FadeUp className="w-full max-w-md mx-auto backdrop-blur-md border-2 border-white p-1.5 rounded-full flex items-center">
        <button
          onClick={() => setActiveTab("current")}
          className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 text-sm sm:text-base font-black rounded-full transition-all duration-300 ${
            activeTab === "current"
              ? "bg-white text-theme-primary shadow-md transform scale-100"
              : "text-white/80 hover:text-white hover:bg-white/10 scale-95"
          }`}
        >
          <MdLeaderboard className="text-lg" />
          Periodo Actual
        </button>
        <button
          onClick={() => setActiveTab("history")}
          className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 text-sm sm:text-base font-black rounded-full transition-all duration-300 ${
            activeTab === "history"
              ? "bg-white text-theme-primary shadow-md transform scale-100"
              : "text-white/80 hover:text-white hover:bg-white/10 scale-95"
          }`}
        >
          <MdHistory className="text-lg" />
          Historial
        </button>
      </FadeUp>

      {activeTab === "history" && (
        <FadeUp className="w-full max-w-2xl mx-auto">
          {errorMessage ? (
            <div className="w-full bg-red-500/20 backdrop-blur-sm text-white p-5 rounded-3xl border border-red-200/50 shadow-lg flex items-center gap-4">
              <MdErrorOutline className="text-3xl shrink-0 text-red-100" />
              <p className="text-sm md:text-base font-bold">{errorMessage}</p>
            </div>
          ) : (
            <div className="relative group w-full">
              <select
                className="w-full appearance-none bg-white text-theme-primary font-black text-base md:text-lg px-6 py-5 rounded-3xl border-2 border-transparent hover:border-white/50 shadow-xl outline-none cursor-pointer focus:ring-4 focus:ring-white/30 transition-all pr-12"
                value={selectedCycleId}
                onChange={(e) => setSelectedCycleId(Number(e.target.value))}
                disabled={loadingCyclesList}
              >
                <option value="" disabled>
                  {loadingCyclesList
                    ? "Cargando periodos..."
                    : "Selecciona un periodo anterior"}
                </option>
                {cycles?.map((cycle) => (
                  <option key={cycle.id} value={cycle.id}>
                    {cycle.name}{" "}
                    {cycle.startDate
                      ? `(${formatDate(cycle.startDate)} - ${formatDate(
                          cycle.endDate
                        )})`
                      : ""}
                  </option>
                ))}
              </select>
              <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none text-theme-primary opacity-40 group-hover:opacity-100 transition-opacity">
                <MdKeyboardArrowDown className="text-3xl" />
              </div>
            </div>
          )}
        </FadeUp>
      )}

      {activeTab === "current" && isCurrentAvailable && (
        <FadeUp className="w-full max-w-3xl mx-auto bg-white/20 backdrop-blur-md border border-white/40 text-white px-6 py-4 rounded-2xl shadow-lg flex items-center justify-center gap-3">
          <MdInfoOutline className="text-2xl shrink-0 animate-pulse" />
          <p className="text-sm md:text-base font-bold leading-tight text-center">
            Este periodo sigue en curso. Las posiciones y puntos pueden cambiar.
          </p>
        </FadeUp>
      )}

      <FadeUp className="w-full pt-2 flex flex-col items-center">
        {activeTab === "current" ? (
          loadingCurrent ? (
            <div className="py-20 flex justify-center w-full">
              <DotsLoader />
            </div>
          ) : !isCurrentAvailable ? (
            <RankingPendingState onGoHome={() => navigate("/home")} />
          ) : (
            <div className="w-full">
              <RankingBoard
                rankingList={currentData.ranking}
                currentSellerId={user?.id}
                variant="game"
              />
            </div>
          )
        ) : (
          !errorMessage &&
          (loadingPast ? (
            <div className="py-20 flex justify-center w-full">
              <DotsLoader />
            </div>
          ) : selectedCycleId === "" ? (
            <div className="w-full max-w-lg mx-auto flex flex-col items-center justify-center p-10 md:p-14 text-white bg-transparent backdrop-blur-md rounded-4xl border-2 border-white shadow-[0_8px_32px_rgba(0,0,0,0.1)] mt-8">
              <div className="w-24 h-24 rounded-full bg-white/20 flex items-center justify-center mb-6 shadow-inner border-2 border-white">
                <MdHistory className="text-5xl text-white opacity-90" />
              </div>
              <h3 className="text-2xl md:text-3xl font-black mb-3 text-center tracking-tight">
                Historial de Rankings
              </h3>
              <p className="text-sm md:text-base font-medium opacity-80 text-center max-w-xs leading-relaxed">
                Selecciona un periodo en el menú superior para descubrir quiénes
                dominaron el podio.
              </p>
            </div>
          ) : pastRankingData?.ranking && pastRankingData.ranking.length > 0 ? (
            <div className="w-full">
              <RankingBoard
                rankingList={pastRankingData.ranking}
                currentSellerId={user?.id}
                variant="game"
              />
            </div>
          ) : (
            <RankingPendingState
              onGoHome={() => navigate("/home")}
              title="SIN RESULTADOS"
              highlightedWord="PREVIOS"
              description="No encontramos datos de ranking para el periodo que seleccionaste."
              infoMessage="Intenta seleccionando otro periodo en el menú superior."
              MainIcon={MdHistory}
            />
          ))
        )}
      </FadeUp>
    </div>
  );
}
