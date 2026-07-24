import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import {
  MdLocalShipping,
  MdCheck,
  MdArrowBack,
  MdEdit,
  MdClose,
} from "react-icons/md";
import { useParams, useNavigate, useLocation, Link } from "react-router-dom";
import type { ShippingFormData } from "../schemas/rewardClaim";
import {
  useCancelClaimMutation,
  useConfirmClaimMutation,
} from "../services/rewardClaimServices";
import { useProfileQuery } from "@/feature/profile/services/profileServices";
import { useRewardClaimDetailsQuery } from "@/feature/reward-claims/services/rewardClaimServices";
import { ReservingModal } from "../components/claims/ReservingModal";
import { sellerKeys } from "../services/sellerServices";
import { useQueryClient } from "@tanstack/react-query";
import Swal from "sweetalert2";
import { rewardKeys } from "@/feature/rewards/services/rewardServices";

export default function ConfirmClaimView() {
  const queryClient = useQueryClient();
  const { rewardId, claimId } = useParams<{
    rewardId: string;
    claimId: string;
  }>();
  const navigate = useNavigate();
  const location = useLocation();
  const [agreed, setAgreed] = useState(false);

  const {
    data: claim,
    isLoading: isLoadingClaim,
    isError: isErrorClaim,
    error: claimError,
  } = useRewardClaimDetailsQuery(Number(claimId));

  const { data: profile, isLoading: isLoadingProfile } = useProfileQuery();

  const { setError } = useForm<ShippingFormData>();

  const {
    mutate: confirm,
    isPending: isConfirming,
    error: confirmError,
    reset: resetConfirm,
  } = useConfirmClaimMutation({
    claimId: Number(claimId),
    setError,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: sellerKeys.dashboard() });
      navigate(`/rewards/claim/${rewardId}/${claimId}/success`, {
        replace: true,
      });
    },
  });

  const { mutate: cancel, isPending: isCanceling } = useCancelClaimMutation({
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: sellerKeys.dashboard() }),
        queryClient.invalidateQueries({ queryKey: rewardKeys.all }),
      ]);
      navigate("/rewards", { replace: true });
    },
  });

  const shippingFromRoute = location.state?.shippingData as
    | ShippingFormData
    | undefined;

  const shipping: ShippingFormData | null = (() => {
    if (shippingFromRoute) return shippingFromRoute;

    if (profile?.address) {
      return {
        shippingName: profile.username ?? "",
        shippingStreet: profile.address.street ?? "",
        shippingColonia: profile.address.colonia ?? "",
        shippingCity: profile.address.city ?? "",
        shippingState: profile.address.state ?? "",
        shippingZip: profile.address.zip ?? "",
        shippingNotes: profile.shippingNotes ?? "",
        saveToProfile: false,
      };
    }
    return null;
  })();

  const handleEditAddress = () => {
    navigate(`/rewards/claim/${rewardId}/${claimId}/shipping`, {
      replace: true,
      state: { shippingData: shipping },
    });
  };

  const handleCancelClaim = () => {
    Swal.fire({
      title: "¿Estás seguro?",
      text: `Vas a cancelar el canje "${claim?.reward?.name}". Esta acción no se puede deshacer.`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#64748b",
      confirmButtonText: "Sí, cancelar",
      cancelButtonText: "Seguir con el canje",
      reverseButtons: true,
    }).then((result) => {
      if (result.isConfirmed) {
        cancel(Number(claimId));
      }
    });
  };

  const isModalOpen =
    isConfirming || isCanceling || !!confirmError || isErrorClaim;

  const errorMessage =
    confirmError?.message ||
    (isErrorClaim
      ? claimError?.message || "No pudimos recuperar la información del canje."
      : null);

  useEffect(() => {
    if (!isLoadingClaim && !claim && !isLoadingProfile && !shipping) {
      navigate(`/rewards/claim/${rewardId}/${claimId}/shipping`, {
        replace: true,
      });
    }
  }, [
    isLoadingClaim,
    claim,
    shipping,
    isLoadingProfile,
    navigate,
    rewardId,
    claimId,
  ]);

  const handleModalAction = async () => {
    if (confirmError) {
      resetConfirm();
      handleEditAddress();
      return;
    }
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: sellerKeys.dashboard() }),
      queryClient.invalidateQueries({ queryKey: rewardKeys.all }),
    ]);
    navigate("/rewards", { replace: true });
  };

  if (isLoadingClaim || !shipping || isLoadingProfile) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-8 h-8 border-4 border-secondary/20 border-t-secondary rounded-full animate-spin" />
      </div>
    );
  }

  const addressLines = [
    shipping.shippingName,
    shipping.shippingStreet,
    `Col. ${shipping.shippingColonia}, C.P. ${shipping.shippingZip}`,
    `${shipping.shippingCity}, ${shipping.shippingState}`,
    shipping.shippingNotes ? `Notas: ${shipping.shippingNotes}` : null,
  ].filter(Boolean) as string[];

  return (
    <div className="relative flex min-h-screen w-full flex-col items-center mx-auto">
      <ReservingModal
        open={isModalOpen}
        isReserving={isConfirming || isCanceling}
        errorMessage={errorMessage}
        onBack={handleModalAction}
      />

      <div className="mt-8 mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-white shadow-lg shadow-white/20 shrink-0">
        <MdCheck className="text-brandBlue text-6xl font-black" />
      </div>

      <h1 className="text-white text-4xl font-bold leading-tight text-center mb-2">
        ¿Todo listo?
      </h1>
      <p className="text-slate-200 text-center text-sm mb-10 opacity-90">
        Revisa que tus datos sean correctos antes de finalizar
      </p>

      <div className="w-full bg-white rounded-xl p-6 shadow-2xl mb-8">
        <div className="flex flex-col items-center text-center">
          <div className="mb-4 rounded-full bg-theme-secondary/10 px-4 py-1">
            <p className="text-theme-secondary text-xs font-semibold uppercase tracking-wider">
              Premio a Canjear
            </p>
          </div>

          <h2 className="text-slate-900 text-2xl font-bold mb-2">
            {claim?.reward?.name || "Cargando premio..."}
          </h2>
          <p className="text-slate-500 text-sm mb-4">
            Folio de seguimiento:{" "}
            <span className="font-semibold text-slate-800">
              #{claim?.folio}
            </span>
          </p>

          <div className="h-px w-full bg-slate-100 mb-6"></div>

          <p className="text-slate-600 text-base font-normal leading-relaxed mb-4">
            Estás a punto de canjear este premio por{" "}
            <span className="font-bold text-slate-800">
              {claim?.pointsSpent.toLocaleString()} puntos
            </span>
            . Verifica que tu dirección sea correcta para que podamos procesar
            tu envío sin problemas.
          </p>

          <div className="w-full bg-slate-50 rounded-lg p-4 flex items-start gap-3 mb-6 relative">
            <div className="absolute top-3 right-3">
              <button
                onClick={handleEditAddress}
                disabled={isConfirming || isCanceling}
                title="Editar dirección"
                className="p-2 bg-white cursor-pointer border border-slate-300 rounded-full shadow-sm text-slate-700 hover:bg-slate-800 hover:text-white hover:border-slate-800 transition-all disabled:opacity-50 flex items-center justify-center"
              >
                <MdEdit className="text-lg" />
              </button>
            </div>

            <MdLocalShipping className="text-theme-secondary text-xl shrink-0 mt-0.5" />
            <div className="text-left w-full">
              <p className="text-slate-800 text-sm font-bold mb-2">
                Dirección de Envío
              </p>
              {addressLines.map((line, i) => (
                <p
                  key={i}
                  className="text-slate-600 text-sm leading-relaxed mb-0.5"
                >
                  {line}
                </p>
              ))}
            </div>
          </div>

          <button
            onClick={() => setAgreed((v) => !v)}
            className={`w-full flex items-start gap-4 text-left p-4 rounded-xl border-2 transition-all ${
              agreed
                ? "border-theme-secondary bg-theme-secondary/10"
                : "border-slate-200 bg-white hover:border-slate-300"
            }`}
          >
            <div
              className={`w-5 h-5 rounded border shrink-0 flex items-center justify-center transition-all mt-0.5 ${
                agreed ? "border-theme-secondary bg-theme-secondary" : "border-slate-300"
              }`}
            >
              {agreed && <MdCheck className="text-white font-bold text-sm" />}
            </div>
            <p className="text-sm text-slate-600 leading-relaxed">
              Autorizo el uso de mis datos de envío y acepto que se descuenten{" "}
              <span className="font-bold text-slate-800">
                {claim?.pointsSpent.toLocaleString()} pts
              </span>{" "}
              de mi saldo para este canje.{" "}
              <Link
                to="/terms"
                className="text-theme-secondary underline cursor-pointer hover:text-theme-secondary/80"
              >
                Consulta términos y condiciones.
              </Link>
            </p>
          </button>
        </div>
      </div>

      <div className="flex flex-col w-full gap-4 mb-10">
        <button
          disabled={!agreed || isConfirming}
          onClick={() => shipping && confirm(shipping)}
          className="w-full bg-theme-primary hover:bg-theme-primary/90 text-white font-bold py-4 rounded-lg flex items-center justify-center gap-2 transition-all disabled:opacity-50"
        >
          {isConfirming ? (
            <span className="w-5 h-5 border-2 border-background-dark/30 border-t-background-dark rounded-full animate-spin" />
          ) : (
            <MdCheck className="text-xl" />
          )}
          {isConfirming ? "CONFIRMANDO..." : "CONFIRMAR CANJE"}
        </button>
        <button
          onClick={() => navigate(-1)}
          disabled={isConfirming}
          className="w-full bg-transparent backdrop-blur-sm hover:bg-white/90 text-white border-2 border-white font-bold py-4 rounded-lg flex items-center justify-center gap-2"
        >
          <MdArrowBack className="text-xl" />
          VOLVER
        </button>
        <button
          onClick={handleCancelClaim}
          disabled={isConfirming || isCanceling}
          className="cursor-pointer w-full bg-theme-warning hover:bg-theme-warning/80 text-white font-bold py-4 rounded-lg flex items-center justify-center gap-2 transition-all disabled:opacity-50 mt-2"
        >
          {isCanceling ? (
            <span className="w-5 h-5 border-2 border-red-500/30 border-t-red-500 rounded-full animate-spin" />
          ) : (
            <MdClose className="text-xl" />
          )}
          {isCanceling ? "CANCELANDO..." : "CANCELAR CANJE"}
        </button>
      </div>

      <div className="mt-auto text-center px-4">
        <p className="text-white/80 text-sm font-medium italic">
          "Sigue sumando puntos y alcanza nuevas metas con nosotros."
        </p>
      </div>
    </div>
  );
}
