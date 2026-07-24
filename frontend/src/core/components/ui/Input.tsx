import { forwardRef } from "react";
import type { InputHTMLAttributes, ReactNode } from "react";
import type { FieldError } from "react-hook-form";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: FieldError;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  hint?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    { label, error, leftIcon, rightIcon, hint, className = "", ...props },
    ref
  ) => {
    const hasError = !!error;

    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label className="text-sm font-semibold text-gray-800">
            {label}
          </label>
        )}

        <div className="relative flex items-center">
          {leftIcon && (
            <span
              className={[
                "absolute left-4 text-xl",
                hasError ? "text-danger" : "text-theme-primary",
              ].join(" ")}
            >
              {leftIcon}
            </span>
          )}

          <input
            ref={ref}
            className={[
              "w-full rounded-2xl px-4 py-4 text-base",
              "bg-gray-100",
              "text-gray-800",
              "placeholder:text-gray-400",
              "border-2 border-transparent",
              "transition-all duration-150",
              "focus:outline-none focus:border-primary focus:bg-white",
              hasError ? "border-danger bg-red-50" : "",
              leftIcon ? "pl-12" : "",
              rightIcon ? "pr-12" : "",
              className,
            ]
              .filter(Boolean)
              .join(" ")}
            {...props}
          />

          {rightIcon && (
            <span className="absolute right-4 text-xl text-gray-400 cursor-pointer flex items-center justify-center">
              {rightIcon}
            </span>
          )}
        </div>

        {hasError && (
          <p className="text-xs text-danger font-medium px-1">
            {error.message}
          </p>
        )}

        {hint && !hasError && (
          <p className="text-xs text-gray-400 px-1">{hint}</p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";
