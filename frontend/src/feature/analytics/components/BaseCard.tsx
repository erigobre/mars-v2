import { type ReactNode } from "react";

export default function BaseCard({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`
      bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow
        ${className}
      `}
    >
      {children}
    </div>
  );
}
