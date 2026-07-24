import { Button } from "@/core/components/ui";
import { useNavigate } from "react-router-dom";
import GoalCard from "../components/home/GoalCard";
import { LuArrowRight } from "react-icons/lu";
import PeriodSection from "../components/home/PeriodSection";
import PointsCard from "../components/home/PointsCard";
import StatCard from "../components/home/StatCard";
import { useSellerDashboardQuery } from "../services/sellerServices";
import {
  daysUntil,
  formatCurrency,
  periodProgressPercent,
  formatDate,
} from "@/core/utils/formatDate";
import type { DashboardGoals } from "../schemas/dashboardSchema";
import HomeError from "../components/home/HomeError";
import GoalFeaturedCard from "../components/home/GoalFeaturedCard";
import StoreFeaturedCard from "../components/home/StoreFeaturedCard";
import { DotsLoader } from "@/core/components/common/DotsLoader";
import { FadeUpContainer, FadeUpItem } from "@/core/components/common/FadeUp";

function resolveGoalCardProps(
  goals: DashboardGoals,
  daysLeft: number,
): React.ComponentProps<typeof GoalCard> {
  if (goals.mainGoal) {
    return {
      goalName: goals.mainGoal.name,
      percent: goals.mainGoal.percentage,
      description: goals.mainGoal.description,
      growthPercentage: goals.mainGoal.growthPercentage ?? 0,
      daysLeft,
      reached: goals.mainGoal.reached,
    };
  }

  if (goals.secondaryGoal) {
    return {
      goalName: goals.secondaryGoal.goal.name,
      percent: goals.secondaryGoal.percentage,
      daysLeft,
      reached: goals.secondaryGoal.reached,
    };
  }

  return { goalName: "Sin meta activa", percent: 0 };
}

export default function HomeView() {
  const navigate = useNavigate();
  const { data, isLoading, isError, refetch } = useSellerDashboardQuery();

  if (isLoading) return <DotsLoader />;
  if (isError || !data) return <HomeError onRetry={refetch} />;

  const { seller, cycle, storeStatus, stats, goals } = data;

  const hasValidCycle = Boolean(cycle?.startDate && cycle?.endDate);

  const daysLeft = hasValidCycle ? daysUntil(cycle!.endDate) : 0;
  const cycleProgress = hasValidCycle
    ? periodProgressPercent(cycle!.startDate, cycle!.endDate)
    : 0;

  const goalCardProps = resolveGoalCardProps(goals, daysLeft);

  const PeriodInfo = (
    <PeriodSection
      startDate={hasValidCycle ? formatDate(cycle!.startDate) : null}
      endDate={hasValidCycle ? formatDate(cycle!.endDate) : null}
      daysLeft={hasValidCycle ? daysLeft : null}
      progressPercent={cycleProgress}
      isStoreOpen={storeStatus.isOpen}
    />
  );

  return (
    <FadeUpContainer className="max-w-6xl mx-auto px-4 md:px-6 py-4 md:py-8 space-y-8">
      <div className="grid grid-cols-2 md:grid-cols-3 gap-8 md:gap-6">
        <FadeUpItem className="col-span-2">
          <GoalCard {...goalCardProps} />
        </FadeUpItem>
        <FadeUpItem className="col-span-2 md:col-span-1">
          <PointsCard points={stats.cyclePoints} />
        </FadeUpItem>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-8">
          <FadeUpItem className="grid grid-cols-2 gap-4">
            <StatCard
              value={seller.currentPoints.toLocaleString()}
              label="PTS Totales"
              className="bg-theme-light-primary border-theme-light-primary/10"
            />
            <StatCard
              value={formatCurrency(stats.totalSalesAmount, {
                minimumFractionDigits: 0,
              })}
              label="VENTAS TOTALES"
              className="bg-theme-light-accent border-theme-light-accent/20"
            />
          </FadeUpItem>

          <FadeUpItem className="hidden md:block">{PeriodInfo}</FadeUpItem>
        </div>

        <div className="flex flex-col space-y-8">
          <FadeUpItem>
            <GoalFeaturedCard
              goals={goals}
              storeStatus={storeStatus}
              onAction={() => navigate("/rewards")}
            />
          </FadeUpItem>

          <FadeUpItem>
            <StoreFeaturedCard
              storeStatus={storeStatus}
              onAction={() => navigate("/rewards")}
            />
          </FadeUpItem>

          <FadeUpItem className="flex flex-col gap-3">
            <Button
              variant="secondary"
              size="lg"
              fullWidth
              rightIcon={<LuArrowRight className="text-2xl" />}
              onClick={() => navigate("/rewards")}
              className="py-6 shadow-xl text-xl uppercase"
            >
              Ver premios y canjear
            </Button>

            {!storeStatus.isOpen && storeStatus.nextOpeningAt && (
              <p className="text-center text-xs text-white drop-shadow-2xl">
                Actualmente no se pueden obtener premios, Hasta:{" "}
                {formatDate(storeStatus.nextOpeningAt, {
                  day: "2-digit",
                  month: "short",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            )}
          </FadeUpItem>

          <div className="md:hidden">{PeriodInfo}</div>
        </div>
      </div>
    </FadeUpContainer>
  );
}
