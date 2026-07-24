import { useRewardClaimDetailsQuery } from "@/feature/reward-claims/services/rewardClaimServices";
import { useEffect, useRef } from "react";
import { MdCheckCircle, MdDownload, MdHome } from "react-icons/md";
import { useParams, useNavigate } from "react-router-dom";
import { ReservingModal } from "../components/claims/ReservingModal";
import { useDownloadReceiptMutation } from "../services/rewardClaimServices";

export default function SuccessClaimView() {
  const { claimId } = useParams<{ claimId: string }>();
  const navigate = useNavigate();
  const circleRef = useRef<SVGCircleElement>(null);

  const {
    data: claimData,
    isLoading: isLoadingClaim,
    isError: isErrorClaim,
    error: claimError,
  } = useRewardClaimDetailsQuery(Number(claimId));
  const claim = claimData;

  const { mutate: downloadPdf, isPending: isDownloading } =
    useDownloadReceiptMutation();

  // Animación del checkmark SVG
  useEffect(() => {
    const el = circleRef.current;
    if (!el) return;
    el.style.strokeDashoffset = "283";
    el.style.transition = "stroke-dashoffset 0.8s ease-out 0.3s";
    requestAnimationFrame(() => {
      el.style.strokeDashoffset = "0";
    });
  }, []);

  // Bloquear el botón "atrás" del browser en success
  useEffect(() => {
    window.history.pushState(null, "", window.location.href);
    const handler = () =>
      window.history.pushState(null, "", window.location.href);
    window.addEventListener("popstate", handler);
    return () => window.removeEventListener("popstate", handler);
  }, []);

  const isModalOpen = isErrorClaim;

  const errorMessage =
    claimError?.message || "No pudimos recuperar la información del canje.";

  if (isLoadingClaim) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-10 h-10 border-4 border-secondary/20 border-t-secondary rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="">
      <ReservingModal
        open={isModalOpen}
        isReserving={false}
        errorMessage={errorMessage}
        onBack={() => navigate("/rewards", { replace: true })}
      />

      {/* Subtle stars */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        {Array.from({ length: 24 }).map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-white rounded-full"
            style={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              opacity: Math.random() * 0.4 + 0.1,
            }}
          />
        ))}
      </div>

      <div className="relative flex flex-col items-center justify-center max-w-sm mx-auto h-screen w-full">
        {/* Main content */}
        <div className="flex flex-col items-center justify-center gap-6 w-full">
          {/* Animated checkmark */}
          <div className="relative w-32 h-32">
            <div className="absolute inset-0 rounded-full bg-theme-primary/10 animate-ping" />
            <div className="absolute inset-3 rounded-full bg-theme-primary/5" />
            <svg
              viewBox="0 0 100 100"
              className="absolute inset-0 w-full h-full -rotate-90"
            >
              <circle
                cx="50"
                cy="50"
                r="45"
                fill="none"
                stroke="rgba(74,222,128,0.2)"
                strokeWidth="4"
              />
              <circle
                ref={circleRef}
                cx="50"
                cy="50"
                r="45"
                fill="none"
                stroke="#009EEA"
                strokeWidth="4"
                strokeLinecap="round"
                strokeDasharray="283"
                strokeDashoffset="283"
              />
            </svg>
            <div className="absolute inset-5 bg-theme-accent rounded-full flex items-center justify-center shadow-2xl shadow-theme-primary/50">
              <MdCheckCircle className="text-white text-5xl" />
            </div>
          </div>

          {/* Title */}
          <div className="text-center space-y-1">
            <h1 className="text-3xl font-black tracking-tight text-white">
              ¡Canje Exitoso!
            </h1>
            {claim?.reward && (
              <p className="text-white text-sm">{claim.reward.name}</p>
            )}
          </div>

          {/* Folio card */}
          <div className="w-full bg-white/10 backdrop-blur-sm border-2 border-white rounded-3xl px-6 py-5 text-center space-y-3">
            <p className="text-white text-xs font-semibold uppercase tracking-widest">
              Folio de Seguimiento
            </p>
            <p className="text-4xl font-black tracking-wider text-white">
              #{claim?.folio ?? "—"}
            </p>
            <div className="flex justify-center">
              <span className="inline-flex items-center gap-2 bg-theme-light-warning text-theme-warning text-sm font-bold px-4 py-2 rounded-full border border-amber-400/25">
                <span className="w-2 h-2 bg-theme-warning rounded-full animate-pulse" />
                {claim?.statusLabel ?? "Pendiente"}
              </span>
            </div>
          </div>

          {/* Info box */}
          <div className="w-full px-5 py-4 text-center space-y-2">
            <p className="text-sm text-white leading-relaxed">
              En breve nos pondremos en contacto contigo para el seguimiento de
              la entrega.
            </p>
            <p className="text-sm text-white font-bold uppercase tracking-wide">
              ¡Recuerda seguir vendiendo para volver a ganar!
            </p>
          </div>
        </div>

        {/* Bottom actions */}
        <div className="w-full space-y-3 mt-8">
          <button
            onClick={() => downloadPdf(claimData!)}
            disabled={isDownloading}
            className="w-full flex items-center cursor-pointer justify-center gap-2 bg-transparent backdrop-blur-md hover:bg-white/15 border-2 border-white text-white font-bold py-4 rounded-2xl text-sm transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isDownloading ? (
              <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <MdDownload className="text-lg" />
            )}
            {isDownloading ? "Descargando..." : "Descargar Comprobante"}
          </button>
          <button
            onClick={() => navigate("/rewards", { replace: true })}
            className="w-full flex items-center justify-center gap-2 bg-theme-primary hover:bg-theme-primary/90 text-white font-bold py-4 rounded-2xl text-sm shadow-lg shadow-primary/30 transition-all active:scale-[0.98]"
          >
            <MdHome className="text-lg" /> Volver al Inicio
          </button>
        </div>
      </div>
    </div>
  );
}
