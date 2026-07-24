import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  MdEmojiEvents,
  MdGroup,
  MdCheckCircle,
  MdTimelapse,
} from "react-icons/md";
import { usePageBreadcrumbs } from "@/core/hooks/usePageBreadcrumbs";
import StatCard from "@/core/components/common/StatCard";
import { useGoalDetailsQuery, useGoalProgressesQuery } from "../services/goalServices";
import GoalDetailsSkeleton from "../components/goal/GoalDetailsSkeleton";
import { GoalHeaderCard } from "../components/goal/GoalHeaderCard";
import { GoalProgressSection } from "../components/goal/GoalProgressSection";
import GoalFormDrawer from "../components/goal/GoalFormDrawer";


export default function GoalDetailsView() {
  const { id } = useParams<{ id: string }>();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const { data: goal, isLoading, isError } = useGoalDetailsQuery(Number(id));

  const { data: progressesData, isLoading: isLoadingProgresses } =
    useGoalProgressesQuery(Number(id));

  usePageBreadcrumbs([
    { label: "Metas", to: "/admin/goals" },
    { label: goal?.name ?? "Cargando..." },
  ]);

  if (isLoading) return <GoalDetailsSkeleton />;

  if (isError || !goal) {
    return (
      <div className="flex items-center justify-center py-32">
        <div className="text-center space-y-4">
          <MdEmojiEvents className="text-gray-300 text-6xl mx-auto" />
          <h2 className="text-xl font-bold text-gray-800">
            Meta no encontrada
          </h2>
          <p className="text-gray-500 text-sm">
            Hubo un error al cargar los detalles o la meta no existe.
          </p>
          <Link
            to="/admin/goals"
            className="text-primary hover:underline font-bold text-sm"
          >
            Volver a Metas
          </Link>
        </div>
      </div>
    );
  }

  const progresses = progressesData?.items ?? [];
  const totalVendors = goal.progressesCount ?? 0;
  const completedCount = goal.reachedCount ?? 0;
  const inProgressCount = totalVendors - completedCount;
  const completionRate =
    totalVendors > 0 ? ((completedCount / totalVendors) * 100).toFixed(1) : "0";

  // Calcular progreso promedio
  const avgProgress =
    progresses.length > 0
      ? (
          progresses.reduce((sum, p) => sum + p.percentage, 0) /
          progresses.length
        ).toFixed(1)
      : "0";

  return (
    <div className="space-y-6">
      {/* Header */}
      <GoalHeaderCard
        goal={goal}
        onEdit={() => setIsDrawerOpen(true)}
        onTogglePause={() => console.log("Toggle pause")}
      />

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Total Vendedores"
          value={totalVendors.toLocaleString()}
          sub="Trabajando"
          icon={<MdGroup className="text-xl" />}
        />
        <StatCard
          label="Han Completado"
          value={completedCount.toLocaleString()}
          sub={`${completionRate}% del total`}
          subClass="text-green-600"
          icon={<MdCheckCircle className="text-xl" />}
        />
        <StatCard
          label="En Progreso"
          value={inProgressCount.toLocaleString()}
          sub="Activos"
          icon={<MdTimelapse className="text-xl" />}
        />
        <StatCard
          label="Progreso Promedio"
          value={`${avgProgress}%`}
          sub="General"
          icon={<MdEmojiEvents className="text-xl" />}
        />
      </div>

      {/* Progress Table */}
      <GoalProgressSection
        progresses={progresses}
        goalType={goal.type}
        isLoading={isLoadingProgresses}
      />

      {/* Edit Drawer */}
      <GoalFormDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        goalToEdit={goal}
      />
    </div>
  );
}
