import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/core/components/ui/tooltip";
import React from "react";
import { MdInfoOutline } from "react-icons/md";

type ColorScheme =
  | "primary"
  | "emerald"
  | "orange"
  | "indigo"
  | "yellow"
  | "blue"
  | "tertiary"
  | "secondary";

interface MetricCardProps {
  variant?: "default" | "solid";
  title: string;
  value: React.ReactNode;
  subtitle?: React.ReactNode;
  icon: React.ReactNode;
  colorScheme?: ColorScheme;
  onClick?: () => void;
  tooltipInfo?: string;
}

export default function MetricCard({
  variant = "default",
  title,
  value,
  subtitle,
  icon,
  colorScheme = "primary",
  onClick,
  tooltipInfo,
}: MetricCardProps) {
  const defaultColors: Record<ColorScheme, string> = {
    primary: "bg-primary/10 text-primary",
    secondary: "bg-secondary-container/30 text-secondary",
    tertiary: "bg-tertiary/10 text-tertiary",
    emerald: "bg-emerald-50 text-emerald-600",
    orange: "bg-orange-50 text-orange-600",
    indigo: "bg-indigo-50 text-indigo-600",
    yellow: "bg-yellow-50 text-yellow-600",
    blue: "bg-blue-50 text-blue-600",
  };

  const solidColors: Record<
    ColorScheme,
    { container: string; title: string; value: string; icon: string }
  > = {
    yellow: {
      container: "bg-yellow-50 border-yellow-200 hover:bg-yellow-100",
      title: "text-yellow-800",
      value: "text-yellow-900",
      icon: "bg-yellow-200/50 text-yellow-700",
    },
    emerald: {
      container: "bg-emerald-50 border-emerald-200 hover:bg-emerald-100",
      title: "text-emerald-800",
      value: "text-emerald-900",
      icon: "bg-emerald-200/50 text-emerald-700",
    },
    blue: {
      container: "bg-blue-50 border-blue-200 hover:bg-blue-100",
      title: "text-blue-800",
      value: "text-blue-900",
      icon: "bg-blue-200/50 text-blue-700",
    },
    tertiary: {
      container: "bg-tertiary/10 border-tertiary/20 hover:bg-tertiary/20",
      title: "text-tertiary",
      value: "text-tertiary",
      icon: "bg-tertiary/20 text-tertiary",
    },
    // Fallbacks en caso de usar otros colores en modo solid
    primary: {
      container: "bg-blue-50 border-blue-200 hover:bg-blue-100",
      title: "text-blue-800",
      value: "text-blue-900",
      icon: "bg-blue-200/50 text-blue-700",
    },
    secondary: {
      container: "bg-slate-50 border-slate-200 hover:bg-slate-100",
      title: "text-slate-800",
      value: "text-slate-900",
      icon: "bg-slate-200/50 text-slate-700",
    },
    orange: {
      container: "bg-orange-50 border-orange-200 hover:bg-orange-100",
      title: "text-orange-800",
      value: "text-orange-900",
      icon: "bg-orange-200/50 text-orange-700",
    },
    indigo: {
      container: "bg-indigo-50 border-indigo-200 hover:bg-indigo-100",
      title: "text-indigo-800",
      value: "text-indigo-900",
      icon: "bg-indigo-200/50 text-indigo-700",
    },
  };

  const renderTitle = () => (
    <div className="flex items-center gap-1.5 mb-1">
      <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">
        {title}
      </p>
      {tooltipInfo && (
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              className="outline-none"
              onClick={(e) => e.stopPropagation()}
            >
              <MdInfoOutline className="text-slate-400 hover:text-slate-600 cursor-help" />
            </button>
          </TooltipTrigger>
          <TooltipContent className="bg-slate-800 text-white border-slate-700 max-w-50 text-center">
            <p className="text-[10px]">{tooltipInfo}</p>
          </TooltipContent>
        </Tooltip>
      )}
    </div>
  );

  if (variant === "solid") {
    const theme = solidColors[colorScheme];
    return (
      <div
        onClick={onClick}
        className={`p-4 rounded-xl border flex justify-between items-center group transition-colors ${
          onClick ? "cursor-pointer" : ""
        } ${theme.container}`}
      >
        <div>
          <p
            className={`text-xs font-bold uppercase tracking-wider ${theme.title}`}
          >
            {title}
          </p>
          <p className={`text-2xl font-black mt-1 ${theme.value}`}>{value}</p>
          {subtitle && <div className="mt-1">{subtitle}</div>}
        </div>
        <div
          className={`p-2 rounded-lg text-2xl flex items-center justify-center ${theme.icon}`}
        >
          {icon}
        </div>
      </div>
    );
  }

  // Variante Default (Blanca)
  return (
    <div
      onClick={onClick}
      className={`bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex items-center gap-4 ${
        onClick ? "cursor-pointer hover:bg-slate-50 transition-colors" : ""
      }`}
    >
      <div
        className={`w-12 h-12 rounded-lg flex items-center justify-center text-2xl ${defaultColors[colorScheme]}`}
      >
        {icon}
      </div>
      <div>
        {renderTitle()}
        <div className="text-xl md:text-2xl font-bold text-slate-900">
          {value}
        </div>
        {subtitle && <div className="mt-1">{subtitle}</div>}
      </div>
    </div>
  );
}
