import { LuCalendar, LuClock } from "react-icons/lu";

type PeriodSectionProps = {
  startDate?: string | null;
  endDate?: string | null;
  daysLeft?: number | null;
  isStoreOpen?: boolean;
  progressPercent?: number;
};

export default function PeriodSection({
  startDate,
  endDate,
  daysLeft,
  progressPercent = 0,
}: PeriodSectionProps) {
  const hasActivePeriod = Boolean(startDate && endDate);

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between px-1">
        <h2 className="text-4xl font-heading text-white">Mi Periodo Actual</h2>
      </div>

      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
        {hasActivePeriod ? (
          <>
            <div className="p-6 space-y-6">
              <div className="flex justify-between items-end">
                <div className="space-y-1">
                  <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                    Inicia
                  </span>
                  <div className="flex items-center gap-2 text-gray-700 font-bold">
                    <LuCalendar className="text-primary" />
                    <span>{startDate}</span>
                  </div>
                </div>
                <div className="text-right space-y-1">
                  <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                    Finaliza
                  </span>
                  <div className="flex items-center gap-2 text-gray-700 font-bold">
                    <span>{endDate}</span>
                    <LuCalendar className="text-primary" />
                  </div>
                </div>
              </div>

              <div className="relative">
                <div className="overflow-hidden h-3 mb-4 text-xs flex rounded-full bg-gray-100">
                  <div
                    style={{ width: `${progressPercent}%` }}
                    className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-primary transition-all duration-500"
                  />
                </div>

                <div className="flex items-center justify-center gap-2 bg-blue-50 py-3 rounded-2xl border border-blue-100">
                  <LuClock className="text-blue-600 animate-pulse" size={20} />
                  <span className="text-xl font-black text-blue-700">
                    {daysLeft} días restantes
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 px-6 py-3 border-t border-gray-100">
              <p className="text-xs text-center text-gray-500 font-medium">
                Recuerda que los canjes solo están activos durante los días de
                tienda abierta.
              </p>
            </div>
          </>
        ) : (
          <div className="p-8 flex flex-col items-center justify-center text-center space-y-4 bg-gray-50/50">
            <div className="bg-white p-4 rounded-full shadow-sm border border-gray-100">
              <LuCalendar className="text-4xl text-gray-300" />
            </div>
            <div>
              <p className="text-lg font-bold text-gray-700">
                Sin periodo activo
              </p>
              <p className="text-sm text-gray-500 mt-1 max-w-xs mx-auto">
                Actualmente no hay un periodo en curso. Vuelve más tarde para
                conocer las próximas fechas.
              </p>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
