import { formatDate } from "@/core/utils/formatDate";
import type { DashboardStoreStatus } from "../../schemas/dashboardSchema";
import FeaturedCard from "./FeaturedCard";
import CatalogoImg from "/images/catalogo3.webp";

export default function StoreFeaturedCard({
  storeStatus,
  onAction,
}: {
  storeStatus: DashboardStoreStatus;
  onAction: () => void;
}) {
  return (
    <FeaturedCard
      sectionTitle="Catálogo de Premios"
      imageSrc={CatalogoImg}
      badgeText="Explorar"
      title="Descubre y canjea premios"
      footerText={
        storeStatus.isOpen
          ? "¡Canjes habilitados! Entra y elige tu premio."
          : storeStatus.nextOpeningAt
          ? `Catálogo disponible (Canjes abren el ${formatDate(
              storeStatus.nextOpeningAt,
              {
                day: "2-digit",
                month: "short",
                hour: "2-digit",
                minute: "2-digit",
              }
            )})`
          : "Revisa los premios y planifica tus próximos puntos"
      }
      showIndicator={true}
      onAction={onAction}
      status="open"
      bgColor="bg-linear-to-br from-theme-secondary to-theme-warning"
      imageOverflow={true}
    />
  );
}
