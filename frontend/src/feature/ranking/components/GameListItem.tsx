import { formatNumber } from "@/core/utils/formatDate";
import type { Ranking } from "../schemas/ranking";

export default function GameListItem({
  seller,
  isMe,
}: {
  seller: Ranking;
  isMe: boolean;
}) {
  const avatar =
    seller.avatarUrl ||
    `https://ui-avatars.com/api/?name=${seller.sellerName}&background=random`;

  return (
    <div
      className={`flex items-center rounded-2xl p-4 sm:p-5 md:p-6 transition-transform hover:scale-[1.01] ${
        isMe ? "bg-[#eef8ff] border-2 border-[#0ba5fb]" : "bg-white"
      }`}
    >
      <span className="font-black text-2xl sm:text-3xl w-12 sm:w-16 text-center text-[#222]">
        {seller.rank}.
      </span>

      <img
        src={avatar}
        alt={seller.sellerName || "Avatar"}
        className="w-12 h-12 md:w-16 md:h-16 rounded-full object-cover mx-3 sm:mx-5 bg-slate-100"
      />

      <p className="font-bold text-base sm:text-lg md:text-2xl flex-1 truncate text-[#222]">
        {seller.sellerName}
        {isMe && (
          <span className="ml-3 text-xs md:text-sm font-black bg-[#0ba5fb] text-white px-3 py-1 rounded-full uppercase tracking-wider align-middle">
            Tú
          </span>
        )}
      </p>

      <p className="font-bold text-base sm:text-xl md:text-2xl whitespace-nowrap pl-2 text-[#444]">
        - {formatNumber(seller.totalPoints)} pts
      </p>
    </div>
  );
}
