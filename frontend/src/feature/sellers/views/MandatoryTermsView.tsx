import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/core/components/ui";
import { useAcceptTermsMutation } from "../services/sellerServices";
import Swal from "sweetalert2";
import {
  MdLogout,
  MdGavel,
  MdPrivacyTip,
  MdCheck,
} from "react-icons/md";
import { useAuthStore } from "@/core/stores/authStore";
import TermsContent from "../components/common/TermsContent";
import PrivacyContent from "../components/common/PrivacyContent";

type TabKey = "terms" | "privacy";

const TABS: {
  key: TabKey;
  label: string;
  icon: typeof MdGavel;
  url: string;
}[] = [
  {
    key: "terms",
    label: "Términos y Condiciones",
    icon: MdGavel,
    url: "/terms",
  },
  {
    key: "privacy",
    label: "Aviso de Privacidad",
    icon: MdPrivacyTip,
    url: "/privacy",
  },
];

export default function MandatoryTermsView() {
  const navigate = useNavigate();
  const { updateUser, logout } = useAuthStore();
  const { mutate: accept, isPending } = useAcceptTermsMutation();

  const [activeTab, setActiveTab] = useState<TabKey>("terms");
  const [scrolledToBottom, setScrolledToBottom] = useState<
    Record<TabKey, boolean>
  >({
    terms: false,
    privacy: false,
  });

  const contentRef = useRef<HTMLDivElement>(null);

  const handleScroll = () => {
    if (!contentRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = contentRef.current;
    if (scrollTop + clientHeight >= scrollHeight - 24) {
      setScrolledToBottom((prev) => ({ ...prev, [activeTab]: true }));
    }
  };

  // Auto-detect if content fits without scrolling
  useEffect(() => {
    if (!contentRef.current) return;
    const { scrollHeight, clientHeight } = contentRef.current;
    if (scrollHeight <= clientHeight) {
      setScrolledToBottom((prev) => ({ ...prev, [activeTab]: true }));
    }
  }, [activeTab]);

  // Reset scroll position when tab changes
  useEffect(() => {
    if (contentRef.current) {
      contentRef.current.scrollTop = 0;
    }
  }, [activeTab]);

  const bothRead = scrolledToBottom.terms && scrolledToBottom.privacy;

  const handleAccept = () => {
    accept(undefined, {
      onSuccess: (updatedUser) => {
        if (updatedUser) updateUser(updatedUser);
        Swal.fire({
          icon: "success",
          title: "¡Documentos aceptados!",
          text: "Bienvenido a la plataforma.",
          timer: 1500,
          showConfirmButton: false,
        });
        navigate("/home", { replace: true });
      },
      onError: () => {
        Swal.fire(
          "Error",
          "No se pudieron aceptar los términos. Intenta de nuevo.",
          "error",
        );
      },
    });
  };

  const handleDecline = () => {
    Swal.fire({
      title: "¿Estás seguro?",
      text: "Debes aceptar los documentos para usar la plataforma. Si no aceptas, cerraremos tu sesión.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Sí, cerrar sesión",
      cancelButtonText: "Volver a leer",
    }).then(async (result) => {
      if (result.isConfirmed) {
        await logout();
        navigate("/");
      }
    });
  };

  const hasScrolledCurrent = scrolledToBottom[activeTab];

  return (
    <div className="w-full max-w-4xl mx-auto h-[calc(100dvh-2rem)] sm:h-[calc(100dvh-5rem)] flex flex-col bg-black/20 backdrop-blur-md rounded-3xl shadow-2xl border border-white/20 overflow-hidden">
      {/* ── Header ── */}
      <div className="shrink-0 px-5 md:px-8 pt-6 pb-0">
        <div className="mb-1">
          <span className="text-white/60 text-xs font-bold uppercase tracking-widest">
            Acción requerida
          </span>
        </div>
        <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
          Lee y acepta los documentos
        </h1>
        <p className="text-white/70 text-sm mt-0.5 hidden sm:block">
          Debes leer ambos documentos hasta el final antes de continuar.
        </p>

        {/* ── Tab navigation ── */}
        <div className="flex gap-1 mt-4 bg-black/20 p-1 rounded-2xl">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.key;
            const isRead = scrolledToBottom[tab.key];
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-sm font-bold transition-all ${
                  isActive
                    ? "bg-white text-gray-900 shadow-md"
                    : "text-white/70 hover:text-white hover:bg-white/10"
                }`}
              >
                <Icon className="text-base shrink-0" />
                <span className="hidden sm:inline truncate">{tab.label}</span>
                {isRead && (
                  <span
                    className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${
                      isActive
                        ? "bg-green-500 text-white"
                        : "bg-green-500/80 text-white"
                    }`}
                  >
                    <MdCheck className="text-xs" />
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* ── Link to full page ── */}
        <div className="flex items-center justify-between mt-3 mb-1 px-0.5">
          <span className="text-white/50 text-xs">
            {!hasScrolledCurrent
              ? "Desplázate hasta el final para marcar como leído"
              : "✓ Leído"}
          </span>
        </div>
      </div>

      {/* ── Scrollable content ── */}
      <div
        ref={contentRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto px-5 md:px-8 py-4
          [&::-webkit-scrollbar]:w-1.5
          [&::-webkit-scrollbar-track]:bg-transparent
          [&::-webkit-scrollbar-thumb]:bg-white/20
          [&::-webkit-scrollbar-thumb]:rounded-full
          hover:[&::-webkit-scrollbar-thumb]:bg-white/40"
      >
        {activeTab === "terms" ? <TermsContent /> : <PrivacyContent />}
      </div>

      {/* ── Footer / Actions ── */}
      <div className="shrink-0 bg-white border-t border-gray-200 z-10">
        {/* Progress indicators */}
        <div className="px-4 md:px-6 pt-3 pb-1 flex items-center gap-4">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const isRead = scrolledToBottom[tab.key];
            return (
              <div key={tab.key} className="flex items-center gap-1.5 text-xs">
                <div
                  className={`w-4 h-4 rounded-full flex items-center justify-center ${
                    isRead
                      ? "bg-green-500 text-white"
                      : "bg-gray-200 text-gray-400"
                  }`}
                >
                  {isRead ? (
                    <MdCheck className="text-[10px]" />
                  ) : (
                    <Icon className="text-[10px]" />
                  )}
                </div>
                <span
                  className={
                    isRead ? "text-green-600 font-semibold" : "text-gray-400"
                  }
                >
                  {tab.label}
                </span>
              </div>
            );
          })}
        </div>

        <div className="p-4 md:p-5 flex flex-col md:flex-row justify-between items-center gap-3">
          <Button
            variant="ghost"
            onClick={handleDecline}
            className="text-rose-600 text-xs md:text-base hover:bg-rose-50 flex items-center gap-2 font-bold w-full md:w-auto justify-center order-2 md:order-1"
          >
            <MdLogout /> No Aceptar (Salir)
          </Button>

          <div className="flex flex-col items-center md:items-end w-full md:w-auto order-1 md:order-2">
            {!bothRead && (
              <span className="text-[10px] text-primary font-bold uppercase tracking-widest mb-1.5 animate-pulse text-center">
                ↓ Lee ambos documentos hasta el final ↓
              </span>
            )}
            <Button
              onClick={handleAccept}
              disabled={isPending || !bothRead}
              className={`text-xs md:text-base font-black tracking-widest w-full md:w-auto transition-all ${
                bothRead
                  ? "shadow-lg shadow-primary/30"
                  : "opacity-50 cursor-not-allowed"
              }`}
            >
              {isPending
                ? "Procesando..."
                : "He leído y acepto ambos documentos"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
