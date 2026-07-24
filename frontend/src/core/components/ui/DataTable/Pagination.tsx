import type { PaginationMeta } from "@/core/types";
import { getPageNumbers } from "./utils";
import { LuChevronLeft, LuChevronRight } from "react-icons/lu";

export default function Pagination({
  meta,
  onPageChange,
  onPerPageChange,
  perPageOptions,
}: {
  meta: PaginationMeta;
  onPageChange?: (p: number) => void;
  onPerPageChange?: (pp: number) => void;
  perPageOptions: number[];
}) {
  const pages = getPageNumbers(meta);

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 text-sm">

      <div className="flex items-center gap-1.5 text-gray-500 text-xs">
        <span>Mostrando</span>
        {onPerPageChange ? (
          <select
            value={meta.per_page}
            onChange={(e) => onPerPageChange(Number(e.target.value))}
            className="border border-gray-200 rounded-lg text-xs py-1 px-2 bg-whiteoutline-none focus:ring-2 focus:ring-primary cursor-pointer"
          >
            {perPageOptions.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        ) : (
          <span className="font-medium text-gray-700">
            {meta.from}–{meta.to}
          </span>
        )}
        <span>
          de{" "}
          <span className="font-bold text-gray-700">
            {meta.total}
          </span>
        </span>
      </div>

      {/* Page buttons */}
      {onPageChange && (
        <div className="flex items-center gap-1">
          <button
            onClick={() => onPageChange(meta.current_page - 1)}
            disabled={meta.current_page === 1}
            className={`
              w-9 h-9 flex items-center justify-center rounded-xl transition-all text-sm",
              ${meta.current_page === 1
                ? "bg-gray-100 text-gray-300 cursor-not-allowed"
                : "bg-white border border-gray-200 text-gray-600 hover:border-primary hover:text-primary shadow-sm"}`}
          >
            <LuChevronLeft />
          </button>

          {pages.map((page, i) =>
            page === "..." ? (
              <span key={i} className="w-9 text-center text-gray-400 text-xs">
                …
              </span>
            ) : (
              <button
                key={i}
                onClick={() => onPageChange(page as number)}
                disabled={meta.current_page === page}
                className={`
                  w-9 h-9 flex items-center justify-center rounded-xl text-xs font-bold transition-all
                  ${meta.current_page === page
                    ? "bg-primary text-white shadow-md shadow-primary/30 cursor-default"
                    : "bg-white border border-gray-200 text-gray-600 hover:border-primary hover:text-primary shadow-sm"}
                `}
              >
                {page}
              </button>
            )
          )}

          <button
            onClick={() => onPageChange(meta.current_page + 1)}
            disabled={meta.current_page === meta.last_page}
            className={`
              w-9 h-9 flex items-center justify-center rounded-xl transition-all text-sm
              ${meta.current_page === meta.last_page
                ? "bg-gray-100 text-gray-300 cursor-not-allowed"
                : "bg-white border border-gray-200 text-gray-600 hover:border-primary hover:text-primary shadow-sm"}
              `}
          >
            <LuChevronRight />
          </button>
        </div>
      )}
    </div>
  );
}