// src/core/components/dashboard/DashboardHeader.tsx
import React from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  MdArrowBack,
  MdChevronRight,
  MdPerson,
  MdMenu,
} from "react-icons/md";

type HeaderProps = {
  breadcrumbs: any[];
  user: any;
  onOpenMenu: () => void;
};

export default function DashboardHeader({
  breadcrumbs,
  user,
  onOpenMenu,
}: HeaderProps) {
  const navigate = useNavigate();

  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 lg:px-8 z-10 shrink-0">
      <div className="flex items-center gap-3">

        <button
          onClick={onOpenMenu}
          className="lg:hidden p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <MdMenu size={24} />
        </button>

        {breadcrumbs.length > 1 && (
          <button
            onClick={() => navigate(-1)}
            className="hidden sm:flex p-1.5 rounded-full hover:bg-gray-100 text-gray-500 transition-colors border border-gray-200"
          >
            <MdArrowBack className="text-xl" />
          </button>
        )}

        <nav className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm text-slate-500 truncate">
          <Link to="/admin" className="hover:text-primary transition-colors">
            Inicio
          </Link>
          {breadcrumbs.map((step, index) => (
            <React.Fragment key={index}>
              <MdChevronRight className="text-slate-400 text-lg shrink-0" />
              {step.to ? (
                <Link
                  to={step.to}
                  className="hover:text-primary transition-colors truncate"
                >
                  {step.label}
                </Link>
              ) : (
                <span className="text-slate-900 font-medium truncate">
                  {step.label}
                </span>
              )}
            </React.Fragment>
          ))}
        </nav>
      </div>

      <div className="flex items-center gap-2 sm:gap-4">
        {/* <button className="relative p-2 text-gray-400 hover:text-primary transition-colors rounded-full hover:bg-gray-100">
          <MdNotifications className="text-2xl" />
          <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
        </button> */}

        <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-gray-200 overflow-hidden border border-gray-300 flex items-center justify-center">
          {user?.avatarThumbnail ? (
            <img
              src={user.avatarThumbnail}
              alt={user.username}
              className="w-full h-full object-cover"
            />
          ) : (
            <MdPerson className="text-gray-400 text-2xl" />
          )}
        </div>
      </div>
    </header>
  );
}
