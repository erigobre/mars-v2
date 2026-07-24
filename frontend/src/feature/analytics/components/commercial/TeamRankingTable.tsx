import { z } from "zod";
import type { sellerComparisonSchema } from "../../schemas/salesAnalytics";
import type { DataTableColumn } from "@/core/types";
import { MdWorkspacePremium, MdEmojiEvents } from "react-icons/md";
import { DataTable } from "@/core/components/ui/DataTable";
import { formatCurrency } from "@/core/utils/formatDate";

type RankingItem = z.infer<typeof sellerComparisonSchema>;

type RankingItemWithId = RankingItem & { id: number | string };

type TeamRankingProps = {
  ranking: RankingItem[];
};

export default function TeamRankingTable({ ranking }: TeamRankingProps) {
  const dataWithId: RankingItemWithId[] = ranking.map((item) => ({
    ...item,
    id: item.sellerId,
  }));

  const getMedalStyles = (rank: number) => {
    switch (rank) {
      case 1:
        return "bg-amber-100 text-amber-600";
      case 2:
        return "bg-slate-200 text-slate-500";
      case 3:
        return "bg-orange-100 text-orange-600";
      default:
        return "";
    }
  };

  const columns: DataTableColumn<RankingItemWithId>[] = [
    {
      label: "Rango",
      render: (item) =>
        item.rank <= 3 ? (
          <div
            className={`w-8 h-8 rounded-full flex items-center justify-center ${getMedalStyles(
              item.rank
            )}`}
          >
            <MdWorkspacePremium className="text-lg" />
          </div>
        ) : (
          <div className="text-center text-slate-400 font-bold w-8">
            {item.rank}
          </div>
        ),
    },
    {
      label: "Vendedor",
      primary: true,
      render: (item) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center text-slate-500 font-bold uppercase shrink-0">
            {item.sellerName?.charAt(0) || "U"}
          </div>
          <p className="font-bold text-slate-900">
            {item.sellerName || "Usuario"}
          </p>
        </div>
      ),
    },
    {
      label: "Ventas",
      render: (item) => (
        <span className="font-bold text-slate-700">
          {formatCurrency(item.totalPoints)}
        </span>
      ),
    },
    {
      label: "Cumplimiento",
      render: (item) => (
        <span
          className={`px-3 py-1 text-xs font-bold rounded-full ${
            item.rank <= 3
              ? "bg-emerald-100 text-emerald-700"
              : "bg-slate-100 text-slate-700"
          }`}
        >
          100%
        </span>
      ),
    },
  ];

  return (
    <div className="lg:col-span-2">
      {/* 4. Pasamos el tipo extendido y la data mapeada */}
      <DataTable<RankingItemWithId>
        title="Los Mejores de mi Equipo"
        titleIcon={<MdEmojiEvents />}
        columns={columns}
        data={dataWithId}
        emptyMessage="No hay datos de ranking disponibles."
        viewAllLabel="Ver todos"
        onViewAll={() => console.log("Ver todos clicked")}
      />
    </div>
  );
}
