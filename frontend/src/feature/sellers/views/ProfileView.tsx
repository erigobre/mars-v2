import { useState } from "react";
import { MdPerson, MdHistory, MdWarning } from "react-icons/md";
import { useProfileQuery } from "@/feature/profile/services/profileServices";

import ProfileHeader from "../components/profile/ProfileHeader";
import PersonalInfoForm from "../components/profile/PersonalInfoForm";
import RewardHistoryTable from "../components/profile/RewardHistoryTable";
import ProfileLoadingCard from "./ProfileLoadingCard";
import { useDeactivateAccountMutation } from "../services/sellerServices";
import Swal from "sweetalert2";
import { useAuthStore } from "@/core/stores/authStore";
import { Button } from "@/core/components/ui";

export default function ProfileView() {
  const { clearSession } = useAuthStore();
  const [activeTab, setActiveTab] = useState<"personal" | "history">(
    "personal"
  );
  const { data: profile, isLoading } = useProfileQuery();
  const { mutate: deactivate, isPending: isDeactivating } =
    useDeactivateAccountMutation();

  const handleDeactivateAccount = () => {
    Swal.fire({
      title: "¿Desactivar tu cuenta?",
      html: "Ya no podrás acceder a la plataforma ni canjear tus puntos.<br><br><b>Para recuperar tu cuenta en el futuro, deberás contactar directamente a tu distribuidor.</b>",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444", // Red 500
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Sí, desactivar cuenta",
      cancelButtonText: "Cancelar",
      reverseButtons: true,
    }).then((result) => {
      if (result.isConfirmed) {
        deactivate(undefined, {
          onSuccess: () => {
            Swal.fire(
              "Cuenta desactivada",
              "Tu sesión ha sido cerrada.",
              "success"
            ).then(() => {
              clearSession();
            });
          },
          onError: () => {
            Swal.fire(
              "Error",
              "Hubo un problema al desactivar tu cuenta. Intenta de nuevo.",
              "error"
            );
          },
        });
      }
    });
  };

  if (isLoading) {
    return <ProfileLoadingCard />;
  }

  return (
    <div className="w-full max-w-5xl mx-auto mt-4 md:mt-0 bg-white rounded-2xl md:rounded-3xl shadow-sm overflow-hidden border border-gray-100">
      <ProfileHeader profile={profile} />

      <div className="bg-white border-b border-gray-200 px-4 md:px-8 flex flex-row gap-6 md:gap-8 overflow-x-auto">
        <button
          onClick={() => setActiveTab("personal")}
          className={`py-3 md:py-4 px-1 text-sm md:text-base font-bold flex items-center gap-2 border-b-2 transition-colors whitespace-nowrap ${
            activeTab === "personal"
              ? "border-theme-primary text-theme-primary"
              : "border-transparent text-gray-400 hover:text-gray-600"
          }`}
        >
          <MdPerson className="text-lg md:text-xl" /> Información Personal
        </button>
        <button
          onClick={() => setActiveTab("history")}
          className={`py-3 md:py-4 px-1 text-sm md:text-base font-bold flex items-center gap-2 border-b-2 transition-colors whitespace-nowrap ${
            activeTab === "history"
              ? "border-theme-primary text-theme-primary"
              : "border-transparent text-gray-400 hover:text-gray-600"
          }`}
        >
          <MdHistory className="text-lg md:text-xl" /> Historial de Canjes
        </button>
      </div>

      <div className="bg-white p-4 md:p-12">
        {activeTab === "personal" && <PersonalInfoForm profile={profile} />}
        {activeTab === "history" && <RewardHistoryTable />}
      </div>

      <section className="bg-rose-50 border border-rose-100 rounded-2xl p-6 mt-12">
        <div className="flex items-center gap-2 mb-3">
          <MdWarning className="text-xl text-rose-600" />
          <h3 className="text-lg font-black text-rose-900">Desactivar mi cuenta</h3>
        </div>

        <p className="text-sm text-rose-700 leading-relaxed mb-6">
          Si decides desactivar tu cuenta, perderás el acceso inmediato a la
          plataforma y no podrás realizar nuevos canjes. Tus puntos y ventas
          quedarán congelados.{" "}
          <strong>
            Para reactivar tu cuenta y recuperar el acceso, tendrás que ponerte
            en contacto directamente con tu distribuidor.
          </strong>
        </p>

        <Button
          variant="danger"
          onClick={handleDeactivateAccount}
          disabled={isDeactivating}
          className="font-bold tracking-wide"
        >
          {isDeactivating ? "Procesando..." : "Desactivar mi cuenta"}
        </Button>
      </section>
    </div>
  );
}
