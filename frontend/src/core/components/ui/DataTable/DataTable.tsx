import type { DataTableColumn, DataTableProps } from "@/core/types";
import { Fragment, type Key } from "react";
import { LuChevronRight } from "react-icons/lu";
import {
  DesktopEmptyState,
  DesktopLoadingState,
  DesktopRow,
  MobileCard,
  MobileEmptyState,
  MobileLoadingState,
} from "./TableSubComponents";
import Pagination from "./Pagination";

export default function DataTable<TData extends { id: Key }>({
  columns,
  data,

  title,
  titleIcon,
  viewAllLabel = "Ver todas",
  onViewAll,

  isLoading = false,
  isPlaceholderData = false,
  emptyMessage = "No se encontraron registros.",

  meta,
  onPageChange,
  onPerPageChange,
  perPageOptions = [5, 10, 25, 50, 100],

  renderExpandedRow,
}: DataTableProps<TData>) {
  const showLoading = isLoading && !isPlaceholderData;

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {title && (
          <div className="px-5 py-4 md:px-6 md:py-5 border-b border-gray-100 bg-gray-50/60 flex items-center justify-between gap-3">
            <h3 className="flex items-center gap-2 text-base md:text-lg font-bold text-gray-900">
              {titleIcon && (
                <span className="text-primary text-xl shrink-0">
                  {titleIcon}
                </span>
              )}
              {title}
            </h3>

            {onViewAll && (
              <button
                onClick={onViewAll}
                className="flex cursor-pointer items-center gap-1 text-primary font-bold text-sm hover:underline underline-offset-2 whitespace-nowrap shrink-0"
              >
                {viewAllLabel}
                <LuChevronRight className="text-base" />
              </button>
            )}
          </div>
        )}

        <div className="md:hidden p-4 space-y-3">
          {showLoading ? (
            <MobileLoadingState />
          ) : data.length > 0 ? (
            data.map((item, i) => {
              const expandedContent = renderExpandedRow?.(item);

              return (
                <div key={item.id ?? i} className="flex flex-col">
                  {/* Tarjeta principal de información */}
                  <MobileCard item={item} columns={columns} />

                  {/* Contenido expandido para móviles */}
                  {expandedContent && (
                    <div className="-mt-3 pt-3 pb-2 px-2 animate-in fade-in slide-in-from-top-2 duration-200">
                      <div className="bg-gray-50/50 rounded-b-2xl border-x border-b border-gray-100 overflow-hidden">
                        {expandedContent}
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          ) : (
            <MobileEmptyState message={emptyMessage} />
          )}
        </div>

        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                {columns.map((col, i) => (
                  <th
                    key={i}
                    className={[
                      "py-3 px-3 xl:py-4 xl:px-6 text-[10px] xl:text-xs font-bold text-gray-500 uppercase tracking-wider",
                      col.alignRight ? "text-right" : "text-left",
                    ].join(" ")}
                  >
                    {col.label}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {showLoading ? (
                <DesktopLoadingState
                  columns={columns as DataTableColumn<TData>[]}
                />
              ) : data.length > 0 ? (
                data.map((item, i) => {
                  const expandedContent = renderExpandedRow?.(item);

                  return (
                    <Fragment key={item.id ?? i}>
                      <DesktopRow
                        item={item}
                        columns={columns}
                        isLast={i === data.length - 1 && !expandedContent}
                      />
                      {expandedContent && (
                        <tr
                          className={
                            i === data.length - 1
                              ? ""
                              : "border-b border-gray-200"
                          }
                        >
                          <td colSpan={columns.length} className="p-0">
                            {expandedContent}
                          </td>
                        </tr>
                      )}
                    </Fragment>
                  );
                })
              ) : (
                <DesktopEmptyState
                  message={emptyMessage}
                  columns={columns as DataTableColumn<TData>[]}
                />
              )}
            </tbody>
          </table>
        </div>
      </div>

      {meta && (
        <Pagination
          meta={meta}
          onPageChange={onPageChange}
          onPerPageChange={onPerPageChange}
          perPageOptions={perPageOptions}
        />
      )}
    </div>
  );
}
