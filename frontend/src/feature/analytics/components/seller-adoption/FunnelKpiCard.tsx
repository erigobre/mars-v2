import React from "react";
import { pct } from "./utils";

export interface FunnelKpiProps {
  label: string;
  value: number;
  total: number;
  icon: React.ReactNode;
  colorClass: string;
  bgClass: string;
  borderClass: string;
  onClick?: () => void;
  active?: boolean;
}

export function FunnelKpiCard({
  label,
  value,
  total,
  icon,
  colorClass,
  bgClass,
  borderClass,
  onClick,
  active,
}: FunnelKpiProps) {
  const percentage = pct(value, total);
  return (
    <button
      onClick={onClick}
      className={`text-left p-5 rounded-2xl border transition-all duration-200 w-full
        ${active ? `${bgClass} ${borderClass} shadow-md` : "bg-white border-slate-100 hover:border-slate-200 shadow-sm"}
        ${onClick ? "cursor-pointer" : "cursor-default"}`}
    >
      <div className="flex items-start justify-between mb-3">
        <div
          className={`p-2.5 rounded-xl text-xl ${active ? "bg-white/50" : bgClass}`}
        >
          <span className={colorClass}>{icon}</span>
        </div>
        <span
          className={`text-xs font-black px-2.5 py-1 rounded-full ${active ? "bg-white/50 " + colorClass : "bg-slate-50 text-slate-500"}`}
        >
          {percentage}%
        </span>
      </div>
      <p
        className={`text-2xl font-black mt-1 ${active ? colorClass : "text-slate-900"}`}
      >
        {value.toLocaleString()}
      </p>
      <p
        className={`text-xs font-medium mt-0.5 leading-tight ${active ? colorClass + " opacity-80" : "text-slate-500"}`}
      >
        {label}
      </p>
      <div className="mt-3 h-1.5 w-full bg-black/10 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-700 ${active ? "bg-white/70" : colorClass.replace("text-", "bg-")}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </button>
  );
}
