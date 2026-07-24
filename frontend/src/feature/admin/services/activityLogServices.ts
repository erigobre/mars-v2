import { useQuery } from "@tanstack/react-query";
import type { ActivityLogFilters } from "../types/activityLogFilters";
import { getActivityLogs } from "../api/ActivityLogsAPI";

export function useActivityLogsQuery(filters: ActivityLogFilters) {
    return useQuery({
      queryKey: ['activity-logs', filters],
      queryFn: () => getActivityLogs(filters),
    });
  }