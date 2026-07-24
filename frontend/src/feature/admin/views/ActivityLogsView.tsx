import { useTableFilters } from "@/core/hooks/useTableFilters";
import type { ActivityLogFilters } from "../types/activityLogFilters";
import { useActivityLogsQuery } from "../services/activityLogServices";
import { ActivityLogsTable } from "../components/activityLogs/ActivityLogsTable";
import ActivityLogsFilters from "../components/activityLogs/ActivityLogsFilters";

export default function ActivityLogsView() {
  const {
    appliedFilters,
    filters: localFilters,
    setFilter,
    setPage,
    setPerPage,
    page,
    perPage,
  } = useTableFilters<ActivityLogFilters>(15, 500);

  const { data, isLoading } = useActivityLogsQuery({
    ...appliedFilters,
    page,
    per_page: perPage,
  });

  return (
    <div className="flex flex-col gap-6 p-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Logs de Actividad</h1>
        <p className="text-slate-500 text-sm">
          Auditoría y registro de cambios en el sistema.
        </p>
      </div>

      <ActivityLogsFilters filters={localFilters} setFilter={setFilter} />

      <ActivityLogsTable
        logs={data?.items || []}
        isLoading={isLoading}
        page={page}
        perPage={perPage}
        setPage={setPage}
        setPerPage={setPerPage}
      />
    </div>
  );
}
