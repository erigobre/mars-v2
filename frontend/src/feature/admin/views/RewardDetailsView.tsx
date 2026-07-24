import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  MdCardGiftcard,
  MdGroup,
  MdInventory2,
  MdShoppingCartCheckout,
  MdStars,
} from "react-icons/md";
import { usePageBreadcrumbs } from "@/core/hooks/usePageBreadcrumbs";
import { useRewardDetailsQuery } from "../../rewards/services/rewardServices";
import { RewardHeaderCard } from "../components/reward/RewardHeaderCard";
import { RewardClaimsSection } from "../components/reward/RewardClaimsSection";
import RewardDetailsSkeleton from "../components/reward/RewardDetailsSkeleton";
import RewardFormDrawer from "../components/reward/RewardFormDrawer";
import StatCard from "@/core/components/common/StatCard";

export default function RewardDetailsView() {
  const { id } = useParams<{ id: string }>();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const {
    data: reward,
    isLoading,
    isError,
  } = useRewardDetailsQuery(Number(id));

  usePageBreadcrumbs([
    { label: "Premios", to: "/admin/rewards" },
    { label: reward?.name ?? "Cargando..." },
  ]);

  if (isLoading) return <RewardDetailsSkeleton />;

  if (isError || !reward) {
    return (
      <div className="flex items-center justify-center py-32">
        <div className="text-center space-y-4">
          <MdCardGiftcard className="text-gray-300 text-6xl mx-auto" />
          <h2 className="text-xl font-bold text-gray-800">
            Premio no encontrado
          </h2>
          <p className="text-gray-500 text-sm">
            Hubo un error al cargar los detalles o el premio no existe.
          </p>
          <Link
            to="/admin/rewards"
            className="text-primary hover:underline font-bold text-sm"
          >
            Volver a Premios
          </Link>
        </div>
      </div>
    );
  }

  const totalPointsInvested =
    (reward.totalClaimed ?? 0) * reward.pointsRequired;

  return (
    <div className="space-y-6">
      {/* Header */}
      <RewardHeaderCard
        reward={reward}
        onEdit={() => setIsDrawerOpen(true)}
        onTogglePause={() => console.log("Toggle pause")}
      />

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Total Canjes"
          value={(
            reward.totalClaimsCount ??
            reward.totalClaimed ??
            0
          ).toLocaleString()}
          icon={<MdShoppingCartCheckout className="text-xl" />}
        />
        <StatCard
          label="Stock Restante"
          value={`${reward.stock ?? 0} u.`}
          sub={(reward.stock ?? 0) === 0 ? "Sin stock" : undefined}
          subClass="text-red-500"
          icon={<MdInventory2 className="text-xl" />}
        />
        <StatCard
          label="Vendedores Únicos"
          value={
            reward.claimsList
              ? new Set(reward.claimsList.map((c) => c.sellerId)).size
              : "—"
          }
          sub="Activos"
          icon={<MdGroup className="text-xl" />}
        />
        <StatCard
          label="Puntos Invertidos"
          value={
            totalPointsInvested >= 1000
              ? `${(totalPointsInvested / 1000).toFixed(1)}k`
              : totalPointsInvested.toLocaleString()
          }
          sub="En total"
          icon={<MdStars className="text-xl" />}
        />
      </div>

      {/* Claims History */}
      <RewardClaimsSection
        claims={reward.claimsList ?? []}
        totalClaimsCount={reward.totalClaimsCount}
      />

      {/* Edit Drawer */}
      <RewardFormDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        rewardToEdit={reward}
      />
    </div>
  );
}
