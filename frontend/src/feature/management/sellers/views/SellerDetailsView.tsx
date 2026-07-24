import { useParams, useNavigate } from "react-router-dom";
import {
  MdArrowBack,
  MdPerson,
  MdStars,
  MdLocationOn,
  MdStore,
  MdAddShoppingCart,
  MdTimeline,
  MdEdit,
} from "react-icons/md";
import PageHeader from "@/core/components/common/PageHeader";
import { Button } from "@/core/components/ui";
import { usePageBreadcrumbs } from "@/core/hooks/usePageBreadcrumbs";
import { useSellerDetailsQuery } from "../services/sellerServices";
import TierBadge from "@/feature/seller-tiers/components/TierBadge";
import { useAuthStore } from "@/core/stores/authStore";
import { formatDate } from "@/core/utils/formatDate";
import { useState } from "react";
import type { Seller } from "../schemas/seller";
import SellerFormDrawer from "../components/SellerFormDrawer";

export default function SellerDetailsView() {
  const { id } = useParams();
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);

  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const [selectedSeller, setSelectedSeller] = useState<Seller | null>(null);

  const sellerId = +id!;

  const { data: seller, isLoading } = useSellerDetailsQuery(sellerId);

  const handleEdit = (seller: Seller) => {
    setSelectedSeller(seller);
    setIsDrawerOpen(true);
  };

  usePageBreadcrumbs([
    { label: "Vendedores", to: `/${user?.role}/sellers` },
    { label: seller?.username || "Detalles" },
  ]);

  if (isLoading) return <div>Cargando detalles...</div>;
  if (!seller) return <div>Vendedor no encontrado.</div>;

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Detalles de ${seller.username}`}
        subtitle={`Código: ${seller.employeeCode}`}
      >
        <div className="flex flex-wrap items-center gap-3">
          <Button
            variant="ghost"
            leftIcon={<MdArrowBack />}
            onClick={() => navigate(-1)}
          >
            Volver
          </Button>

          {/* {seller.distributor && (
            <Button
              variant="ghost"
              leftIcon={<MdStore />}
              onClick={() =>
                navigate(
                  `/${user?.role}/distributors/${seller.distributor?.id}`,
                )
              }
            >
              Ver Distribuidor
            </Button>
          )} */}

          <Button
            variant="ghost"
            leftIcon={<MdEdit />}
            onClick={() => handleEdit(seller)}
          >
            Editar
          </Button>

          <Button
            className="bg-primary text-white"
            leftIcon={<MdAddShoppingCart />}
            onClick={() =>
              navigate(
                `/${user?.role}/sales?sellerId=${seller.id}&distributorId=${seller.distributor?.id}`,
              )
            }
          >
            Asignar Ventas
          </Button>
        </div>
      </PageHeader>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col items-center text-center">
            <div className="w-24 h-24 rounded-full bg-secondary/10 flex items-center justify-center border border-secondary/20 mb-4 overflow-hidden">
              {seller.avatarUrl ? (
                <img
                  src={seller.avatarUrl}
                  alt={seller.username}
                  className="w-full h-full object-cover"
                />
              ) : (
                <MdPerson className="text-secondary text-5xl" />
              )}
            </div>
            <h2 className="text-xl font-bold text-gray-900">
              {seller.username}
            </h2>
            <p className="text-gray-500">{seller.email}</p>
            <p className="text-gray-500 mb-4">{seller.phone}</p>

            <div className="w-full pt-4 border-t border-gray-100 flex justify-around">
              <div className="text-center">
                <p className="text-xs text-gray-400 font-bold uppercase">
                  Estado
                </p>
                <span
                  className={`inline-flex px-2 py-1 rounded text-xs font-bold ${
                    seller.isActive
                      ? "bg-emerald-100 text-emerald-700"
                      : "bg-gray-200 text-gray-600"
                  }`}
                >
                  {seller.isActive ? "Activo" : "Inactivo"}
                </span>
              </div>
              <div className="text-center">
                <p className="text-xs text-gray-400 font-bold uppercase">
                  Puntos
                </p>
                <div className="flex items-center gap-1 font-bold text-amber-500">
                  <MdStars /> {seller.currentPoints}
                </div>
              </div>
            </div>
          </div>

          {/* Dirección */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h3 className="font-bold flex items-center gap-2 mb-4 text-gray-800">
              <MdLocationOn className="text-primary text-xl" /> Dirección
            </h3>
            <div className="text-sm text-gray-600 space-y-1">
              <p>
                <span className="font-semibold text-gray-700">Calle:</span>{" "}
                {seller.address?.street || "N/D"}
              </p>
              <p>
                <span className="font-semibold text-gray-700">Colonia:</span>{" "}
                {seller.address?.colonia || "N/D"}
              </p>
              <p>
                <span className="font-semibold text-gray-700">Ciudad/Edo:</span>{" "}
                {seller.address?.city || "N/D"},{" "}
                {seller.address?.state || "N/D"}
              </p>
              <p>
                <span className="font-semibold text-gray-700">C.P.:</span>{" "}
                {seller.address?.zip || "N/D"}
              </p>
            </div>
          </div>

          {/* Distribuidor Asignado */}
          {seller.distributor && (
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <h3 className="font-bold flex items-center gap-2 mb-4 text-gray-800">
                <MdStore className="text-primary text-xl" /> Distribuidor
                Asignado
              </h3>
              <div className="text-sm text-gray-600">
                <p className="font-semibold text-gray-900 text-base">
                  {seller.distributor.companyName}
                </p>
                <p className="mt-1">
                  <span className="font-semibold text-gray-700">
                    Responsable:
                  </span>{" "}
                  {seller.distributor.username || "N/D"}
                </p>
                <p>
                  <span className="font-semibold text-gray-700">Email:</span>{" "}
                  {seller.distributor.email || "N/D"}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Columna Derecha: Estadísticas, Progreso y Snapshots */}
        <div className="lg:col-span-2 space-y-6">
          {/* Tarjetas de Estadísticas Rápidas */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
              <p className="text-sm font-semibold text-gray-500">
                Total Ventas
              </p>
              <p className="text-2xl font-bold text-gray-800">
                {seller.statistics?.totalSalesCount || 0}
              </p>
            </div>
            <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
              <p className="text-sm font-semibold text-gray-500">
                Promedio Mensual
              </p>
              <p className="text-2xl font-bold text-gray-800">
                {seller.averageMonthlySales || 0}
              </p>
            </div>
          </div>

          {/* Tier Actual */}
          {seller.tier && (
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <h3 className="font-bold text-gray-800 mb-4">Nivel Actual</h3>
              <div className="flex flex-col gap-2">
                <TierBadge
                  name={seller.tier.name}
                  color={seller.tier.color}
                  icon={seller.tier.icon}
                  size="lg"
                />
                <p className="text-sm text-gray-500 mt-2 ml-1">
                  Metas: de {seller.tier.minAverageSales} a{" "}
                  {seller.tier.maxAverageSales} ventas/mes
                </p>
              </div>
            </div>
          )}

          {/* Progreso de Metas */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h3 className="font-bold text-gray-800 mb-4">Progreso de Metas</h3>
            {seller.goalProgresses?.length ? (
              <div className="space-y-4">
                {seller.goalProgresses.map((progress: any) => (
                  <div
                    key={progress.id}
                    className="border-b border-gray-50 pb-4 last:border-0 last:pb-0"
                  >
                    <div className="flex justify-between text-sm mb-1">
                      <span className="font-semibold text-gray-700">
                        Meta #{progress.goal?.id || "Desconocida"}
                      </span>
                      <span className="text-gray-500">
                        {progress.currentValue} / {progress.targetValue}
                      </span>
                    </div>
                    {/* Barra de progreso */}
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div
                        className={`h-2.5 rounded-full ${
                          progress.reached ? "bg-emerald-500" : "bg-primary"
                        }`}
                        style={{
                          width: `${Math.min(progress.percentage, 100)}%`,
                        }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-400">
                Sin metas registradas actualmente.
              </p>
            )}
          </div>

          {/* Historial de Ciclos (Snapshots) */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
              <MdTimeline className="text-primary text-xl" /> Historial de
              Ventas por Ciclo
            </h3>
            {seller.salesSnapshots?.length ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {seller.salesSnapshots.map((snapshot) => (
                  <div
                    key={snapshot.id}
                    className="p-4 bg-gray-50 rounded-xl border border-gray-100 flex flex-col justify-between"
                  >
                    <div className="mb-3">
                      <p className="font-bold text-sm text-gray-900">
                        {snapshot.campaign?.name || "Campaña General"}
                      </p>
                      {snapshot.redemptionCycleId !== null && (
                        <>
                          <p className="text-xs text-gray-500 mt-1">
                            {snapshot.redemptionCycle?.name ||
                              `Ciclo #${snapshot.redemptionCycle?.name}`}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            {formatDate(snapshot.redemptionCycle?.startDate)} -{" "}
                            {formatDate(snapshot.redemptionCycle?.endDate)}
                          </p>
                        </>
                      )}
                    </div>
                    <div className="flex items-end justify-between border-t border-gray-200 pt-3">
                      <p className="text-xs font-semibold text-gray-400 uppercase">
                        Unidades Vendidas
                      </p>
                      <p className="text-xl font-bold text-primary">
                        {snapshot.totalUnitsSold} /{" "}
                        {snapshot.targetAverage.toFixed(0)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-400 text-center py-4 bg-gray-50 rounded-lg">
                El vendedor aún no tiene registro de unidades en ciclos activos.
              </p>
            )}
          </div>
        </div>
      </div>

      <SellerFormDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        sellerToEdit={selectedSeller}
      />
    </div>
  );
}
