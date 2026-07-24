import {
  MdPerson,
  MdCheckCircle,
  MdCancel,
  MdAdminPanelSettings,
  MdStore,
  MdStorefront,
} from "react-icons/md";
import { Skeleton } from "@/core/components/ui/Skeleton/Skeleton";
import { useProfileQuery } from "../services/profileServices";

export default function ProfileAvatarCard() {
  const { data: profile, isLoading } = useProfileQuery();

  if (isLoading) {
    return <Skeleton className="h-80 w-full rounded-2xl" />;
  }

  if (!profile) return null;

  const getRoleBadge = (role?: string) => {
    switch (role) {
      case "admin":
        return {
          text: "Administrador",
          icon: <MdAdminPanelSettings className="text-lg" />,
          color: "bg-purple-100 text-purple-700 border-purple-200",
        };
      case "distributor":
        return {
          text: "Distribuidor",
          icon: <MdStore className="text-lg" />,
          color: "bg-indigo-100 text-indigo-700 border-indigo-200",
        };
      case "seller":
        return {
          text: "Vendedor",
          icon: <MdStorefront className="text-lg" />,
          color: "bg-blue-100 text-blue-700 border-blue-200",
        };
      default:
        return {
          text: "Usuario",
          icon: <MdPerson className="text-lg" />,
          color: "bg-gray-100 text-gray-700 border-gray-200",
        };
    }
  };

  const badge = getRoleBadge(profile.role);
  const imageUrl = profile.avatarUrl || profile.avatarThumbnail;

  return (
    <div className="bg-white rounded-2xl md:rounded-xl shadow-sm border border-slate-200 p-6 md:p-8 flex flex-col items-center text-center">
      <div className="w-32 h-32 rounded-full bg-slate-50 border-4 border-white shadow-lg flex items-center justify-center overflow-hidden mb-5 relative">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={profile.username}
            className="w-full h-full object-cover"
          />
        ) : (
          <MdPerson className="text-6xl text-slate-300" />
        )}
      </div>

      <h2 className="text-2xl font-bold text-slate-900 mb-1">
        {profile.companyName || profile.username || "Usuario"}
      </h2>

      {profile.companyName && profile.username && (
        <p className="text-sm font-medium text-slate-600 mb-1">
          Representante: {profile.username}
        </p>
      )}

      <p className="text-slate-500 font-medium mb-4">{profile.email}</p>

      <div className="flex flex-wrap items-center justify-center gap-2 w-full mt-2">
        <span
          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-sm font-bold border ${badge.color}`}
        >
          {badge.icon}
          {badge.text}
        </span>

        {profile.isActive !== undefined && (
          <span
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-sm font-bold border ${
              profile.isActive
                ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                : "bg-slate-100 text-slate-600 border-slate-200"
            }`}
          >
            {profile.isActive ? (
              <MdCheckCircle className="text-lg" />
            ) : (
              <MdCancel className="text-lg" />
            )}
            {profile.isActive ? "Cuenta Activa" : "Inactiva"}
          </span>
        )}
      </div>

      {profile.role === "seller" && profile.currentPoints !== undefined && (
        <div className="w-full mt-8 pt-6 border-t border-slate-100">
          <div className="flex justify-between items-center mb-3">
            <span className="text-slate-500 text-sm font-bold uppercase tracking-wider">
              Código
            </span>
            <span className="font-mono font-bold text-slate-900 bg-slate-100 px-2 py-1 rounded">
              {profile.employeeCode}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-slate-500 text-sm font-bold uppercase tracking-wider">
              Puntos Actuales
            </span>
            <span className="font-black text-amber-500 text-lg">
              {profile.currentPoints.toLocaleString()} pts
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
