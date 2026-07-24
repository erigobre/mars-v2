import Logo from "@/core/components/common/Logo";
import type { NavItem } from "@/core/types";
import { MdLogout } from "react-icons/md";
import { NavLink } from "react-router-dom";

type DesktopNavbarProps = {
  navItems: NavItem[];
  onLogout: () => void;
  currentBackgroundColor: string
};

export default function DesktopNavbar({
  navItems,
  onLogout,
  currentBackgroundColor
}: DesktopNavbarProps) {
  return (
    <header
      style={{ backgroundColor: currentBackgroundColor }}
      className="hidden md:flex fixed top-0 left-0 right-0 z-30 border-b border-b-white shadow-sm shadow-white/20 items-center"
    >
      <div className="max-w-7xl mx-auto w-full px-6 flex items-center justify-between pb-1">
        <Logo />

        <nav className="flex items-center gap-1">
          {navItems.map((item) => {
            const Icon = item.icon;

            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === "/home"}
                className={({ isActive }) =>
                  `flex flex-col items-center px-4 pt-2 pb-1 gap-0.5 transition-colors",
                    ${
                      isActive
                        ? "text-white border-b-2 border-white"
                        : "text-gray-300 hover:text-white border-b-2 border-transparent"
                    }`
                }
              >
                <span className="text-2xl">
                  <Icon />
                </span>
                <span className="text-xs font-bold">{item.label}</span>
              </NavLink>
            );
          })}
        </nav>

        {/* Right actions */}
        <div className="flex items-center gap-3 pl-4 border-l border-gray-200">
          {/* <button className="relative p-2 rounded-full hover:bg-gray-100 transition-colors text-gray-500">
            <MdNotifications className="text-2xl" />
            <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white" />
          </button> */}

          <button
            onClick={onLogout}
            className="flex items-center gap-2 px-4 py-2 rounded-full cursor-pointer bg-white text-gray-800 hover:text-red-500 hover:bg-red-50 transition-colors text-sm font-semibold"
          >
            <span>Salir</span>
            <MdLogout className="text-lg" />
          </button>
        </div>
      </div>
    </header>
  );
}
