import { useState } from "react";
import {
  MdArrowBack,
  MdSettingsSuggest,
  MdPerson,
  MdHistoryEdu,
  MdInventory2,
  MdTaskAlt,
  MdBlock,
  MdEdit,
  MdCall,
  MdImage,
  MdOutlineDescription,
  MdCategory,
  MdBadge,
  MdStars,
  MdLocalShipping,
  MdOutlinePinDrop,
} from "react-icons/md";
import { useNavigate, useParams, Link } from "react-router-dom";
import Swal from "sweetalert2";

import { Button } from "@/core/components/ui";
import { formatDateTime } from "@/core/utils/formatDate";
import { CLAIM_STATUS_CONFIG } from "../constants/claimStatusStyles";
import RewardClaimStatusDrawer from "../components/RewardClaimStatusDrawer";
import RewardClaimDetailsSkeleton from "../components/RewardClaimDetailsSkeleton";

// Servicios
import {
  useRewardClaimDetailsQuery,
  useUpdateRewardClaimMutation,
} from "../services/rewardClaimServices";
import { useAuthStore } from "@/core/stores/authStore";

export default function RewardClaimDetailView() {
  const user = useAuthStore((state) => state.user);
  const isAdmin = user?.role === "admin";
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const {
    data: claim,
    isLoading,
    isError,
    isFetching,
  } = useRewardClaimDetailsQuery(Number(id));

  const { mutate: updateStatus } = useUpdateRewardClaimMutation();

  if (isLoading || isFetching) return <RewardClaimDetailsSkeleton />;

  if (isError || !claim) {
    return (
      <div className="flex-1 flex items-center justify-center h-[60vh]">
        <div className="text-center space-y-4">
          <h2 className="text-2xl font-bold text-slate-800">
            Canje no encontrado
          </h2>
          <p className="text-slate-500">
            Hubo un error al cargar los detalles o el registro no existe.
          </p>
          <Link
            to=".."
            relative="path"
            className="text-primary hover:underline font-bold"
          >
            Volver al listado
          </Link>
        </div>
      </div>
    );
  }

  // Lógica de Aprobación rápida
  const handleApprove = () => {
    Swal.fire({
      title: "¿Aprobar Canje?",
      text: `Se confirmará el canje del premio "${claim.reward.name}"`,
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Sí, aprobar",
      confirmButtonColor: "#10b981", // Emerald 500
      reverseButtons: true,
    }).then((result) => {
      if (result.isConfirmed) {
        updateStatus({
          id: claim.id,
          data: {
            status: "approved",
            notes: "Aprobado desde vista de detalles.",
          },
        });
      }
    });
  };

  // Lógica de Rechazo con notas obligatorias
  const handleReject = async () => {
    const { value: notes } = await Swal.fire({
      title: "Rechazar Solicitud",
      input: "textarea",
      inputLabel: "Motivo del rechazo (obligatorio)",
      inputPlaceholder: "Explica brevemente por qué no procede...",
      showCancelButton: true,
      confirmButtonColor: "#ef4444", // Red 500
      confirmButtonText: "Confirmar rechazo",
      cancelButtonText: "Cancelar",
      inputValidator: (value) => {
        if (!value) return "Debes proporcionar una razón para el rechazo";
      },
    });

    if (notes) {
      updateStatus({
        id: claim.id,
        data: { status: "rejected", notes },
      });
    }
  };

  const config = CLAIM_STATUS_CONFIG[claim.status] || {
    container: "bg-gray-100 text-gray-600",
    dot: "bg-gray-400",
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-3xl md:text-4xl font-black tracking-tight text-gray-900">
              Canje #REC-{claim.id}
            </h1>
            <span
              className={`inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest border shadow-sm ${config.container}`}
            >
              <span
                className={`w-2 h-2 rounded-full animate-pulse ${config.dot}`}
              />
              {claim.statusLabel}
            </span>
          </div>
          <div className="flex items-center gap-4 text-gray-500 font-medium text-sm">
            <span className="flex items-center gap-1.5">
              <MdHistoryEdu className="text-primary" />{" "}
              {formatDateTime(claim.createdAt)}
            </span>
            <span className="hidden md:inline text-gray-300">|</span>
            <span className="font-mono text-xs bg-gray-100 px-2 py-0.5 rounded text-gray-600 uppercase">
              Folio: {claim.folio}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 font-bold"
          >
            <MdArrowBack /> Regresar
          </Button>
          <Button
            onClick={() => setIsDrawerOpen(true)}
            className="flex items-center gap-2 shadow-lg shadow-primary/20 font-bold"
          >
            <MdSettingsSuggest className="text-lg" /> Gestionar
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <section className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-50 bg-gray-50/30 flex items-center gap-2">
              <MdPerson className="text-primary text-xl" />
              <h2 className="text-lg font-bold text-gray-900">
                Información del Vendedor
              </h2>
            </div>
            <div className="p-6">
              <div className="flex flex-col md:flex-row items-center gap-6">
                {/* Avatar con fallback */}
                <div className="relative">
                  <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-white shadow-lg bg-gray-100">
                    {claim.seller?.avatarUrl ? (
                      <img
                        src={claim.seller.avatarUrl}
                        alt={claim.seller.username}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-3xl font-black text-gray-300 uppercase">
                        {claim.seller?.username.charAt(0)}
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-6 text-center md:text-left w-full">
                  <div>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">
                      Nombre Completo
                    </p>
                    <p className="text-xl font-black text-gray-900">
                      {claim.seller?.username}
                    </p>
                    <p className="text-sm text-gray-500">
                      {claim.seller?.email}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">
                      Identificación
                    </p>
                    <div className="flex items-center justify-center md:justify-start gap-2">
                      <MdBadge className="text-primary" />
                      <span className="font-bold text-gray-700">
                        {claim.seller?.employeeCode || "N/A"}
                      </span>
                    </div>
                  </div>
                  {isAdmin && (
                    <div>
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">
                        Distribuidor
                      </p>
                      <p className="font-bold text-primary">
                        {claim.seller?.distributor?.companyName ||
                          "Independiente"}
                      </p>
                    </div>
                  )}
                  <div className="bg-primary/5 px-4 py-2 rounded-xl inline-block">
                    <p className="text-[10px] font-black text-primary uppercase tracking-widest mb-0.5">
                      Saldo Actual
                    </p>
                    <div className="flex items-center justify-center md:justify-start gap-1 text-primary">
                      <MdStars />
                      <span className="font-black">
                        {claim.seller?.currentPoints?.toLocaleString()} pts
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* SECCIÓN 2: Dirección de Envío (Nueva Card) */}
          <section className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-50 bg-gray-50/30 flex items-center gap-2">
              <MdLocalShipping className="text-primary text-xl" />
              <h2 className="text-lg font-bold text-gray-900">
                Logística de Entrega
              </h2>
            </div>
            <div className="p-6">
              {claim.shippingAddress ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <div className="flex gap-3">
                      <MdOutlinePinDrop className="text-2xl text-primary shrink-0 mt-1" />
                      <div>
                        <p className="text-sm font-bold text-gray-900">
                          {claim.shippingAddress.street}
                        </p>
                        <p className="text-sm text-gray-600">
                          Col. {claim.shippingAddress.colonia}
                        </p>
                        <p className="text-sm text-gray-600">
                          {claim.shippingAddress.city},{" "}
                          {claim.shippingAddress.state}, CP{" "}
                          {claim.shippingAddress.zip}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 text-sm">
                      <MdCall className="text-gray-400 text-2xl" />
                      <span className="font-medium text-gray-700">
                        {claim.seller?.phone || "Sin teléfono"}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-4">
                    {claim.carrier && claim.trackingNumber && (
                      <div className="bg-blue-50 border border-blue-100 p-4 rounded-xl">
                        <p className="text-[10px] font-black text-blue-800 uppercase tracking-widest mb-3 flex items-center gap-1">
                          <MdLocalShipping /> En tránsito
                        </p>
                        <div className="space-y-2">
                          <div className="flex justify-between items-center bg-white px-3 py-2 rounded-lg text-sm border border-blue-100/50">
                            <span className="text-gray-500 font-medium">
                              Paquetería:
                            </span>
                            <span className="font-bold text-gray-900">
                              {claim.carrier}
                            </span>
                          </div>
                          <div className="flex justify-between items-center bg-white px-3 py-2 rounded-lg text-sm border border-blue-100/50">
                            <span className="text-gray-500 font-medium">
                              Guía:
                            </span>
                            <span className="font-mono font-bold text-primary">
                              {claim.trackingNumber}
                            </span>
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="bg-amber-50 border border-amber-100 p-4 rounded-xl">
                      <p className="text-[10px] font-black text-amber-600 uppercase tracking-widest mb-2 flex items-center gap-1">
                        <MdHistoryEdu /> Notas de Entrega
                      </p>
                      <p className="text-xs text-amber-800 font-medium leading-relaxed italic">
                        {claim.shippingAddress.notes ||
                          "El usuario no proporcionó instrucciones adicionales para la entrega."}
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-4 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                  <p className="text-gray-500 font-medium">
                    Recogida programada en sucursal / Sin dirección
                  </p>
                </div>
              )}
            </div>
          </section>

          {/* Seguimiento Interno */}
          <section className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-50 bg-gray-50/30 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MdHistoryEdu className="text-primary text-xl" />
                <h2 className="text-lg font-bold text-gray-900">
                  Seguimiento Interno
                </h2>
              </div>
              <button
                onClick={() => setIsDrawerOpen(true)}
                className="text-xs font-black text-primary hover:underline flex items-center gap-1 uppercase tracking-widest"
              >
                <MdEdit /> Editar Notas
              </button>
            </div>
            <div className="p-6">
              <div className="bg-gray-50 p-6 rounded-2xl border-l-4 border-primary shadow-inner">
                <p className="italic text-gray-600 font-medium leading-relaxed">
                  {claim.notes ||
                    "No hay observaciones internas registradas para este canje."}
                </p>
              </div>
            </div>
          </section>
        </div>

        {/* Columna Derecha: Producto / Premio */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-xl overflow-hidden sticky top-6">
            <div className="px-6 py-4 border-b border-gray-50 bg-gray-50/30 flex items-center gap-2">
              <MdInventory2 className="text-primary text-xl" />
              <h2 className="text-lg font-bold text-gray-900">
                Premio Solicitado
              </h2>
            </div>
            <div className="p-6">
              <div className="aspect-square w-full rounded-2xl bg-gray-50 mb-6 overflow-hidden border border-gray-100 flex items-center justify-center relative group">
                {claim.reward.image ? (
                  <img
                    src={claim.reward.image}
                    alt={claim.reward.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                ) : (
                  <MdImage className="text-5xl text-gray-200" />
                )}
                <div className="absolute top-3 right-3 bg-white/90 backdrop-blur px-3 py-1 rounded-full shadow-sm flex items-center gap-1">
                  <MdCategory className="text-primary text-xs" />
                  <span className="text-[10px] font-black uppercase tracking-tight text-gray-700">
                    {claim.reward.category || "General"}
                  </span>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <h3 className="text-2xl font-black text-gray-900 leading-tight mb-2 uppercase">
                    {claim.reward.name}
                  </h3>
                  <div className="flex items-start gap-2 bg-gray-50 p-3 rounded-xl border border-gray-100">
                    <MdOutlineDescription className="text-gray-400 mt-1 shrink-0" />
                    <p className="text-xs text-gray-500 font-medium leading-relaxed">
                      {claim.reward.description ||
                        "Sin descripción disponible para este artículo."}
                    </p>
                  </div>
                  <p className="text-sm text-gray-500 font-medium leading-relaxed">
                    Este premio requiere de una validación de inventario antes
                    de proceder con el envío físico al vendedor.
                  </p>
                </div>

                <div className="pt-4 border-t border-gray-100 flex justify-between items-center">
                  <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                    Valor del Canje
                  </span>
                  <span className="text-2xl font-black text-gray-900">
                    {claim.pointsSpent.toLocaleString()}{" "}
                    <span className="text-sm text-primary">pts</span>
                  </span>
                </div>
              </div>
            </div>

            {/* Acciones Rápidas */}
            <div className="p-4 bg-gray-50 border-t border-gray-100 flex flex-col gap-3">
              {claim.status === "pending" || claim.status === "reserved" ? (
                <>
                  <Button
                    onClick={handleApprove}
                    className="w-full py-4 rounded-xl bg-gray-900 hover:bg-black text-white font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 shadow-lg transition-all active:scale-95"
                  >
                    <MdTaskAlt className="text-lg" /> Aprobar Canje
                  </Button>
                  <Button
                    variant="danger"
                    onClick={handleReject}
                    className="w-full py-4 rounded-xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 active:scale-95"
                  >
                    <MdBlock className="text-lg" /> Rechazar Solicitud
                  </Button>
                </>
              ) : (
                <div className="text-center p-2">
                  <p className="text-xs font-black text-gray-400 uppercase tracking-widest">
                    Estado finalizado
                  </p>
                  <p className="text-sm text-gray-500 font-medium mt-1">
                    No se requieren acciones adicionales.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <RewardClaimStatusDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        claim={claim}
      />
    </div>
  );
}
