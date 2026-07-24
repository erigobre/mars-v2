import type { StockStatus } from "@/core/types";
import type { Reward } from "@/feature/rewards/schemas/reward";

export function deriveStockStatus(reward: Reward): StockStatus {
  if (!reward.isAvailable) return "out";
  const stock = reward.stock ?? 0;
  if (stock === 0) return "out";
  if (stock <= 3) return "hot";
  if (stock <= 10) return "low";
  return "available";
}