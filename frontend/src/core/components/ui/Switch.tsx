import { forwardRef } from "react";
import type { FieldError } from "react-hook-form";

type SwitchProps = React.InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
  description?: string;
  error?: FieldError;
};

export const Switch = forwardRef<HTMLInputElement, SwitchProps>(
  ({ label, description, error ,className = "", ...props }, ref) => {

    const hasError = !!error;

    return (
      <div
        className={`flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100 ${className}`}
      >
        <div className="space-y-1 pr-4">
          {label && (
            <p className="text-sm font-semibold text-gray-900">{label}</p>
          )}
          {description && (
            <p className="text-xs text-gray-500">{description}</p>
          )}
        </div>
        <label className="relative inline-flex items-center cursor-pointer shrink-0">
          <input
            type="checkbox"
            className="sr-only peer"
            ref={ref}
            {...props}
          />
          <div
            className="
            w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full 
            rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] 
            after:absolute after:top-0.5 after:inset-s-0.5 after:bg-white after:border-gray-300 after:border 
            after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary
          "
          ></div>
        </label>

        {hasError && (
          <p className="text-xs text-danger font-medium px-1">
            {error.message}
          </p>
        )}
      </div>
    );
  }
);
Switch.displayName = "Switch";
