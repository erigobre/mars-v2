import { useState } from "react";
import { MdSync, MdWindow } from "react-icons/md";
import { CyclesTable } from "./CyclesTable";
import { WindowsTable } from "./WindowsTable";
import type {
  Campaign,
  RedemptionCycle,
  RedemptionWindow,
} from "../../schemas/campaign";
import WindowFormDrawer from "../windows/WindowFormDrawer";
import CycleFormDrawer from "../cycles/CycleFormDrawer";
import { CycleRankingModal } from "./CycleRankingModal";

type Props = { campaign: Campaign };

type WindowTarget = {
  cycle: RedemptionCycle;
  window?: RedemptionWindow;
};

export function CampaignCyclesSection({ campaign }: Props) {
  const [activeTab, setActiveTab] = useState<"ciclos" | "ventanas">("ciclos");

  const [cycleDrawerOpen, setCycleDrawerOpen] = useState(false);
  const [cycleToEdit, setCycleToEdit] = useState<RedemptionCycle | null>(null);

  const [windowDrawerOpen, setWindowDrawerOpen] = useState(false);
  const [windowTarget, setWindowTarget] = useState<WindowTarget | null>(null);

  // Nuevo estado para el modal del ranking
  const [rankingCycle, setRankingCycle] = useState<RedemptionCycle | null>(
    null
  );

  const cycles = campaign.cycles ?? [];
  const totalWindows = cycles.reduce((n, c) => n + (c.windows?.length ?? 0), 0);

  const openNewCycle = () => {
    setCycleToEdit(null);
    setCycleDrawerOpen(true);
  };

  const openEditCycle = (cycle: RedemptionCycle) => {
    setCycleToEdit(cycle);
    setCycleDrawerOpen(true);
  };

  const openAddWindow = (cycle: RedemptionCycle) => {
    setWindowTarget({ cycle });
    setWindowDrawerOpen(true);
  };

  const openEditWindow = (window: RedemptionWindow, cycle: RedemptionCycle) => {
    setWindowTarget({ cycle, window });
    setWindowDrawerOpen(true);
  };

  const closeWindowDrawer = () => {
    setWindowDrawerOpen(false);
    setWindowTarget(null);
  };

  // Handler para abrir el ranking
  const handleViewRanking = (cycle: RedemptionCycle) => {
    setRankingCycle(cycle);
  };

  return (
    <>
      <div className="bg-white rounded-xl border border-slate-200 flex flex-col shadow-sm">
        <div className="px-6 pt-4 border-b border-slate-200 bg-slate-50/30">
          <div className="flex gap-8">
            <button
              onClick={() => setActiveTab("ciclos")}
              className={`pb-4 text-sm font-bold flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
                activeTab === "ciclos"
                  ? "border-primary text-primary"
                  : "border-transparent text-slate-500 hover:text-slate-700"
              }`}
            >
              <MdSync className="text-lg" />
              Ciclos ({cycles.length})
            </button>
            <button
              onClick={() => setActiveTab("ventanas")}
              className={`pb-4 text-sm font-bold flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
                activeTab === "ventanas"
                  ? "border-primary text-primary"
                  : "border-transparent text-slate-500 hover:text-slate-700"
              }`}
            >
              <MdWindow className="text-lg" />
              Todas las Ventanas ({totalWindows})
            </button>
          </div>
        </div>

        <div className="flex-1">
          {activeTab === "ciclos" ? (
            <CyclesTable
              cycles={cycles}
              campaignId={campaign.id}
              onAddCycle={openNewCycle}
              onEditCycle={openEditCycle}
              onAddWindow={openAddWindow}
              onEditWindow={openEditWindow}
              onViewRanking={handleViewRanking}
            />
          ) : (
            <WindowsTable
              cycles={cycles}
              campaignId={campaign.id}
              onEdit={openEditWindow}
            />
          )}
        </div>
      </div>

      <CycleFormDrawer
        isOpen={cycleDrawerOpen}
        onClose={() => setCycleDrawerOpen(false)}
        campaign={campaign}
        cycleToEdit={cycleToEdit}
      />

      <WindowFormDrawer
        isOpen={windowDrawerOpen}
        onClose={closeWindowDrawer}
        campaignId={campaign.id}
        cycle={windowTarget?.cycle ?? undefined}
        windowToEdit={windowTarget?.window ?? null}
      />

      {rankingCycle && (
        <CycleRankingModal
          campaignId={campaign.id}
          cycleId={rankingCycle.id}
          cycleName={rankingCycle.name}
          onClose={() => setRankingCycle(null)}
        />
      )}
    </>
  );
}
