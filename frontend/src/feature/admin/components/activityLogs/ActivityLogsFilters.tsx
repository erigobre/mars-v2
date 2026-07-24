import {
  MdList,
  MdPerson,
  MdMonitor,
  MdVpnKey,
  MdNumbers,
  MdDateRange,
} from "react-icons/md";
import { Select, Input } from "@/core/components/ui";
import type { ActivityLogFilters } from "../../types/activityLogFilters";

interface ActivityLogsFiltersProps {
  filters: Partial<ActivityLogFilters>;
  setFilter: (key: keyof ActivityLogFilters, value: any) => void;
}

export default function ActivityLogsFilters({
  filters,
  setFilter,
}: ActivityLogsFiltersProps) {
  return (
    <section className="bg-white p-4 md:p-6 rounded-2xl shadow-sm border border-slate-100 mb-8">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 items-end">
        <Select
          label="Tipo de Acción"
          leftIcon={<MdList />}
          value={filters.actionType || ""}
          onChange={(e) => setFilter("actionType", e.target.value)}
          options={[
            { value: "", label: "Todas las acciones" },
            { value: "CREATED", label: "Creación (Create)" },
            { value: "update", label: "Actualización (Update)" },
            { value: "delete", label: "Eliminación (Delete)" },
            { value: "login", label: "Inicios de sesión (Login)" },
          ]}
        />

        <Input
          label="ID de Usuario"
          type="number"
          leftIcon={<MdPerson />}
          placeholder="Ej. 12"
          value={filters.userId || ""}
          onChange={(e) => setFilter("userId", e.target.value)}
        />

        <Input
          label="Módulo / Modelo"
          leftIcon={<MdMonitor />}
          placeholder="Ej. User, Sale, Reward..."
          value={filters.modelType || ""}
          onChange={(e) => setFilter("modelType", e.target.value)}
        />

        <Input
          label="ID del Modelo"
          type="number"
          leftIcon={<MdNumbers />}
          placeholder="Ej. 45"
          value={filters.modelId || ""}
          onChange={(e) => setFilter("modelId", e.target.value)}
        />

        <Input
          label="Dirección IP"
          leftIcon={<MdVpnKey />}
          placeholder="Ej. 192.168.1.1"
          value={filters.ipAddress || ""}
          onChange={(e) => setFilter("ipAddress", e.target.value)}
        />

        <Input
          label="Fecha Exacta"
          type="date"
          leftIcon={<MdDateRange />}
          value={filters.createdAt || ""}
          onChange={(e) => setFilter("createdAt", e.target.value)}
        />
      </div>
    </section>
  );
}
