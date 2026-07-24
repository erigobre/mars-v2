import { MdClose, MdPeople } from "react-icons/md";
import type { SellerDetail } from "../../schemas/sellerAdoptionSchemas";
import { fmtDate } from "./utils";

export type SegmentKey =
  | "neverLoggedIn"
  | "loggedNoTerms"
  | "acceptedTerms"
  | "activeInPeriod"
  | "registeredInPeriod";

const SEGMENT_LABELS: Record<SegmentKey, string> = {
  neverLoggedIn: "Nunca iniciaron sesión",
  loggedNoTerms: "Iniciaron sesión pero NO aceptaron T&C",
  acceptedTerms: "Aceptaron Términos y Condiciones",
  activeInPeriod: "Activos en el período",
  registeredInPeriod: "Registrados en el período",
};

const SEGMENT_COLORS: Record<SegmentKey, string> = {
  neverLoggedIn: "#E2E8F0",
  loggedNoTerms: "#F59E0B",
  acceptedTerms: "#10B981",
  activeInPeriod: "#2563EB",
  registeredInPeriod: "#6366F1",
};

export interface SellerListDrawerProps {
  segment: SegmentKey | null;
  sellers: SellerDetail[];
  onClose: () => void;
}

export function SellerListDrawer({
  segment,
  sellers,
  onClose,
}: SellerListDrawerProps) {
  if (!segment) return null;
  const label = SEGMENT_LABELS[segment];
  const color = SEGMENT_COLORS[segment];

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative w-full max-w-lg bg-white h-full shadow-2xl flex flex-col border-l border-gray-200 animate-slide-left">
        <div className="p-5 border-b border-gray-100 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <span
              className="w-3 h-10 rounded-full"
              style={{ backgroundColor: color }}
            />
            <div>
              <h3 className="text-base font-bold text-gray-900">{label}</h3>
              <p className="text-xs text-slate-500">
                {sellers.length} vendedor{sellers.length !== 1 ? "es" : ""}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
          >
            <MdClose className="text-xl" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto">
          {sellers.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-slate-400 gap-3">
              <MdPeople className="text-5xl opacity-20" />
              <p className="text-sm font-medium">
                Sin vendedores en este segmento
              </p>
            </div>
          ) : (
            <div className="divide-y divide-slate-50">
              {sellers.map((s) => (
                <div
                  key={s.sellerId}
                  className="px-5 py-3.5 hover:bg-slate-50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-black shrink-0">
                      {s.name.slice(0, 2).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-slate-900 truncate">
                        {s.name}
                      </p>
                      <p className="text-[10px] text-slate-500 truncate">
                        {s.distributorName ?? "Sin empresa"} ·{" "}
                        {s.employeeCode ?? "Sin código"}
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-[10px] text-slate-400">
                        {s.lastLoginAt
                          ? `Último: ${fmtDate(s.lastLoginAt)}`
                          : "Nunca"}
                      </p>
                      <p className="text-[10px] text-slate-400">
                        Reg: {fmtDate(s.registeredAt)}
                      </p>
                    </div>
                  </div>
                  {(s.email || s.phone) && (
                    <div className="ml-12 mt-1 flex gap-3">
                      {s.email && (
                        <span className="text-[10px] text-slate-400 truncate max-w-[150px]">
                          {s.email}
                        </span>
                      )}
                      {s.phone && (
                        <span className="text-[10px] text-slate-400">
                          {s.phone}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
