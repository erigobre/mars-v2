import { useAuthStore } from "@/core/stores/authStore";
import { MdPerson, MdArrowBack, MdLogout } from "react-icons/md";
import { Link, useNavigate } from "react-router-dom";

type HomeHeaderProps = {
  mode: "home";
};

type PageHeaderProps = {
  mode: "page";
  title?: string;
  subtitle?: string;
  showBack?: boolean;
};

type AppHeaderProps = HomeHeaderProps | PageHeaderProps;

export function AppHeader(props: AppHeaderProps) {
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const navigate = useNavigate();

  const isHome = props.mode === "home";

  const handleLogout = () => logout();

  return (
    <div
      className={`${
        !isHome ? "mb-4" : ""
      } pt-12 pb-6 px-4 md:relative md:block md:px-0 md:mt-20`}
    >
      <div className="flex items-center justify-between md:justify-start md:gap-4 w-full max-w-7xl md:px-6 mx-auto">
        {isHome ? (
          /* --- MODO HOME: Info del Vendedor --- */
          <>
            <Link to="/profile" className="flex items-center gap-4 md:gap-4">
              <div className="rounded-full bg-gray-200 flex items-center justify-center overflow-hidden border-4 border-white shadow-sm shrink-0 w-16 h-16 md:shadow-md">
                {user?.avatarThumbnail ? (
                  <img
                    src={user.avatarThumbnail}
                    alt={user.username ?? "Vendedor"}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <MdPerson className="text-gray-400 text-4xl" />
                )}
              </div>

              <div>
                <p className="text-sm text-gray-300 font-medium leading-none md:leading-normal">
                  ¡Hola de nuevo!
                </p>
                <h2 className="text-2xl md:text-3xl font-bold md:font-extrabold text-white leading-tight">
                  {user?.username ?? "Vendedor"}
                </h2>
              </div>
            </Link>

            <div className="md:hidden ml-auto">
              {/* <button className="relative p-2 rounded-full bg-white/20 text-gray-900 hover:bg-gray-200 transition-colors">
                <MdNotifications className="text-3xl" />
                <span className="absolute top-1.5 right-1.5 w-3 h-3 bg-red-500 rounded-full border-2 border-white" />
              </button> */}
              <button
                onClick={handleLogout}
                className="relative p-2 rounded-full text-white hover:bg-gray-600 transition-colors"
              >
                <MdLogout className="text-2xl" />
              </button>
            </div>
          </>
        ) : (
          /* --- MODO PAGE: Título de Sección --- */
          <div className="flex items-center gap-4">
            {props.showBack && (
              <button
                onClick={() => navigate(-1)}
                className="p-2 -ml-2 rounded-full bg-white/20 md:bg-gray-100 text-gray-900 hover:bg-gray-200 transition-colors"
              >
                <MdArrowBack className="text-3xl" />
              </button>
            )}
            <div className="flex flex-col md:flex-row items-start md:items-end gap-2">
              <h1 className="font-heading text-5xl md:text-7xl text-white uppercase">
                {props.title}
              </h1>
              {props.subtitle && (
                <p className="md:text-base text-white font-extrabold">
                  {props.subtitle}
                </p>
              )}
            </div>
          </div>
        )}

        {/* Botón de Notificaciones (Visible en Home y Páginas en móvil) */}
      </div>
    </div>
  );
}
