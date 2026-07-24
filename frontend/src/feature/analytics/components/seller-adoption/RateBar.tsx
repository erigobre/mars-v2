export interface RateBarProps {
  label: string;
  value: number;
  color: string;
  tooltip?: string;
}

export function RateBar({ label, value, color }: RateBarProps) {
  return (
    <div className="flex items-center gap-3">
      <span className="text-xs text-slate-600 w-36 shrink-0">{label}</span>
      <div className="flex-1 h-2.5 bg-slate-100 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{ width: `${value}%`, backgroundColor: color }}
        />
      </div>
      <span className="text-xs font-black text-slate-900 w-10 text-right">
        {value}%
      </span>
    </div>
  );
}
