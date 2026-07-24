import {
  MdPeople,
  MdLogin,
  MdGavel,
  MdBlock,
  MdTrendingUp,
  MdPerson,
  MdChevronRight,
} from "react-icons/md";
import { Select } from "@/core/components/ui";
import { Input } from "@/core/components/ui/Input";
import { FunnelKpiCard } from "./FunnelKpiCard";
import { AdoptionDonut } from "./AdoptionDonut";
import { ByCompanyChart } from "./ByCompanyChart";
import { ByCompanyTable } from "./ByCompanyTable";
import { RateBar } from "./RateBar";
import { SellerListDrawer, type SegmentKey } from "./SellerListDrawer";

export function FunnelContent({
  report,
  isAdmin,
  campaigns,
  distributors,
  selectedCampaignId,
  setSelectedCampaignId,
  selectedDistributorId,
  setSelectedDistributorId,
  dateFrom,
  setDateFrom,
  dateTo,
  setDateTo,
  openSegment,
  setOpenSegment,
  displayedByCompany,
  isLoadingByCompany,
}: any) {
  const { funnel, detail } = report;

  const funnelCards = [
    { key: "acceptedTerms" as SegmentKey,      label: "Aceptaron Términos",  value: funnel.acceptedTerms,    icon: <MdGavel />,     colorClass: "text-emerald-600", bgClass: "bg-emerald-50", borderClass: "border-emerald-200" },
    { key: "loggedNoTerms" as SegmentKey,      label: "Login sin T&C",        value: funnel.loggedNoTerms,    icon: <MdLogin />,     colorClass: "text-amber-600",   bgClass: "bg-amber-50",   borderClass: "border-amber-200"   },
    { key: "neverLoggedIn" as SegmentKey,      label: "Nunca ingresaron",     value: funnel.neverLoggedIn,    icon: <MdBlock />,     colorClass: "text-red-500",     bgClass: "bg-red-50",     borderClass: "border-red-200"     },
    { key: "activeInPeriod" as SegmentKey,     label: "Activos en período",   value: funnel.activeInPeriod,   icon: <MdTrendingUp />,colorClass: "text-primary",     bgClass: "bg-primary/5",  borderClass: "border-primary/30"  },
    { key: "registeredInPeriod" as SegmentKey, label: "Nuevos en período",    value: funnel.registeredInPeriod,icon: <MdPerson />,   colorClass: "text-indigo-600",  bgClass: "bg-indigo-50",  borderClass: "border-indigo-200"  },
  ];

  return (
    <>
      {/* Filters */}
      <div className="bg-white border border-slate-100 rounded-2xl p-4 shadow-sm flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row gap-4">
          {isAdmin && (
            <div className="flex-1">
              <Select label="Campaña" value={selectedCampaignId} onChange={(e) => setSelectedCampaignId(e.target.value)}
                options={[{ value: "", label: "Desde el inicio de la plataforma" }, ...campaigns.map((c: any) => ({ value: String(c.id), label: c.name || `Campaña #${c.id}` }))]} />
            </div>
          )}
          <div className="flex-1">
            <Select label="Empresa / Distribuidor" value={selectedDistributorId} onChange={(e) => setSelectedDistributorId(e.target.value)}
              options={[{ value: "", label: "Todos los distribuidores" }, ...distributors.map((d: any) => ({ value: String(d.id), label: d.companyName || `Distribuidor #${d.id}` }))]} />
          </div>
        </div>
        {isAdmin && (
          <div className="flex flex-col sm:flex-row gap-4 pt-2 border-t border-slate-50">
            <div className="flex-1">
              <Input type="date" label="Fecha Desde" value={dateFrom} onChange={(e) => { setDateFrom(e.target.value); setSelectedCampaignId(""); }} className="py-3" />
            </div>
            <div className="flex-1">
              <Input type="date" label="Fecha Hasta" value={dateTo} onChange={(e) => { setDateTo(e.target.value); setSelectedCampaignId(""); }} className="py-3" />
            </div>
          </div>
        )}
      </div>

      {report.filters.campaignName && (
        <div className="flex items-center gap-2 text-xs text-primary font-bold bg-primary/5 border border-primary/20 rounded-xl px-4 py-2.5 w-fit">
          <MdChevronRight />
          Mostrando datos de: {report.filters.campaignName}
          {report.filters.distributorName ? ` · ${report.filters.distributorName}` : ""}
        </div>
      )}

      {/* Total banner */}
      <div className="bg-white border border-slate-100 shadow-sm rounded-2xl p-6 flex flex-col sm:flex-row sm:items-center gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center text-3xl text-slate-600"><MdPeople /></div>
          <div>
            <p className="text-4xl font-black text-slate-900">{funnel.totalRegistered.toLocaleString()}</p>
            <p className="text-slate-500 text-sm font-medium">vendedores registrados en total</p>
          </div>
        </div>
        <div className="sm:ml-auto flex flex-wrap gap-6">
          <div><p className="text-2xl font-black text-emerald-600">{funnel.rates.termsAcceptanceRate}%</p><p className="text-[10px] text-slate-500 uppercase font-bold tracking-wide">aceptaron T&C</p></div>
          <div><p className="text-2xl font-black text-blue-600">{funnel.rates.loginRate}%</p><p className="text-[10px] text-slate-500 uppercase font-bold tracking-wide">alguna vez entraron</p></div>
          <div><p className="text-2xl font-black text-indigo-600">{funnel.rates.platformUsageRate}%</p><p className="text-[10px] text-slate-500 uppercase font-bold tracking-wide">activos en período</p></div>
        </div>
      </div>

      {/* Funnel cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {funnelCards.map((card) => (
          <FunnelKpiCard key={card.key} label={card.label} value={card.value} total={funnel.totalRegistered}
            icon={card.icon} colorClass={card.colorClass} bgClass={card.bgClass} borderClass={card.borderClass}
            active={openSegment === card.key} onClick={() => setOpenSegment(openSegment === card.key ? null : card.key)} />
        ))}
      </div>

      {/* Alerts */}
      {funnel.loggedNoTerms > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-start gap-3">
          <div className="p-2 bg-amber-100 rounded-xl text-amber-600 text-lg shrink-0"><MdLogin /></div>
          <div>
            <p className="text-sm font-bold text-amber-900">{funnel.loggedNoTerms} vendedor{funnel.loggedNoTerms !== 1 ? "es" : ""} iniciaron sesión pero NO aceptaron Términos y Condiciones</p>
            <p className="text-xs text-amber-700 mt-0.5">Haz clic en la tarjeta "Login sin T&C" para ver el listado.</p>
          </div>
        </div>
      )}
      {funnel.neverLoggedIn > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-4 flex items-start gap-3">
          <div className="p-2 bg-red-100 rounded-xl text-red-500 text-lg shrink-0"><MdBlock /></div>
          <div>
            <p className="text-sm font-bold text-red-900">{funnel.neverLoggedIn} vendedor{funnel.neverLoggedIn !== 1 ? "es" : ""} nunca han iniciado sesión</p>
            <p className="text-xs text-red-700 mt-0.5">Revisa si tienen sus credenciales correctamente configuradas.</p>
          </div>
        </div>
      )}

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <AdoptionDonut logged={funnel.loggedInEver} notLogged={funnel.neverLoggedIn} acceptedTerms={funnel.acceptedTerms} totalRegistered={funnel.totalRegistered} />
        <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm">
          <h3 className="font-bold text-slate-900 mb-1">Tasas de Conversión</h3>
          <p className="text-xs text-slate-500 mb-6">Del total de vendedores registrados</p>
          <div className="space-y-5">
            <RateBar label="Login alguna vez"  value={funnel.rates.loginRate}           color="#2563EB" />
            <RateBar label="Aceptaron T&C"     value={funnel.rates.termsAcceptanceRate} color="#10B981" />
            <RateBar label="Activos en período" value={funnel.rates.platformUsageRate}  color="#6366F1" />
          </div>
          <div className="mt-6 pt-5 border-t border-slate-100 grid grid-cols-3 gap-4">
            <div className="text-center"><p className="text-xl font-black text-slate-900">{funnel.loggedInEver.toLocaleString()}</p><p className="text-[10px] text-slate-500 font-bold uppercase mt-0.5">Iniciaron sesión</p></div>
            <div className="text-center border-x border-slate-100"><p className="text-xl font-black text-emerald-600">{funnel.acceptedTerms.toLocaleString()}</p><p className="text-[10px] text-slate-500 font-bold uppercase mt-0.5">Aceptaron T&C</p></div>
            <div className="text-center"><p className="text-xl font-black text-indigo-600">{funnel.activeInPeriod.toLocaleString()}</p><p className="text-[10px] text-slate-500 font-bold uppercase mt-0.5">Activos período</p></div>
          </div>
        </div>
      </div>

      {!isLoadingByCompany && displayedByCompany?.length > 0 && <ByCompanyChart data={displayedByCompany} />}
      {!isLoadingByCompany && displayedByCompany?.length > 0 && <ByCompanyTable data={displayedByCompany} />}

      <SellerListDrawer segment={openSegment} sellers={openSegment ? detail[openSegment] ?? [] : []} onClose={() => setOpenSegment(null)} />
    </>
  );
}
