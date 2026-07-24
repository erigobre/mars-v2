import type { ReactNode } from "react";

type StatusOptionProps = {
  icon: ReactNode;
  label: string;
  description: string;
  active: boolean;
  onClick: () => void;
  activeClass?: string;
  iconClass?: string;
};

export default function StatusOption({
  icon,
  label,
  description,
  active,
  onClick,
  activeClass = "border-primary bg-primary/5",
  iconClass = "bg-primary/10 text-primary",
}: StatusOptionProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex items-center justify-between p-4 rounded-2xl border-2 transition-all text-left group w-full ${
        active ? activeClass : "border-gray-100 bg-white hover:border-gray-200"
      }`}
    >
      <div className="flex items-center gap-4">
        <div
          className={`size-11 rounded-full flex items-center justify-center transition-colors ${
            active ? iconClass : "bg-gray-100 text-gray-400"
          }`}
        >
          {icon}
        </div>
        <div>
          <p className="font-black text-gray-900 text-sm leading-none">
            {label}
          </p>
          <p className="text-xs text-gray-500 mt-1 font-medium">
            {description}
          </p>
        </div>
      </div>
      <div
        className={`size-5 rounded-full border-2 transition-all flex items-center justify-center ${
          active ? "border-primary" : "border-gray-200"
        }`}
      >
        {active && <div className="size-2.5 rounded-full bg-primary" />}
      </div>
    </button>
  );
}
