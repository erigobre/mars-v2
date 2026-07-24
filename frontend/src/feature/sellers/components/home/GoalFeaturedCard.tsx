import type { DashboardGoals, DashboardStoreStatus } from "../../schemas/dashboardSchema";
import FeaturedCard from "./FeaturedCard";
import MetaPrincipalImg from "/images/meta_principal.webp";

export default function GoalFeaturedCard({
  goals,
  onAction,
}: {
  goals: DashboardGoals;
  storeStatus: DashboardStoreStatus;
  onAction: () => void;
}) {
  // Solo usamos closest para la FeaturedCard de meta
  // const goal = goals.newest ?? goals.closest;
  const goal = goals.secondaryGoal;

  if (!goal) {
    return (
      <FeaturedCard
        sectionTitle="Tu Meta Principal"
        imageSrc={MetaPrincipalImg}
        title="Sin metas asignadas"
        footerText="¡Sigue acumulando puntos!"
        showIndicator={false}
        onAction={onAction}
        status="no_goals"
        bgColor="bg-linear-to-br from-theme-light-primary to-theme-secondary"
        imageOverflow={true}
      />
    );
  }

  return (
    <FeaturedCard
      sectionTitle="Tu Meta Principal"
      imageSrc={
        goal.goal.representationImage ??
        "https://images.unsplash.com/photo-1499762512135-1563725b3069?q=80&w=800"
      }
      badgeText={goal.reached ? "¡Completada!" : "En progreso"}
      title={goal.goal.name}
      footerText={`${Math.round(goal.percentage)}% Completado`}
      showIndicator={!goal.reached}
      onAction={onAction}
      status={"open"}
    />
  );
}
