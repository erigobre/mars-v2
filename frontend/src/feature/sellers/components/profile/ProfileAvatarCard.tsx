import { useAuthStore } from "@/core/stores/authStore";
import { MdPerson } from "react-icons/md";

export default function ProfileAvatarCard() {
  const user = useAuthStore((s) => s.user);

  return (
    <div className="bg-white rounded-2xl md:rounded-xl shadow-sm overflow-hidden">
      <div className="bg-primary h-28 md:h-32 relative"></div>

      <div className="px-6 pb-6 pt-0 relative flex flex-col items-center">
        <div className="relative -mt-14 md:-mt-16 mb-4">
          <div className="w-28 h-28 md:w-32 md:h-32 rounded-full border-4 border-white bg-gray-200 flex items-center justify-center overflow-hidden shadow-md">
            {user?.avatarThumbnail ? (
              <img
                src={user.avatarThumbnail}
                alt={`Foto de ${user.username}`}
                className="w-full h-full object-cover"
              />
            ) : (
              <MdPerson className="text-gray-400 text-6xl" />
            )}
          </div>
          {/* <button
            className="absolute bottom-0 right-0 bg-secondary text-white p-2 rounded-full hover:scale-105 transition-transform shadow-md border-2 border-white"
            aria-label="Cambiar foto"
          >
            <MdPhotoCamera className="text-lg" />
          </button> */}
        </div>

        <h2 className="text-xl font-bold text-gray-900 mb-1">
          {user?.username || "Juan Pérez"}
        </h2>
        <p className="text-gray-500 text-sm mb-6">
          {user?.email || "juan.perez@ejemplo.com"}
        </p>

        <div className="w-full border-t border-gray-100 pt-4 mt-2 space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-500">ID de Empleado</span>
            <span className="font-bold text-sm text-gray-800">EMP-10293</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-500">Miembro desde</span>
            <span className="font-bold text-sm text-gray-800">Marzo 2022</span>
          </div>
        </div>
      </div>
    </div>
  );
}
