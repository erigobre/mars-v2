import type { PaginationMeta } from "@/core/types";

export function getPageNumbers(meta: PaginationMeta): (number | "...")[] {
  const total = meta.last_page;
  const current = meta.current_page;
  const delta = 1;

  const range: number[] = [];
  for (
    let i = Math.max(2, current - delta);
    i <= Math.min(total - 1, current + delta);
    i++
  ) {
    range.push(i);
  }

  const result: (number | "...")[] = [];

  result.push(1);
  if (current - delta > 2) result.push("...");
  result.push(...range);
  if (current + delta < total - 1) result.push("...");
  if (total !== 1) result.push(total);

  return result;
}
