import { formatNumber } from "@/core/utils/formatDate";
import type { Ranking } from "../schemas/ranking";

const podiumConfig = {
  1: {
    height: "h-56 sm:h-72 md:h-[22rem]",
    bg: "bg-white",
    avatar:
      "w-24 h-24 sm:w-32 sm:h-32 md:w-40 md:h-40 -top-12 sm:-top-16 md:-top-20",
    badgeBg: "bg-[#ffc107]",
    badgePos:
      "w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 text-lg sm:text-xl md:text-2xl -top-5 md:-top-1",
  },
  2: {
    height: "h-44 sm:h-56 md:h-72",
    bg: "bg-[#cceeff]",
    avatar:
      "w-20 h-20 sm:w-24 sm:h-24 md:w-32 md:h-32 -top-10 sm:-top-12 md:-top-16",
    badgeBg: "bg-[#bcc6cc]",
    badgePos:
      "w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 text-base sm:text-lg md:text-xl -top-4 md:-top-1",
  },
  3: {
    height: "h-36 sm:h-48 md:h-60",
    bg: "bg-[#cceeff]",
    avatar:
      "w-16 h-16 sm:w-20 sm:h-20 md:w-28 md:h-28 -top-8 sm:-top-10 md:-top-14",
    badgeBg: "bg-[#cd7f32]",
    badgePos:
      "w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 text-base sm:text-lg md:text-xl -top-4 md:-top-1",
  },
};

export default function GamePodiumItem({
  seller,
  isMe,
}: {
  seller: Ranking;
  isMe: boolean;
}) {
  if (!seller) return <div className="w-1/3 flex-1 opacity-0" />;

  const rank = seller.rank as 1 | 2 | 3;
  const config = podiumConfig[rank] || podiumConfig[3];
  const avatar =
    seller.avatarUrl ||
    `https://ui-avatars.com/api/?name=${seller.sellerName}&background=random`;

  return (
    <div
      className={`relative flex flex-col items-center flex-1 max-w-[30%] rounded-t-[30px] transition-transform duration-300 hover:-translate-y-2 
      ${config.height} ${config.bg} ${
        isMe ? "ring-4 ring-[#0ba5fb] ring-inset" : ""
      }`}
    >
      <img
        src={avatar}
        alt={seller.sellerName || "Avatar"}
        className={`absolute object-cover rounded-full border-4 border-white bg-white z-10 ${config.avatar}`}
      />

      <div
        className={`absolute rounded-full flex items-center justify-center font-black text-white border-[3px] border-white z-20 ${config.badgeBg} ${config.badgePos}`}
      >
        {seller.rank}
      </div>

      <div className="mt-auto w-full flex flex-col items-center pb-6 md:pb-10 px-2 text-center">
        <p className="font-black text-sm sm:text-base md:text-2xl w-full px-1 text-[#222] leading-tight">
          {seller.sellerName}
        </p>
        <p className="font-bold text-sm sm:text-lg md:text-2xl mt-1 text-[#555]">
          {formatNumber(seller.totalPoints)}{" "}
          <span className="text-xs md:text-base font-medium">pts</span>
        </p>
      </div>
    </div>
  );
}
