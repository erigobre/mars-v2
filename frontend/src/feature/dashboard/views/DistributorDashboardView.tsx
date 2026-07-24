import { useNavigate } from "react-router-dom";
import { MdPeople, MdArrowForward } from "react-icons/md";
import PageHeader from "@/core/components/common/PageHeader";
import { Button } from "@/core/components/ui";
import SellersTable from "@/feature/management/sellers/components/SellersTable";
import { useSellersQuery } from "@/feature/management/sellers/services/sellerServices";
import { useAuthStore } from "@/core/stores/authStore";

export default function DistributorDashboardView() {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);

  const { data, isLoading, isPlaceholderData } = useSellersQuery(
    1,
    5,
    { distributorId: user?.id },
    { enabled: !!user?.id }
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Mi Panel"
        subtitle="Resumen de tu red comercial y accesos rápidos."
      />

      <div className="bg-white border border-gray-200 shadow-sm rounded-2xl overflow-hidden">
        <div className="bg-slate-50 px-6 py-5 border-b border-gray-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shrink-0">
              <MdPeople className="text-2xl" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 tracking-tight">
                Mi Red de Vendedores
              </h3>
              <p className="text-sm text-slate-500 font-medium mt-0.5">
                Actividad reciente en tu equipo
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            onClick={() => navigate("/distributor/sellers")}
            className="bg-white hover:bg-slate-50 border border-slate-200 shadow-sm w-full sm:w-auto"
          >
            Ver todos
            <MdArrowForward className="ml-2 text-lg text-slate-400" />
          </Button>
        </div>

        <div className="p-5">
          <SellersTable
            data={data?.items ?? []}
            isLoading={isLoading}
            isPlaceholderData={isPlaceholderData}
            onPageChange={() => {}}
            onPerPageChange={() => {}}
            onEdit={() => navigate("/sellers")}
          />
        </div>
      </div>
    </div>
  );
}
