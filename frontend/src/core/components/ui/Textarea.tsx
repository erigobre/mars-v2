import { forwardRef } from "react";
import type { TextareaHTMLAttributes, ReactNode } from "react";
import type { FieldError } from "react-hook-form";

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: FieldError;
  leftIcon?: ReactNode;
  hint?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, leftIcon, hint, className = "", ...props }, ref) => {
    const hasError = !!error;

    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label className="text-sm font-semibold text-gray-800">{label}</label>
        )}

        <div className="relative flex">
          {leftIcon && (
            <span
              className={[
                "absolute left-4 top-4 text-xl",
                hasError ? "text-danger" : "text-primary",
              ].join(" ")}
            >
              {leftIcon}
            </span>
          )}

          <textarea
            ref={ref}
            className={[
              "w-full rounded-2xl px-4 py-4 text-base resize-none",
              "bg-gray-100 text-gray-800 placeholder:text-gray-400",
              "border-2 border-transparent transition-all duration-150",
              "focus:outline-none focus:border-primary focus:bg-white",
              hasError ? "border-danger bg-red-50" : "",
              leftIcon ? "pl-12" : "",
              className,
            ]
              .filter(Boolean)
              .join(" ")}
            {...props}
          />
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

Textarea.displayName = "Textarea";
