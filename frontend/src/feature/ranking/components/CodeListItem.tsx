import { formatNumber } from "@/core/utils/formatDate";
import type { Ranking } from "../schemas/ranking";

export default function CodeListItem({
  entry,
  isMe,
}: {
  entry: Ranking;
  isMe: boolean;
}) {
  return (
    <div
      className={`flex items-center justify-between p-3 rounded-xl transition-colors ${
        isMe
          ? "bg-blue-50 border border-blue-200"
          : "hover:bg-slate-50 border border-transparent"
      }`}
    >
      <div className="flex items-center gap-4">
        <span
          className={`font-bold w-6 text-center ${
            isMe ? "text-blue-600" : "text-slate-400"
          }`}
        >
          #{entry.rank}
        </span>
        <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center font-bold text-slate-500 overflow-hidden shrink-0">
          {entry.sellerName?.charAt(0)}
        </div>
        <div>
          <p
            className={`font-medium truncate max-w-30 ${
              isMe ? "text-blue-600" : "text-slate-700"
            }`}
          >
            {entry.sellerName} {isMe && "(Tú)"}
          </p>
          <p className="text-xs text-slate-500 truncate max-w-30">
            {entry.distributorName || "Sin distribuidor"}
          </p>
        </div>
      </div>
      <span
        className={`font-bold ${isMe ? "text-blue-600" : "text-slate-700"}`}
      >
        {formatNumber(entry.totalPoints)} pts
      </span>
    </div>
  );
}
