import type { DataTableColumn } from "@/core/types";
import type { Key } from "react";
import { LuLoader, LuInbox } from "react-icons/lu";

export function MobileCard<TData extends { id: Key }>({
  item,
  columns,
}: {
  item: TData;
  columns: DataTableColumn<TData>[];
}) {
  const primaryCol = columns.find((c) => c.primary);
  const otherCols = columns.filter((c) => !c.primary && !c.mobileHidden);

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      {primaryCol && (
        <div className="px-4 pt-4 pb-3 border-b border-gray-100 bg-gray-50/60">
          <div className="text-sm font-bold text-gray-900">
            {primaryCol.render(item)}
          </div>
        </div>
      )}

      <div className="px-4 py-3 space-y-2.5">
        {otherCols.map((col, i) => {
          const isLast = i === otherCols.length - 1;

          if (isLast && col.alignRight) {
            return (
              <div key={i} className="pt-1">
                {col.render(item)}
              </div>
            );
          }

          return (
            <div key={i} className="flex items-center justify-between gap-4">
              <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide shrink-0">
                {col.label}
              </span>
              <div className="text-sm text-right text-gray-800 font-medium">
                {col.render(item)}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function DesktopRow<TData extends { id: Key }>({
  item,
  columns,
  isLast,
}: {
  item: TData;
  columns: DataTableColumn<TData>[];
  isLast: boolean;
}) {
  return (
    <tr
      className={[
        "hover:bg-gray-50/70 transition-colors duration-150",
        !isLast ? "border-b border-gray-100" : "",
      ].join(" ")}
    >
      {columns.map((col, i) => (
        <td
          key={i}
          className={[
            "py-3 px-3 xl:py-5 xl:px-6 text-xs xl:text-sm",
            col.alignRight ? "text-right" : "text-left",
            col.className ?? "",
          ].join(" ")}
        >
          {col.render(item)}
        </td>
      ))}
    </tr>
  );
}

export function LoadingState<TData>({
  columns,
}: {
  columns: DataTableColumn<TData>[];
}) {
  return (
    <>
      <tr className="md:hidden">
        <td colSpan={columns.length} className="p-0 border-none">
          <div className="space-y-3 p-4">
            {[1, 2, 3].map((n) => (
              <div
                key={n}
                className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 space-y-3 animate-pulse"
              >
                <div className="h-4 bg-gray-200 rounded w-2/3" />
                <div className="h-3 bg-gray-100 rounded w-1/2" />
                <div className="h-3 bg-gray-100 rounded w-1/3" />
              </div>
            ))}
          </div>
        </td>
      </tr>

      <tr className="hidden md:table-row">
        <td colSpan={columns.length} className="h-36">
          <div className="flex items-center justify-center gap-3 text-gray-400">
            <LuLoader className="animate-spin text-primary" size={24} />
            <span className="text-sm font-medium">Cargando...</span>
          </div>
        </td>
      </tr>
    </>
  );
}

export function EmptyState<TData>({
  message,
  columns,
}: {
  message: string;
  columns: DataTableColumn<TData>[];
}) {
  return (
    <>
      {/* Mobile */}
      <div className="md:hidden py-14 flex flex-col items-center justify-center gap-2 text-gray-400">
        <LuInbox size={36} className="opacity-40" />
        <p className="text-sm font-medium">{message}</p>
      </div>

      {/* Desktop */}
      <tr className="hidden md:table-row">
        <td colSpan={columns.length}>
          <div className="py-14 flex flex-col items-center justify-center gap-2 text-gray-400">
            <LuInbox size={32} className="opacity-40" />
            <p className="text-sm font-medium">{message}</p>
          </div>
        </td>
      </tr>
    </>
  );
}

// --- ESTADOS DE CARGA ---

export function MobileLoadingState() {
  return (
    <>
      {[1, 2, 3].map((n) => (
        <div
          key={n}
          className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 space-y-3 animate-pulse"
        >
          <div className="h-4 bg-gray-200 rounded w-2/3" />
          <div className="h-3 bg-gray-100 rounded w-1/2" />
          <div className="h-3 bg-gray-100 rounded w-1/3" />
        </div>
      ))}
    </>
  );
}

export function DesktopLoadingState({ columns }: { columns: any[] }) {
  return (
    <tr>
      <td colSpan={columns.length} className="h-36">
        <div className="flex items-center justify-center gap-3 text-gray-400">
          <LuLoader className="animate-spin text-primary" size={24} />
          <span className="text-sm font-medium">Cargando...</span>
        </div>
      </td>
    </tr>
  );
}

// --- ESTADOS VACÍOS (Ajusta los diseños según lo que tenías) ---

export function MobileEmptyState({ message }: { message: string }) {
  return (
    <div className="p-8 text-center text-gray-500 bg-white rounded-2xl border border-gray-100 shadow-sm">
      {message}
    </div>
  );
}

export function DesktopEmptyState({
  columns,
  message,
}: {
  columns: any[];
  message: string;
}) {
  return (
    <tr>
      <td colSpan={columns.length} className="h-36 text-center text-gray-500">
        {message}
      </td>
    </tr>
  );
}
