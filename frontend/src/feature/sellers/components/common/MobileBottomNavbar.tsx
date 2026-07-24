import type { NavItem } from "@/core/types";
import { NavLink } from "react-router-dom";

type MobileBottomNavbarProps = {
  navItems: NavItem[],
  currentBackgroundColor: string
};

export default function MobileBottomNavbar({ navItems, currentBackgroundColor }: MobileBottomNavbarProps) {
  return (
    <nav
      style={{ backgroundColor: currentBackgroundColor }}
      className="md:hidden fixed bottom-0 left-0 right-0 z-30 border-t border-white pt-2 pb-4"
    >
      <div className="flex justify-around items-center h-16 px-4">
        {navItems.map((item) => {
          const Icon = item.icon;

          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === "/home"}
              className={({ isActive }) =>
                [
                  "flex flex-col items-center justify-center gap-0.5 w-16 h-full transition-colors",
                  isActive ? "text-white" : "text-gray-300 hover:text-white",
                ].join(" ")
              }
            >
              {({ isActive }) => (
                <>
                  <span className="text-3xl">
                    <Icon />
                  </span>
                  <span className="text-sm font-semibold">{item.label}</span>
                  {isActive && (
                    <span className="w-5 h-1 bg-white rounded-full" />
                  )}
                </>
              )}
            </NavLink>
          )
        })}
      </div>
      <div className="h-1" />
    </nav>
  );
}
