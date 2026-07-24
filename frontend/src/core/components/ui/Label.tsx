import type { ReactNode } from "react";

export default function Label({ children } : { children: ReactNode }) {
  return (
    <label className="text-sm font-semibold text-gray-800">
      {children}
    </label>
  )
}
