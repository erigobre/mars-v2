import { useState, useEffect } from "react";
import {
  MdPeople,
  MdBlock,
  MdCheckCircle,
  MdWarning,
  MdSearch,
  MdDownload,
  MdClear,
  MdFilterAlt,
  MdChevronLeft,
  MdChevronRight,
} from "react-icons/md";
import { usePublicDistributorsQuery } from "@/feature/auth/services/authServices";
import { Select } from "@/core/components/ui";
import { Input } from "@/core/components/ui/Input";
import { Button } from "@/core/components/ui/Button";
import { formatDate, formatDateTime } from "@/core/utils/formatDate";
import api from "@/core/api/axios";

// ── Types para la lista ───────────────────────────────────────────

export type AdoptionStatus = "sin_ingreso" | "acepto_tyc" | "no_acepto_tyc";

export interface SellerStatusItem {
  sellerId: number;
  employeeCode: string | null;
  name: string;
  email: string | null;
  phone: string | null;
  distributorId: number;
  distributorName: string | null;
  status: AdoptionStatus;
  statusLabel: string;
  termsAccepted: boolean;
  lastLoginAt: string | null;
  registeredAt: string | null;
  currentPoints: number;
}

export interface StatusSummary {
  total: number;
  sinIngreso: number;
  aceptoTyc: number;
  noAceptoTyc: number;
}

export interface StatusListResponse {
  items: SellerStatusItem[];
  meta: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from: number | null;
    to: number | null;
  };
  summary: StatusSummary;
}

// ── Status badge ──────────────────────────────────────────────────

const STATUS_CONFIG: Record<AdoptionStatus, { label: string; bg: string; text: string; dot: string }> = {
  sin_ingreso:   { label: "Sin Ingreso",    bg: "bg-red-50",     text: "text-red-600",     dot: "bg-red-500"     },
  acepto_tyc:    { label: "Aceptó TyC",     bg: "bg-emerald-50", text: "text-emerald-600", dot: "bg-emerald-500" },
  no_acepto_tyc: { label: "No Aceptó TyC",  bg: "bg-amber-50",   text: "text-amber-600",   dot: "bg-amber-500"   },
};

export function StatusBadge({ status }: { status: AdoptionStatus }) {
  const cfg = STATUS_CONFIG[status];
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${cfg.bg} ${cfg.text}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
      {cfg.label}
    </span>
  );
}

// ── Summary cards (lista) ─────────────────────────────────────────

export function StatusSummaryCards({
  summary,
  active,
  onFilter,
}: { summary: StatusSummary; active: string; onFilter: (s: string) => void }) {
  const cards = [
    { key: "",              label: "Total",          value: summary.total,       icon: MdPeople,        bg: "bg-slate-50",    border: "border-slate-200",  text: "text-slate-700",   iconBg: "bg-slate-200 text-slate-600"    },
    { key: "sin_ingreso",   label: "Sin Ingreso",    value: summary.sinIngreso,  icon: MdBlock,         bg: "bg-red-50",      border: "border-red-200",    text: "text-red-700",     iconBg: "bg-red-100 text-red-500"        },
    { key: "no_acepto_tyc", label: "No Aceptó TyC",  value: summary.noAceptoTyc, icon: MdWarning,       bg: "bg-amber-50",    border: "border-amber-200",  text: "text-amber-700",   iconBg: "bg-amber-100 text-amber-500"    },
    { key: "acepto_tyc",    label: "Aceptó TyC",     value: summary.aceptoTyc,   icon: MdCheckCircle,   bg: "bg-emerald-50",  border: "border-emerald-200",text: "text-emerald-700", iconBg: "bg-emerald-100 text-emerald-500" },
  ];
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      {cards.map((c) => {
        const isActive = active === c.key;
        const pct = c.key && summary.total > 0 ? Math.round((c.value / summary.total) * 100) : null;
        return (
          <button
            key={c.key}
            onClick={() => onFilter(c.key)}
            className={`text-left p-4 rounded-2xl border transition-all duration-200 w-full
              ${isActive ? `${c.bg} ${c.border} shadow-md ring-2 ring-slate-200 ring-current ring-opacity-20` : "bg-white border-slate-100 hover:shadow-md shadow-sm"}
              ${c.key ? "cursor-pointer" : "cursor-default"}`}
          >
            <div className="flex items-start justify-between mb-3">
              <div className={`p-2 rounded-xl text-lg ${isActive ? c.iconBg : "bg-slate-100 text-slate-500"}`}>
                <c.icon />
              </div>
              {pct !== null && (
                <span className={`text-xs font-black px-2 py-0.5 rounded-full ${isActive ? `${c.bg} ${c.text}` : "bg-slate-50 text-slate-400"}`}>
                  {pct}%
                </span>
              )}
            </div>
            <p className={`text-2xl font-black ${isActive ? c.text : "text-slate-900"}`}>{c.value.toLocaleString()}</p>
            <p className={`text-xs font-medium mt-0.5 ${isActive ? c.text : "text-slate-500"}`}>{c.label}</p>
          </button>
        );
      })}
    </div>
  );
}

// ── Lista de vendedores ───────────────────────────────────────────

export function SellerStatusListTab() {
  const { data: distributorsData } = usePublicDistributorsQuery();
  const distributors = distributorsData ?? [];

  const [distributorId, setDistributorId] = useState("");
  const [statusFilter, setStatusFilter]   = useState("");
  const [searchInput, setSearchInput]     = useState("");
  const [search, setSearch]               = useState("");
  const [page, setPage]                   = useState(1);
  const [perPage, setPerPage]             = useState("50");

  const [data, setData]           = useState<StatusListResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  // Debounce
  useEffect(() => {
    const t = setTimeout(() => { setSearch(searchInput); setPage(1); }, 450);
    return () => clearTimeout(t);
  }, [searchInput]);

  // Fetch
  useEffect(() => {
    const fetch = async () => {
      setIsLoading(true);
      try {
        const params: Record<string, string | number> = { page, per_page: Number(perPage) };
        if (distributorId) params.distributor_id = distributorId;
        if (statusFilter)  params.status          = statusFilter;
        if (search)        params.search          = search;

        const { data: res } = await api.get("/dashboard/sellers/adoption/status-list", { params });
        setData(res.data);
      } finally {
        setIsLoading(false);
      }
    };
    fetch();
  }, [distributorId, statusFilter, search, page, perPage]);

  const applyFilter = (setter: (v: string) => void) => (v: string) => { setter(v); setPage(1); };

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const params: Record<string, string> = {};
      if (distributorId) params.distributor_id = distributorId;
      if (statusFilter)  params.status          = statusFilter;
      if (search)        params.search          = search;

      const response = await api.get("/dashboard/sellers/adoption/status-list/export", {
        params,
        responseType: "blob",
      });
      const url  = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href  = url;
      link.setAttribute("download", `vendedores_estado_${new Date().toISOString().slice(0, 10)}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } finally {
      setIsExporting(false);
    }
  };

  const hasFilters  = distributorId || statusFilter || searchInput;
  const clearAll    = () => { setDistributorId(""); setStatusFilter(""); setSearchInput(""); setSearch(""); setPage(1); };
  const sellers     = data?.items ?? [];
  const meta        = data?.meta;
  const summary     = data?.summary;

  return (
    <div className="space-y-5">

      {/* Summary cards */}
      {summary && (
        <StatusSummaryCards summary={summary} active={statusFilter} onFilter={applyFilter(setStatusFilter)} />
      )}

      {/* Filters + export */}
      <div className="bg-white border border-slate-100 rounded-2xl p-4 shadow-sm space-y-3">
        <div className="flex flex-col sm:flex-row gap-3 items-end justify-center">
          <div className="flex-1 min-w-0">
            <Input
              label="Buscar"
              placeholder="Nombre, email, teléfono o código…"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              leftIcon={<MdSearch />}
              className="py-3"
            />
          </div>
          <div className="w-full sm:w-60">
            <Select
              label="Distribuidor"
              value={distributorId}
              onChange={(e) => applyFilter(setDistributorId)(e.target.value)}
              options={[
                { value: "", label: "Todos los distribuidores" },
                ...distributors.map((d) => ({ value: String(d.id), label: d.companyName || `Distribuidor #${d.id}` })),
              ]}
            />
          </div>
          <div className="w-full sm:w-48">
            <Select
              label="Estado"
              value={statusFilter}
              onChange={(e) => applyFilter(setStatusFilter)(e.target.value)}
              options={[
                { value: "",              label: "Todos los estados" },
                { value: "sin_ingreso",   label: "Sin Ingreso"      },
                { value: "acepto_tyc",    label: "Aceptó TyC"       },
                { value: "no_acepto_tyc", label: "No Aceptó TyC"    },
              ]}
            />
          </div>
          {hasFilters && (
            <button onClick={clearAll} className="flex items-center gap-1 px-3 py-3 text-xs font-bold text-slate-500 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors shrink-0 self-end">
              <MdClear /> Limpiar
            </button>
          )}
          <Button
            variant="primary"
            size="sm"
            onClick={handleExport}
            loading={isExporting}
            leftIcon={<MdDownload />}
            className="shrink-0 self-end py-3"
          >
            Excel
          </Button>
        </div>

        {hasFilters && (
          <div className="flex items-center gap-2 pt-2 border-t border-slate-50">
            <MdFilterAlt className="text-primary text-sm shrink-0" />
            <p className="text-xs text-slate-500">
              Filtrando:{" "}
              {[
                searchInput && `"${searchInput}"`,
                distributorId && distributors.find((d) => String(d.id) === distributorId)?.companyName,
                { sin_ingreso: "Sin Ingreso", acepto_tyc: "Aceptó TyC", no_acepto_tyc: "No Aceptó TyC" }[statusFilter as keyof typeof STATUS_CONFIG],
              ].filter(Boolean).join(" · ")}
            </p>
          </div>
        )}
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">

        {/* Table header bar */}
        <div className="px-5 py-3 border-b border-slate-100 bg-slate-50/60 flex items-center justify-between">
          <p className="text-xs font-bold text-slate-500">
            {meta ? `${meta.from ?? 0}–${meta.to ?? 0} de ${meta.total.toLocaleString()} vendedores` : "Cargando…"}
          </p>
          <select
            value={perPage}
            onChange={(e) => { setPerPage(e.target.value); setPage(1); }}
            className="text-xs border border-slate-200 rounded-lg py-1 px-2 bg-white outline-none"
          >
            {["25", "50", "100"].map((v) => <option key={v} value={v}>{v} por página</option>)}
          </select>
        </div>

        {/* Desktop table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 border-b border-slate-100">
              <tr>
                {["Vendedor", "Email", "Teléfono", "Distribuidor", "Estado", "Último Acceso", "Registro", "Puntos"].map((h) => (
                  <th key={h} className="px-4 py-3 text-[10px] font-black text-slate-500 uppercase tracking-widest whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {isLoading ? (
                <tr><td colSpan={8} className="p-6">
                  <div className="space-y-2 animate-pulse">
                    {Array.from({ length: 6 }).map((_, i) => <div key={i} className="h-12 bg-slate-100 rounded-xl" />)}
                  </div>
                </td></tr>
              ) : sellers.length === 0 ? (
                <tr><td colSpan={8} className="py-16 text-center text-sm text-slate-400">
                  No se encontraron vendedores con los filtros aplicados.
                </td></tr>
              ) : sellers.map((seller) => (
                <tr key={seller.sellerId} className="hover:bg-slate-50/70 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center text-[10px] font-black shrink-0 uppercase">
                        {seller.name.slice(0, 2)}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-bold text-slate-900 truncate max-w-[140px]">{seller.name}</p>
                        {seller.employeeCode && <p className="text-[10px] text-slate-400">Cód: {seller.employeeCode}</p>}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3"><span className="text-xs text-slate-600 truncate block max-w-[180px]">{seller.email ?? "—"}</span></td>
                  <td className="px-4 py-3"><span className="text-xs text-slate-600 font-mono">{seller.phone ?? "—"}</span></td>
                  <td className="px-4 py-3"><span className="text-xs font-semibold text-slate-700 truncate block max-w-[140px]">{seller.distributorName ?? "—"}</span></td>
                  <td className="px-4 py-3"><StatusBadge status={seller.status} /></td>
                  <td className="px-4 py-3">
                    {seller.lastLoginAt ? (
                      <div>
                        <p className="text-xs text-slate-700">{formatDate(seller.lastLoginAt, { day: "2-digit", month: "short", year: "numeric" })}</p>
                        <p className="text-[10px] text-slate-400">{formatDateTime(seller.lastLoginAt, { hour: "2-digit", minute: "2-digit", hour12: false })}</p>
                      </div>
                    ) : <span className="text-xs text-red-400 font-medium italic">Nunca</span>}
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-xs text-slate-500">
                      {seller.registeredAt ? formatDate(seller.registeredAt, { day: "2-digit", month: "short", year: "numeric" }) : "—"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-xs font-black text-primary">{seller.currentPoints.toLocaleString()}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile cards */}
        <div className="md:hidden p-4 space-y-3">
          {isLoading ? (
            <div className="space-y-2 animate-pulse">{Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-28 bg-slate-100 rounded-2xl" />)}</div>
          ) : sellers.map((seller) => (
            <div key={seller.sellerId} className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
              <div className="px-4 pt-4 pb-3 border-b border-slate-50 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-black uppercase shrink-0">
                    {seller.name.slice(0, 2)}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-900">{seller.name}</p>
                    {seller.employeeCode && <p className="text-[10px] text-slate-400">Cód: {seller.employeeCode}</p>}
                  </div>
                </div>
                <StatusBadge status={seller.status} />
              </div>
              <div className="px-4 py-3 space-y-2">
                {[
                  { label: "Distribuidor", value: seller.distributorName ?? "—" },
                  { label: "Email",        value: seller.email ?? "—" },
                  { label: "Teléfono",     value: seller.phone ?? "—" },
                  { label: "Último acceso", value: seller.lastLoginAt ? formatDate(seller.lastLoginAt, { day: "2-digit", month: "short", year: "numeric" }) : "Nunca" },
                  { label: "Puntos",       value: `${seller.currentPoints.toLocaleString()} pts` },
                ].map((row) => (
                  <div key={row.label} className="flex items-center justify-between gap-4">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide shrink-0">{row.label}</span>
                    <span className="text-xs text-slate-700 text-right truncate max-w-[180px]">{row.value}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Pagination */}
        {meta && meta.last_page > 1 && (
          <div className="px-5 py-4 border-t border-slate-100 flex items-center justify-between gap-3">
            <p className="text-xs text-slate-500">Página {meta.current_page} de {meta.last_page}</p>
            <div className="flex items-center gap-1">
              <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={meta.current_page === 1}
                className="w-8 h-8 flex items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:border-primary hover:text-primary disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
                <MdChevronLeft />
              </button>
              {Array.from({ length: Math.min(meta.last_page, 5) }, (_, i) => {
                const p = meta.last_page <= 5 ? i + 1
                  : meta.current_page <= 3 ? i + 1
                  : meta.current_page >= meta.last_page - 2 ? meta.last_page - 4 + i
                  : meta.current_page - 2 + i;
                const isActive = p === meta.current_page;
                return (
                  <button key={p} onClick={() => setPage(p)}
                    className={`w-8 h-8 flex items-center justify-center rounded-lg text-xs font-bold transition-all
                      ${isActive ? "bg-primary text-white shadow-md shadow-primary/30" : "border border-slate-200 text-slate-600 hover:border-primary hover:text-primary"}`}>
                    {p}
                  </button>
                );
              })}
              <button onClick={() => setPage((p) => Math.min(meta.last_page, p + 1))} disabled={meta.current_page === meta.last_page}
                className="w-8 h-8 flex items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:border-primary hover:text-primary disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
                <MdChevronRight />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
