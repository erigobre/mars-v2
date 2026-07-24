import { useNavigate } from "react-router-dom";
import { MdLogout, MdPerson } from "react-icons/md";
import Logo from "../common/Logo";
import type { NavItem } from "@/core/types";
import SidebarItem from "./SidebarItem";


type SidebarProps = {
  navItems: NavItem[];
  user: any;
  logout: () => void;
  isOpen: boolean;
  onClose: () => void;
};

export default function Sidebar({
  navItems,
  user,
  logout,
  isOpen,
  onClose,
}: SidebarProps) {
  const navigate = useNavigate();

  return (
    <>
      {/* Overlay para móviles */}
      <div
        className={`fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-40 transition-opacity lg:hidden ${
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={onClose}
      />

      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-[#1e293b] text-slate-300 flex flex-col shadow-xl transition-transform duration-300 transform lg:translate-x-0 lg:static lg:inset-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="h-20 flex items-center justify-center px-6 border-b border-slate-700/50 shrink-0">
          <Logo />
        </div>

        <nav className="flex-1 overflow-y-auto py-4 px-3 custom-scrollbar">
          {navItems.map((item, index) => (
            <SidebarItem
              key={index}
              item={item}
              onClose={onClose}
            />
          ))}
        </nav>

        <div className="p-4 border-t border-slate-700/50 overflow-hidden bg-slate-800/30">
          <button
            onClick={() => {
              navigate("profile");
              onClose();
            }}
            className="flex items-center gap-3 mb-4 px-2 cursor-pointer w-full hover:bg-slate-800/50 p-2 rounded-lg transition-colors"
          >
            <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center shrink-0 overflow-hidden border border-slate-600">
              {user?.avatarThumbnail ? (
                <img
                  src={user.avatarThumbnail}
                  alt={user.username}
                  className="w-full h-full object-cover"
                />
              ) : (
                <MdPerson className="text-2xl text-slate-400" />
              )}
            </div>
            <div className="flex flex-col min-w-0 flex-1 text-start">
              <span className="text-sm font-bold text-white truncate">
                {user?.username || "Admin"}
              </span>
              <span className="text-xs text-slate-400 truncate w-full block">
                {user?.email || "Cargando..."}
              </span>
            </div>
          </button>

          <button
            onClick={logout}
            className="w-full flex cursor-pointer items-center justify-center gap-2 px-3 py-2.5 text-sm font-medium text-red-400 hover:text-white hover:bg-red-500/20 rounded-lg transition-colors border border-transparent hover:border-red-500/30"
          >
            <MdLogout className="text-lg" />
            <span>Cerrar Sesión</span>
          </button>
        </div>
      </aside>
    </>
  );
}
