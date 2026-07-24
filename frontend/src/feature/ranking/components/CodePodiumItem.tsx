import { MdWorkspacePremium } from "react-icons/md";
import type { Ranking } from "../schemas/ranking";

const codeStyles = [
  { color: "text-yellow-500", bg: "bg-yellow-50", border: "border-yellow-200" },
  { color: "text-slate-400", bg: "bg-slate-50", border: "border-slate-200" },
  { color: "text-amber-600", bg: "bg-amber-50", border: "border-amber-200" },
];

export default function CodePodiumItem({ seller, isMe }: { seller: Ranking; isMe: boolean }) {
  if (!seller) return null;
  const realRank = seller.rank - 1;
  const style = codeStyles[realRank];

  return (
    <div
      className={`flex flex-col items-center p-3 rounded-xl border ${
        style.bg
      } ${style.border} ${
        realRank === 0 ? "h-40 w-32 shadow-md" : "h-32 w-28"
      } ${isMe ? "ring-2 ring-blue-500 ring-offset-2" : ""}`}
    >
      <MdWorkspacePremium className={`text-4xl ${style.color} mb-2`} />
      <p className="font-bold text-center text-sm w-full">
        {seller.sellerName}
      </p>
      <p className="text-xs text-slate-500 mt-auto">{seller.totalPoints} pts</p>
    </div>
  );
}