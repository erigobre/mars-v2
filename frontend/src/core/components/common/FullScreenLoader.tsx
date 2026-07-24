import React, { useMemo } from "react";
import Logo from "./Logo";
import { useLocation } from "react-router-dom";
import BottomDecoration from "./BottomDecoration";

interface FullScreenLoaderProps {
  title?: string;
  subtitle?: string;
}

export const FullScreenLoader: React.FC<FullScreenLoaderProps> = ({
  title = "Cargando...",
  subtitle = "Por favor, espera un momento...",
}) => {
  const location = useLocation();

  const currentBackgroundColor = useMemo(() => {
    if (location.pathname.includes("/home")) return "var(--theme-primary)";
    if (location.pathname.includes("/rewards")) return "var(--theme-secondary)";
    if (location.pathname.includes("/ranking")) return "var(--theme-accent)";
    return "var(--theme-primary)";
  }, [location.pathname]);

  return (
    <div
      style={{ backgroundColor: currentBackgroundColor }}
      className="font-sans antialiased flex items-center justify-center min-h-screen relative overflow-hidden inset-0 z-50"
    >
      <BottomDecoration />

      <div className="absolute -top-32 -left-32 w-96 h-96 bg-white/10 rounded-full blur-[100px] pointer-events-none"></div>
      <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-black/20 rounded-full blur-[100px] pointer-events-none"></div>

      <div className="relative flex min-h-screen w-full flex-col items-center justify-center p-6 z-10">
        <div className="flex w-full max-w-md flex-col gap-10 items-center">
          <div className="flex items-center justify-center animate-slide-up">
            <Logo className="text-6xl md:text-7xl text-white drop-shadow-xl text-center" />
          </div>

          <div className="flex flex-col items-center justify-center gap-3 animate-slide-up delay-100">
            <h1 className="text-3xl font-bold leading-tight text-center text-white tracking-wide">
              {title}
            </h1>
            <p className="text-lg font-medium leading-normal text-center text-white/80 animate-pulse">
              {subtitle}
            </p>
          </div>

          <div className="flex flex-col w-full gap-2 mt-4 animate-slide-up delay-200">
            <div className="rounded-full w-full h-3 overflow-hidden bg-black/20 backdrop-blur-sm shadow-inner relative">
              <div className="h-full bg-white rounded-full absolute top-0 animate-slide-right">
                <div className="absolute top-0 right-0 bottom-0 w-12 bg-linear-to-l from-white/80 to-transparent blur-[2px]"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
