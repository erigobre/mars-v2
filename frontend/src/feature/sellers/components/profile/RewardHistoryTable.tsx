import {
  MdHistory,
  MdImageNotSupported,
  MdLocalShipping,
  MdContentCopy,
} from "react-icons/md";
import { useRewardClaimsQuery } from "@/feature/reward-claims/services/rewardClaimServices";
import { Skeleton } from "@/core/components/ui/Skeleton";
import { toast } from "react-toastify";

export default function RewardHistoryTable() {
  const { data: claimsData, isLoading: claimsLoading } = useRewardClaimsQuery(
    1,
    50,
  );

  const handleCopyTracking = (tracking: string) => {
    navigator.clipboard.writeText(tracking);
    toast.success("¡Número de guía copiado!");
  };

  if (claimsLoading) {
    return <Skeleton className="h-64 rounded-2xl" />;
  }

  if (!claimsData?.items || claimsData.items.length === 0) {
    return (
      <div className="text-center py-16 bg-gray-50/50 rounded-2xl border border-dashed border-gray-200">
        <MdHistory className="mx-auto text-6xl text-gray-300 mb-4" />
        <h3 className="text-xl font-bold text-gray-700 mb-2">
          Sin historial de canjes
        </h3>
        <p className="text-gray-500 max-w-sm mx-auto">
          Aún no has realizado ningún canje. Los premios que obtengas con tus
          puntos aparecerán aquí.
        </p>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="hidden md:grid md:grid-cols-12 text-left text-gray-500 border-b border-gray-200 pb-4 mb-4 px-4">
        <div className="col-span-6 font-bold uppercase text-xs tracking-widest">
          Premio
        </div>
        <div className="col-span-2 font-bold uppercase text-xs tracking-widest">
          Fecha
        </div>
        <div className="col-span-2 font-bold uppercase text-xs tracking-widest">
          Costo
        </div>
        <div className="col-span-2 font-bold uppercase text-xs tracking-widest text-right">
          Estado
        </div>
      </div>

      <div className="flex flex-col gap-4 md:gap-0 md:divide-y md:divide-gray-50">
        {claimsData.items.map((claim) => (
          <div
            key={claim.id}
            className="flex flex-col md:grid md:grid-cols-12 md:items-center p-4 md:p-4 bg-white border border-gray-100 md:border-transparent rounded-2xl md:rounded-xl shadow-sm md:shadow-none hover:bg-gray-50/80 transition-all duration-200"
          >
            <div className="col-span-6 flex items-start gap-4 mb-4 md:mb-0">
              <div className="w-16 h-16 md:w-20 md:h-20 rounded-xl bg-gray-100 border border-gray-200 overflow-hidden shrink-0 flex items-center justify-center shadow-inner mt-1">
                {claim.reward?.image || claim.reward?.image ? (
                  <img
                    src={claim.reward.image || claim.reward.image}
                    alt={claim.reward?.name || "Premio"}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <MdImageNotSupported className="text-2xl text-gray-400" />
                )}
              </div>
              <div className="flex flex-col gap-1 w-full">
                <h4 className="font-bold text-gray-900 text-base md:text-lg line-clamp-2 leading-tight">
                  {claim.reward?.name || "Premio Desconocido"}
                </h4>

                <div className="flex flex-wrap items-center gap-2 mt-1">
                  <span className="text-xs text-gray-500 font-mono bg-gray-100 px-2 py-0.5 rounded">
                    Folio:{" "}
                    {claim.folio?.toUpperCase() ||
                      claim.id?.toString().slice(0, 8).toUpperCase() ||
                      "N/A"}
                  </span>
                </div>

                {(claim.status === "shipped" || claim.status === "delivered") &&
                  claim.trackingNumber && (
                    <div className="flex flex-col sm:flex-row sm:items-center gap-1.5 mt-2 bg-blue-50/50 border border-blue-100 rounded-lg p-2 w-fit max-w-full">
                      <div className="flex items-center gap-1.5 text-blue-700 text-xs font-bold uppercase tracking-wider">
                        <MdLocalShipping className="text-sm" />
                        {claim.carrier || "Paquetería"}
                      </div>
                      <span className="hidden sm:inline text-blue-300">|</span>
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono text-[11px] font-bold text-slate-700 truncate max-w-37.5 sm:max-w-none">
                          {claim.trackingNumber}
                        </span>
                        <button
                          onClick={() =>
                            handleCopyTracking(claim.trackingNumber!)
                          }
                          className="text-slate-400 hover:text-primary transition-colors p-1"
                          title="Copiar número de guía"
                        >
                          <MdContentCopy />
                        </button>
                      </div>
                    </div>
                  )}
              </div>
            </div>

            <hr className="md:hidden border-gray-100 mb-3" />

            <div className="col-span-2 flex justify-between md:block py-1 md:py-0">
              <span className="md:hidden text-sm font-medium text-gray-500">
                Fecha:
              </span>
              <span className="text-sm md:text-base text-gray-600 font-medium">
                {new Date(claim.createdAt || Date.now()).toLocaleDateString(
                  "es-MX",
                  {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                  },
                )}
              </span>
            </div>

            <div className="col-span-2 flex justify-between md:block py-1 md:py-0">
              <span className="md:hidden text-sm font-medium text-gray-500">
                Puntos:
              </span>
              <span className="font-extrabold text-primary text-sm md:text-base">
                -{claim.pointsSpent} pts
              </span>
            </div>

            <div className="col-span-2 flex justify-between md:justify-end items-center py-1 md:py-0 mt-2 md:mt-0">
              <span className="md:hidden text-sm font-medium text-gray-500">
                Estado:
              </span>
              <span
                className={`px-3 py-1.5 rounded-full text-xs font-bold w-max shadow-sm ${
                  claim.status === "delivered"
                    ? "bg-green-50 text-green-700 border border-green-200"
                    : claim.status === "shipped"
                      ? "bg-blue-50 text-blue-700 border border-blue-200"
                      : claim.status === "cancelled" ||
                          claim.status === "rejected"
                        ? "bg-red-50 text-red-700 border border-red-200"
                        : "bg-yellow-50 text-yellow-700 border border-yellow-200"
                }`}
              >
                {claim.status === "delivered"
                  ? "Entregado"
                  : claim.status === "shipped"
                    ? "En Camino"
                    : claim.status === "cancelled" ||
                        claim.status === "rejected"
                      ? "Cancelado"
                      : "Pendiente"}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
