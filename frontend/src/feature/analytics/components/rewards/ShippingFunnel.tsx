import {
  MdListAlt,
  MdInventory,
  MdPendingActions,
  MdFactCheck,
  MdLocalShipping,
  MdTaskAlt,
  MdBlock,
  MdTrendingUp,
} from "react-icons/md";
import type { ShippingFunnel } from "../../schemas/distributorDashboardSchema";
import MetricCard from "@/feature/analytics/components/MetricCard";

interface ShippingFunnelProps {
  data?: ShippingFunnel;
}

export default function ShippingFunnel({ data }: ShippingFunnelProps) {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-bold text-slate-900">Estado de los Envíos</h3>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          variant="solid"
          title="Total Solicitudes"
          value={data?.total || 0}
          icon={<MdListAlt />}
          colorScheme="primary"
        />

        <MetricCard
          variant="solid"
          title="Reservados"
          value={data?.reserved || 0}
          icon={<MdInventory />}
          colorScheme="secondary"
        />

        <MetricCard
          variant="solid"
          title="Pendientes"
          value={data?.pending || 0}
          icon={<MdPendingActions />}
          colorScheme="yellow"
        />

        <MetricCard
          variant="solid"
          title="Aprobados"
          value={data?.approved || 0}
          icon={<MdFactCheck />}
          colorScheme="indigo"
        />

        <MetricCard
          variant="solid"
          title="En Camino"
          value={data?.shipped || 0}
          icon={<MdLocalShipping />}
          colorScheme="blue"
        />

        <MetricCard
          variant="solid"
          title="Entregados"
          value={data?.delivered || 0}
          icon={<MdTaskAlt />}
          colorScheme="emerald"
        />

        <MetricCard
          variant="solid"
          title="Rechazados"
          value={data?.rejected || 0}
          icon={<MdBlock />}
          colorScheme="orange"
        />

        <MetricCard
          variant="solid"
          title="Conversión"
          value={`${data?.conversionRate || 0}%`}
          icon={<MdTrendingUp />}
          colorScheme="tertiary"
        />
      </div>
    </div>
  );
}
