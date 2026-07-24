import { Fragment, useState } from "react";
import {
  MdKeyboardArrowDown,
  MdKeyboardArrowRight,
  MdChevronLeft,
  MdChevronRight,
} from "react-icons/md";
import { formatDate } from "@/core/utils/formatDate";
import type { ActivityLog } from "../../schemas/activityLog";

type ActivityLogsTableProps = {
  logs: ActivityLog[];
  isLoading: boolean;
  page: number;
  perPage: number;
  setPage: (page: number) => void;
  setPerPage: (perPage: number) => void;
};

export function ActivityLogsTable({
  logs,
  isLoading,
  page,
  perPage,
  setPage,
  setPerPage,
}: ActivityLogsTableProps) {
  const [expandedId, setExpandedId] = useState<number | null>(null);

  const toggleExpand = (id: number) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  if (isLoading) {
    return (
      <div className="p-8 text-center text-slate-500 bg-white rounded-lg shadow-sm border border-slate-200">
        Cargando logs de actividad...
      </div>
    );
  }

  if (!logs.length) {
    return (
      <div className="p-8 text-center text-slate-500 bg-white rounded-lg shadow-sm border border-slate-200">
        No se encontraron registros para estos filtros.
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-slate-200 flex flex-col">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm text-slate-600">
          <thead className="bg-slate-50 border-b border-slate-200 text-slate-800">
            <tr>
              <th className="px-4 py-3 w-10"></th>
              <th className="px-4 py-3 font-semibold">Usuario</th>
              <th className="px-4 py-3 font-semibold">Acción</th>
              <th className="px-4 py-3 font-semibold">Módulo</th>
              <th className="px-4 py-3 font-semibold">IP</th>
              <th className="px-4 py-3 font-semibold">Fecha</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {logs.map((log) => {
              const isExpanded = expandedId === log.id;
              const hasChanges = log.oldValues || log.newValues;

              return (
                <Fragment key={log.id}>
                  <tr
                    onClick={() => hasChanges && toggleExpand(log.id)}
                    className={`hover:bg-slate-50 transition-colors ${
                      hasChanges ? "cursor-pointer" : ""
                    }`}
                  >
                    <td className="px-4 py-3 text-slate-400">
                      {hasChanges &&
                        (isExpanded ? (
                          <MdKeyboardArrowDown size={20} />
                        ) : (
                          <MdKeyboardArrowRight size={20} />
                        ))}
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-medium text-slate-800">
                        {log.user?.username || "Sistema"}
                      </div>
                      <div className="text-xs text-slate-500">
                        {log.user?.email}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800 uppercase tracking-wider">
                        {log.actionType}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-medium">{log.modelType}</div>
                      <div className="text-xs">ID: {log.modelId}</div>
                    </td>
                    <td className="px-4 py-3">{log.ipAddress || "N/A"}</td>
                    <td className="px-4 py-3">
                      {log.createdAt ? formatDate(log.createdAt) : "-"}
                    </td>
                  </tr>

                  {isExpanded && hasChanges && (
                    <tr className="bg-slate-50 border-b border-slate-200">
                      <td colSpan={6} className="px-4 py-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="bg-white p-3 rounded border border-red-100 shadow-inner">
                            <h4 className="text-xs font-bold text-red-600 mb-2 uppercase tracking-wider">
                              Antes (oldValues)
                            </h4>
                            <pre className="text-[11px] text-slate-700 overflow-x-auto">
                              {log.oldValues
                                ? JSON.stringify(log.oldValues, null, 2)
                                : "Sin datos previos"}
                            </pre>
                          </div>
                          <div className="bg-white p-3 rounded border border-green-100 shadow-inner">
                            <h4 className="text-xs font-bold text-green-600 mb-2 uppercase tracking-wider">
                              Después (newValues)
                            </h4>
                            <pre className="text-[11px] text-slate-700 overflow-x-auto">
                              {log.newValues
                                ? JSON.stringify(log.newValues, null, 2)
                                : "Sin datos nuevos"}
                            </pre>
                          </div>
                        </div>
                        {log.description && (
                          <div className="mt-3 text-sm text-slate-600">
                            <strong>Descripción:</strong> {log.description}
                          </div>
                        )}
                      </td>
                    </tr>
                  )}
                </Fragment>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Controles de Paginación Internos */}
      <div className="p-4 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <span className="text-sm text-slate-500">Mostrar</span>
          <select
            className="border-slate-200 rounded text-sm text-slate-700 focus:ring-primary focus:border-primary outline-none py-1 px-2"
            value={perPage}
            onChange={(e) => setPerPage(Number(e.target.value))}
          >
            <option value={10}>10</option>
            <option value={15}>15</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
          </select>
          <span className="text-sm text-slate-500">registros</span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setPage(Math.max(1, page - 1))}
            disabled={page === 1}
            className="p-1 rounded text-slate-500 hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <MdChevronLeft size={24} />
          </button>
          <span className="text-sm font-medium text-slate-700 bg-slate-100 px-3 py-1 rounded">
            Página {page}
          </span>
          <button
            onClick={() => setPage(page + 1)}
            disabled={logs.length < perPage} // Deshabilita si la página actual trajo menos del límite (última página)
            className="p-1 rounded text-slate-500 hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <MdChevronRight size={24} />
          </button>
        </div>
      </div>
    </div>
  );
}
