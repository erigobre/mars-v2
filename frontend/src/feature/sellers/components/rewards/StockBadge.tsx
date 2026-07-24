import type { StockStatus } from "@/core/types";
import { MdInventory2, MdLocalFireDepartment, MdWarning } from "react-icons/md";


export default function StockBadge({ status, count }: { status: StockStatus; count?: number }) {
  if (status === "hot" && count !== undefined) {
    return (
      <span className="w-fit inline-flex items-center gap-1 px-4 py-0.5 rounded-full font-bold text-theme-secondary bg-theme-light-warning border border-theme-secondary">
        <MdLocalFireDepartment className="text-2xl" />
        <span className="pt-1">
        ¡Solo quedan {count}!
        </span>
      </span>
    );
  }
  if (status === "low") {
    return (
      <span className="w-fit inline-flex items-center gap-1 px-4 py-0.5 rounded-full font-bold text-orange-600 bg-orange-50 border border-orange-100">
        <MdWarning className="text-sm" />
        ¡Pocas unidades!
      </span>
    );
  }
  if (status === "available") {
    return (
      <span className="w-fit inline-flex items-center gap-1 px-4 py-0.5 rounded-full font-bold text-theme-primary bg-theme-light-accent border border-theme-primary">
        <MdInventory2 className="text-xl" />
        <span className="pt-1">Disponible</span>
      </span>
    );
  }
  return null;
}