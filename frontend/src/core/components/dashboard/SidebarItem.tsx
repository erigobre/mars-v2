import type { NavItem } from "@/core/types";
import { useState } from "react";
import { MdKeyboardArrowDown } from "react-icons/md";
import { NavLink, useLocation } from "react-router-dom";

type SidebarItemProps = {
  item: NavItem;
  onClose: () => void;
};

export default function SidebarItem({ item, onClose }: SidebarItemProps) {
  const location = useLocation();

  const isChildActive = item.children?.some((child) =>
    location.pathname.includes(child.to)
  );

  const [isExpanded, setIsExpanded] = useState(isChildActive || false);

  const hasChildren = item.children && item.children.length > 0;


  if (hasChildren) {
    return (
      <div className="flex flex-col mb-1">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className={`flex items-center justify-between px-3 py-2.5 rounded-lg transition-colors w-full ${
            isChildActive
              ? "bg-slate-800/50 text-white"
              : "text-slate-400 hover:bg-slate-800/50 hover:text-white"
          }`}
        >
          <div className="flex items-center gap-3">
            <item.icon className="text-xl" />
            <span className="text-sm font-medium">{item.label}</span>
          </div>
          <MdKeyboardArrowDown
            className={`text-xl transition-transform duration-300 ${
              isExpanded ? "rotate-180" : ""
            }`}
          />
        </button>

        <div
          className={`grid transition-[grid-template-rows,opacity] duration-300 ease-in-out ${
            isExpanded
              ? "grid-rows-[1fr] opacity-100 mt-1"
              : "grid-rows-[0fr] opacity-0"
          }`}
        >
          <div className="overflow-hidden">
            <div className="flex flex-col py-1 pl-4 ml-5 border-l border-slate-700/70">
              {item.children!.map((child, idx) => (
                <NavLink
                  key={idx}
                  to={child.to}
                  end
                  onClick={onClose}
                  className={({ isActive }) =>
                    `block px-3 py-2 text-sm transition-colors rounded-lg ${
                      isActive
                        ? "text-white font-semibold"
                        : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/40"
                    }`
                  }
                >
                  {child.label}
                </NavLink>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <NavLink
      to={item.to}
      onClick={onClose}
      className={({ isActive }) =>
        `flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors mb-1 ${
          isActive
            ? "text-white font-semibold"
            : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/40"
        }`
      }
    >
      <item.icon className="text-xl" />
      <span className="text-sm font-medium">{item.label}</span>
    </NavLink>
  );
}
