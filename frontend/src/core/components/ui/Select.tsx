import { forwardRef, type SelectHTMLAttributes } from "react";

export interface SelectOption {
  value: string | number;
  label: string;
  selected?: boolean;
}

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  hint?: string;
  leftIcon?: React.ReactNode;
  options?: SelectOption[];
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, hint, leftIcon, options, className, children, ...props }, ref) => {
    return (
      <div className="flex flex-col gap-2 relative">
        {label && (
          <label className="text-sm font-semibold text-gray-800">{label}</label>
        )}

        <select
          ref={ref}
          className={`w-full rounded-2xl px-4 py-4 text-base bg-gray-100 text-gray-800 border-2 transition-all focus:outline-none focus:bg-white ${
            error
              ? "border-red-400 focus:border-red-500"
              : "border-transparent focus:border-primary"
          } ${className || ""}`}
          {...props}
        >
          {
            options
              ? options.map((opt) => (
                  <option key={opt.value} value={opt.value} selected={opt.selected}>
                    {opt.label}
                  </option>
                ))
              : children /* Si no, permitimos que pasen <option> como children */
          }
        </select>

        {error && (
          <span className="text-sm text-red-500 font-medium">{error}</span>
        )}
        {hint && !error && (
          <span className="text-sm text-gray-500">{hint}</span>
        )}
      </div>
    );
  }
);

Select.displayName = "Select";
